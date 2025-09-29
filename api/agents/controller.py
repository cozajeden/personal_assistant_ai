from email import message
from langchain_core.messages import (
    HumanMessage,
    BaseMessage,
    SystemMessage,
    ToolMessage,
)
import logging
import asyncio
from langchain_core.runnables import Runnable
from langchain_ollama import ChatOllama
from models.stored_models import StoredModels
from models.messages import Conversation, Message
from .tool_first import get_tool_first_agent, tools
import settings
from .variables import AgentState
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional


class Controller:
    def __init__(
        self,
        response_queue: asyncio.Queue,
        session: AsyncSession,
        temperature: float = 0.7,
    ):
        self.messages: List[BaseMessage] = []
        self.sent_count = 0
        self.session = session
        self.response_queue = response_queue
        self.temperature = temperature
        self.model: Optional[StoredModels] = None
        self.llm: Optional[Runnable] = None
        self.conversation: Optional[Conversation] = None
        self.message: Optional[Message] = None
        self.system_message: SystemMessage = SystemMessage(
            content="""You are helpful assistant.
        When tool didn't find the answer, you should try it again with different query.
        You will always do 2 queries to the tool, per tool."""
        )

    async def set_model(self, model_name: str, session: AsyncSession) -> None:
        self.model = (
            await session.exec(
                select(StoredModels).where(StoredModels.model_name == model_name)
            )
        ).first()

    async def get_llm(self, model: StoredModels) -> ChatOllama:
        return ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=model.model_name,
            temperature=self.temperature,
        )

    async def set_llm(self, model: StoredModels) -> None:
        self.llm = await self.get_llm(model)
        if model.tools and self.llm is not None:
            self.llm = self.llm.bind_tools(tools)

    async def model_call(self, state: AgentState):
        assert self.llm is not None
        async_iterator = self.llm.astream_events(state["messages"])
        response_type = "generating"

        db_message = await self.save_message_to_database(
            {"content": "Generating response...", "type": "ai"}
        )
        async for event in async_iterator:
            response = {
                "event": event["event"],
                "message_id": db_message.id,
            }
            if response["event"] in ["on_chat_model_start", "on_chat_model_end"]:
                continue
            elif response["event"] == "on_chat_model_stream":
                response["content"] = event["data"]["chunk"].content
                response["id"] = event["data"]["chunk"].id
            else:
                raise ValueError(f"Unknown event: {response['event']}")

            response["type"] = response_type
            if response["content"]:
                await self.response_queue.put(
                    [dict(response) | {"message_id": db_message.id}]
                )
        data = dict(event["data"]["output"])
        data["type"] = "ai"
        data["message_id"] = db_message.id
        db_message.message = data
        await self.update_message_in_database(db_message)
        return {"messages": [data]}

    async def start_new_conversation(self, model_name: str):
        self.conversation = Conversation(name=model_name)
        self.session.add(self.conversation)
        await self.session.commit()
        system_message = Message(
            conversation_id=self.conversation.id, message=dict(self.system_message)
        )
        self.session.add(system_message)
        await self.session.commit()
        await self.response_queue.put(
            [system_message.message | {"message_id": system_message.id}]
        )
        self.system_message.additional_kwargs["message_id"] = system_message.id
        self.add_message(self.system_message)

    async def load_conversation(self, conversation_id: int):
        self.conversation = await self.session.get(Conversation, conversation_id)
        stored_messages = await self.session.exec(
            select(Message).where(Message.conversation_id == conversation_id)
        )
        for message in stored_messages:
            self.add_message(message=message.message | {"message_id": message.id})
        await self.response_queue.put(self.messages)
        assert self.conversation is not None

    async def initialize(
        self,
        model_name: str = "qwen3:4b",
        temperature: float = 0.7,
        conversation_id: int = 0,
    ):
        """
        Initialize the controller.
        You should call this method before using the controller.
        It sets the model and the llm, it also clears the messages,
        so you can call this function to reset the controller.

        Args:
            model_name: The name of the model to use.
            temperature: The temperature of the model.
        """
        self.clear_messages()
        self.temperature = temperature
        await self.set_model(model_name, self.session)

        # Start conversation and add system message
        if conversation_id == 0:
            await self.start_new_conversation(model_name)
        else:
            await self.load_conversation(conversation_id)

        assert self.conversation is not None
        self.sent_count = len(self.messages)
        assert self.model is not None
        await self.set_llm(self.model)
        assert self.llm is not None

    async def invoke(self, message: str) -> AgentState:
        """
        Invoke the controller.
        You should call this method to invoke the controller.
        For continuous conversation, you should call this method multiple times.
        You should call this method after calling the initialize method.

        Args:
            message: The human message to invoke the controller.
        """
        # Handle human message
        human_message = HumanMessage(content=message)
        human_message_id = (await self.save_message_to_database(human_message)).id
        human_message.additional_kwargs["message_id"] = human_message_id
        self.add_message(human_message)
        await self.response_queue.put(
            [dict(human_message) | {"message_id": human_message_id}]
        )

        # Call agent
        agent = get_tool_first_agent(self.model_call)
        response = await agent.ainvoke(
            {"messages": [self.system_message] + self.messages}
        )

        # Handle agent response
        for message in response["messages"][self.sent_count + 1 :]:
            if "message_id" not in message.additional_kwargs:
                db_message = await self.save_message_to_database(message)
                message.additional_kwargs["message_id"] = db_message.id
            self.add_message(message)
        await self.response_queue.put(
            [
                dict(msg) | {"message_id": (msg.additional_kwargs["message_id"])}
                for msg in self.messages[self.sent_count + 1 :]
            ]
        )
        self.sent_count = len(self.messages)

        return response

    async def save_message_to_database(self, message: BaseMessage | dict) -> Message:
        assert self.conversation is not None
        db_message = Message(
            conversation_id=self.conversation.id, message=dict(message)
        )
        self.session.add(db_message)
        await self.session.commit()
        return db_message

    async def update_message_in_database(self, message: Message) -> Message:
        self.session.add(message)
        await self.session.commit()
        return message

    def add_message(self, message: BaseMessage):
        self.messages.append(message)
        return self.messages

    def get_messages(self):
        return self.messages

    def clear_messages(self):
        self.messages = []
