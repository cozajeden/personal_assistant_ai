from fastapi import APIRouter
from .get import router as get_conversation_router


router = APIRouter(prefix="/conversations", tags=["conversations"])

router.include_router(get_conversation_router, tags=["get"])
