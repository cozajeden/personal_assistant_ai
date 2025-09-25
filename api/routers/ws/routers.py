from fastapi import APIRouter
from .chat import router as chat_router

router = APIRouter(prefix="/ws", tags=["ws"])

router.include_router(chat_router)
