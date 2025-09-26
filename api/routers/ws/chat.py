from fastapi import WebSocket, APIRouter, WebSocketDisconnect
from email import message
from typing import TypedDict, List, Union, Annotated, Sequence, Callable
from httpx import stream
from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from pprint import pprint, pformat
import logging
import os, time, traceback, subprocess, random, asyncio

from starlette.routing import request_response

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    model_name: str
    llm: BaseChatModel
    queue: asyncio.Queue


@tool
def add(a: int, b: int) -> int:
    """This tool adds two numbers a and b and returns the result"""
    return a + b


@tool
def subtract(a: int, b: int) -> int:
    """This tool subtracts two numbers a and b and returns the result"""
    return a - b


@tool
def multiply(a: int, b: int) -> int:
    """This tool multiplies two numbers a and b and returns the result"""
    return a * b


async def model_call(state: AgentState):
    response = state["llm"].astream_events(state["messages"])
    response_type = "AI"
    async for event in response:
        response = {
            "event": event["event"],
        }
        if response["event"] in ["on_chat_model_start", "on_chat_model_end"]:
            continue
        elif response["event"] == "on_chat_model_stream":
            response["content"] = event["data"]["chunk"].content
            response["id"] = event["data"]["chunk"].id
            response["streaming"] = True
            if response["content"] == "<think>":
                response_type = "THINK"
                response["content"] = ""
            elif response["content"] == "</think>":
                response["streaming"] = False
                response_type = "AI"
                response["content"] = ""
        else:
            raise ValueError(f"Unknown event: {response['event']}")

        if response_type == "THINK":
            response["id"] += '_think'
        response["type"] = response_type
        await state["queue"].put(response)
    data = dict(event["data"]["output"])
    data["type"] = "ai"
    return {"messages": [data]}


def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if not last_message.tool_calls:
        return "end"
    else:
        return "continue"


graph = StateGraph(AgentState)
graph.add_node("our_agent", model_call)

tools = [add, subtract, multiply]

tool_node = ToolNode(tools=tools)
graph.add_node("tools", tool_node)


graph.add_edge(START, "our_agent")
graph.add_conditional_edges(
    "our_agent", should_continue, path_map={"continue": "tools", "end": END}
)
graph.add_edge("tools", "our_agent")

agent = graph.compile()
model_name = "gemma3:270m"


async def get_llm(model_name: str) -> BaseChatModel:
    return ChatOllama(
        base_url="http://ollama:11434",
        model=model_name,
        temperature=0.7,
        stream=True,
    )


router = APIRouter(prefix="/chat", tags=["chat"])


async def send_message_from_queue(websocket: WebSocket, queue: asyncio.Queue):
    while True:
        message = await queue.get()
        await websocket.send_json([dict(message)])
        queue.task_done()


@router.websocket("/new")
async def chat(websocket: WebSocket):
    global model_name
    await websocket.accept()
    queue = asyncio.Queue()
    task = asyncio.create_task(send_message_from_queue(websocket, queue))
    state_messages = [
        SystemMessage(
            content="""You are perfect planner for given tasks,
            you always break down the task into smaller tasks and plan the best way to solve the task.
            You answer in short and concise manner,
            You will response with only the list of steps needed to solve the task, no other text.
            The list is in html format, with <ol> and <li> tags."""
        ),
    ]
    await websocket.send_json([dict(message) for message in state_messages])
    while True:
        try:
            data = await websocket.receive_json()
            state_messages.append(HumanMessage(content=data["content"]))
            await queue.put(state_messages[-1])
            response = await agent.ainvoke(
                {
                    "messages": state_messages,
                    "model_name": model_name,
                    "llm": await get_llm(model_name),
                    "queue": queue,
                },
                stream_mode="values",
            )
            state_messages = response["messages"]
        except WebSocketDisconnect:
            logging.info("WebSocket disconnected")
            break
        except Exception as e:
            await websocket.send_json([{"error": str(e)}])
            logging.error(f"Error: {e}", exc_info=True)
