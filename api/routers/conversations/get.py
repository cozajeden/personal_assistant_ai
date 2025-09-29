from fastapi import APIRouter
from database import SessionDependency
from models.messages import Conversation
from sqlmodel import select

router = APIRouter(prefix="/get")


@router.get("/list")
async def list_conversations(session: SessionDependency):
    """
    ### List the conversations.
    """
    conversations = (await session.exec(
        select(Conversation).order_by(Conversation.created_at.desc())
    )).all()
    return {"conversations": conversations}
