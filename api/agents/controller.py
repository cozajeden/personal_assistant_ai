
from langchain_core.messages import HumanMessage, BaseMessage, SystemMessage
import logging
import asyncio
from langchain_core.runnables import Runnable
from langchain_ollama import ChatOllama
from models.stored_models import StoredModels
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
        stream_mode: str = "values",
        temperature: float = 0.7,
    ):
        self.messages: List[BaseMessage] = []
        self.session = session
        self.response_queue = response_queue
        self.stream_mode = stream_mode
        self.temperature = temperature
        self.model: Optional[StoredModels] = None
        self.llm: Optional[Runnable] = None
        self.system_message: SystemMessage = SystemMessage(
            content="""You are helpful assistant.
        When tool didn't find the answer, you should try it again with different query."""
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
        async for event in async_iterator:
            logging.info(f"Event in loop: {event}")
            response = {
                "event": event["event"],
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
                await self.response_queue.put([response])
        data = dict(event["data"]["output"])
        logging.info(f"Data in loop: {dir(response)}")
        data["type"] = "ai"
        return {"messages": [data]}

    async def invoke(self, human_message: HumanMessage, stream_mode: str = "values"):
        self.clear_messages()
        await self.add_message(self.system_message)
        await self.add_message(human_message)
        await self.set_model("qwen3-coder:30b", self.session)
        assert self.model is not None
        await self.set_llm(self.model)
        assert self.llm is not None
        agent = get_tool_first_agent(self.model_call)
        response = await agent.ainvoke({"messages": self.messages})
        await self.add_message(response["messages"][-1])
        return response

    async def add_message(self, message: BaseMessage):
        self.messages.append(message)
        return self.messages

    async def get_messages(self):
        return self.messages

    async def clear_messages(self):
        self.messages = []
