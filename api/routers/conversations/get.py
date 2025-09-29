from fastapi import APIRouter
from database import SessionDependency
from models.messages import Conversation
from typing import Annotated
from fastapi import Query
from sqlmodel import select, func

router = APIRouter(prefix="/get")


@router.get("/list")
async def list_conversations(
    session: SessionDependency,
    page: Annotated[int, Query(min_value=1)] = 1,
    limit: Annotated[int, Query(min_value=1, max_value=100)] = 20,
):
    """
    ### List the conversations.
    """
    conversations = (
        await session.exec(
            select(Conversation)
            .order_by(Conversation.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
    ).all()
    count = (await session.exec(select(func.count(Conversation.id)))).first()
    pages = count // limit
    return {
        "conversations": conversations,
        "page": page,
        "limit": limit,
        "count": count,
        "pages": pages,
    }
