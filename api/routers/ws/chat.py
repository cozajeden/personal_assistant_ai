from typing import Annotated
from fastapi import WebSocket, APIRouter, WebSocketDisconnect, Query
import logging
import asyncio
from agents.controller import Controller
from database import SessionDependency


router = APIRouter(prefix="/chat", tags=["chat"])


async def send_message_from_queue(websocket: WebSocket, queue: asyncio.Queue):
    try:
        while True:
            message = await queue.get()
            await websocket.send_json(message)
            queue.task_done()
    except asyncio.CancelledError:
        logging.debug("Task cancelled by client")


@router.websocket("/new")
async def chat(
    websocket: WebSocket,
    session: SessionDependency,
    conversation_id: Annotated[int, Query(min_value=0)] = 0,
):
    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue()
    task = asyncio.create_task(send_message_from_queue(websocket, queue))
    controller = Controller(queue, session)
    await controller.initialize(conversation_id=conversation_id)
    try:
        while True:
            data = await websocket.receive_json()
            response = await controller.invoke(data["content"])
    except WebSocketDisconnect:
        logging.info("WebSocket disconnected by client")
    except Exception as e:
        await websocket.send_json([{"error": str(e)}])
        logging.error(f"Error: {e}", exc_info=True)
    finally:
        try:
            task.cancel()
            await websocket.close()
        except Exception as e:
            logging.debug(f"Error: {e}")
