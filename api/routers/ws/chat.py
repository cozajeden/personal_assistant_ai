from fastapi import WebSocket, APIRouter, WebSocketDisconnect
from langchain_core.messages import HumanMessage
import logging
import asyncio
from agents.controller import Controller
from database import SessionDependency



router = APIRouter(prefix="/chat", tags=["chat"])


async def send_message_from_queue(websocket: WebSocket, queue: asyncio.Queue):
    try:
        while True:
            message = await queue.get()
            await websocket.send_json([dict(message) for message in message])
            queue.task_done()
    except asyncio.CancelledError:
        logging.info("Task cancelled")


@router.websocket("/new")
async def chat(websocket: WebSocket, session: SessionDependency):
    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue()
    controller = Controller(queue, session)
    task = asyncio.create_task(send_message_from_queue(websocket, queue))
    try:
        while True:
            data = await websocket.receive_json()
            human_message = HumanMessage(content=data["content"])
            await queue.put([human_message])
            response = await controller.invoke(human_message)
            await queue.put([response["messages"][-1]])
    except WebSocketDisconnect:
        logging.info("WebSocket disconnected")
    except Exception as e:
        await websocket.send_json([{"error": str(e)}])
        logging.error(f"Error: {e}", exc_info=True)
    finally:
        await websocket.close()
        await task.cancel()
