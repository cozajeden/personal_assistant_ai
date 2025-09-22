from sqlmodel import Field, SQLModel, Column, String, DateTime, Text, Integer, Boolean
from typing import Optional

class StoredModels(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    model_name: str = Field(sa_column=Column(String, unique=True))
    model_base_name: str = Field(default=None, sa_column=Column(String))
    model_version: str = Field(default=None, sa_column=Column(String))
    model_description: str = Field(default=None, sa_column=Column(Text))
    context_window: int = Field(default=None, sa_column=Column(Integer))