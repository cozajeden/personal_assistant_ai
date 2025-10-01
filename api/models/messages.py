from sqlmodel import (
    Field as SQLModelField,
    SQLModel,
    Column,
    String,
    DateTime,
    Text,
    JSON,
    Integer,
)
from datetime import datetime


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    id: int = SQLModelField(default=None, primary_key=True)
    name: str = SQLModelField(sa_column=Column(String))
    created_at: Column[DateTime] = SQLModelField(
        sa_column=Column(DateTime), default_factory=datetime.now
    )

    class Config:
        arbitrary_types_allowed = True


class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id: int = SQLModelField(default=None, primary_key=True)
    conversation_id: int = SQLModelField(sa_column=Column(Integer))
    message: dict = SQLModelField(sa_column=Column(JSON))
    created_at: Column[DateTime] = SQLModelField(
        sa_column=Column(DateTime), default_factory=datetime.now
    )

    class Config:
        arbitrary_types_allowed = True
