from sqlmodel import (
    Field,
    SQLModel,
    Column,
    String,
    DateTime,
    Text,
    Integer,
    BigInteger,
    Boolean,
    Float,
    JSON,
)
from typing import Optional


class StoredModels(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    model_name: str = Field(sa_column=Column(String, unique=True))
    model_base_name: str = Field(default="", sa_column=Column(String))
    model_version: str = Field(default="", sa_column=Column(String))
    model_description: str = Field(default="", sa_column=Column(Text))
    context_window: int = Field(default=0, sa_column=Column(Integer))
    tools: bool = Field(default=False, sa_column=Column(Boolean))
    tools_description: str = Field(default="", sa_column=Column(Text))
    thinking: bool = Field(default=False, sa_column=Column(Boolean))
    vision: bool = Field(default=False, sa_column=Column(Boolean))
    size: int = Field(default=0, sa_column=Column(BigInteger))
    completion: bool = Field(default=False, sa_column=Column(Boolean))
    insert: bool = Field(default=False, sa_column=Column(Boolean))
    embedding: bool = Field(default=False, sa_column=Column(Boolean))
    capabilities: dict = Field(default={}, sa_column=Column(JSON))