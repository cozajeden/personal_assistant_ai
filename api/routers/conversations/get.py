from fastapi import APIRouter
from database import SessionDependency
from models.messages import Conversation
from typing import Annotated
from pydantic import Query
from sqlmodel import select

router = APIRouter(prefix="/get")


@router.get("/list")
async def list_conversations(
    session: SessionDependency,
    limit: Annotated[int, Query(min_value=1, max_value=100)] = 10,
):
    """
    ### List the conversations.
    """
    conversations = (
        await session.exec(
            select(Conversation).order_by(Conversation.created_at.desc()).limit(limit)
        )
    ).all()
    return {"conversations": conversations}
