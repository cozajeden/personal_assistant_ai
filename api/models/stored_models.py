from sqlmodel import (
    Field as SQLModelField,
    SQLModel,
    Column,
    String,
    Text,
    Integer,
    BigInteger,
    Boolean,
    JSON,
)
from pydantic import BaseModel, Field as PydanticField
from sqlmodel import select


class StoredModels(SQLModel, table=True):
    id: int = SQLModelField(default=None, primary_key=True)
    model_name: str = SQLModelField(sa_column=Column(String, unique=True))
    model_base_name: str = SQLModelField(default="", sa_column=Column(String))
    model_version: str = SQLModelField(default="", sa_column=Column(String))
    model_description: str = SQLModelField(default="", sa_column=Column(Text))
    context_window: int = SQLModelField(default=0, sa_column=Column(Integer))
    tools: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    tools_description: str = SQLModelField(default="", sa_column=Column(Text))
    thinking: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    vision: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    size: int = SQLModelField(default=0, sa_column=Column(BigInteger))
    completion: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    insert: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    embedding: bool = SQLModelField(default=False, sa_column=Column(Boolean))
    capabilities: dict = SQLModelField(default={}, sa_column=Column(JSON))


class StoredModelsFilters(BaseModel):
    # Filtering
    model_name: str = PydanticField("", description="Model name")
    context_window_gte: int = PydanticField(
        0, ge=0, description="Context window greater than or equal to"
    )
    context_window_lte: int = PydanticField(
        0, ge=0, description="Context window less than or equal to"
    )
    tools: bool | None = PydanticField(None, description="Tools")
    thinking: bool | None = PydanticField(None, description="Thinking")
    vision: bool | None = PydanticField(None, description="Vision")
    size_gte: int = PydanticField(0, ge=0, description="Size greater than or equal to")
    size_lte: int = PydanticField(0, ge=0, description="Size less than or equal to")
    completion: bool | None = PydanticField(None, description="Completion")
    insert: bool | None = PydanticField(None, description="Insert")
    embedding: bool | None = PydanticField(None, description="Embedding")

    # Sorting
    model_name_asc: bool | None = PydanticField(None, description="Model name asc")
    context_window_asc: bool | None = PydanticField(
        None, description="Context window asc"
    )
    tools_asc: bool | None = PydanticField(None, description="Tools asc")
    thinking_asc: bool | None = PydanticField(None, description="Thinking asc")
    vision_asc: bool | None = PydanticField(None, description="Vision asc")
    size_asc: bool | None = PydanticField(None, description="Size asc")
    completion_asc: bool | None = PydanticField(None, description="Completion asc")
    insert_asc: bool | None = PydanticField(None, description="Insert asc")
    embedding_asc: bool | None = PydanticField(None, description="Embedding asc")

    def get_query_filtered(self):
        query = select(StoredModels)
        if self.model_name:
            query = query.where(StoredModels.model_name.icontains(self.model_name))
        for column, value in iter(self):
            if value is not None and value != 0 and column != "model_name":
                if column.endswith("_gte"):
                    query = query.where(getattr(StoredModels, column[:-4]) >= value)
                elif column.endswith("_lte"):
                    query = query.where(getattr(StoredModels, column[:-4]) <= value)
                elif column.endswith("_asc"):
                    if value:
                        query = query.order_by(getattr(StoredModels, column[:-4]).asc())
                    else:
                        query = query.order_by(
                            getattr(StoredModels, column[:-4]).desc()
                        )
                else:
                    query = query.where(getattr(StoredModels, column) == value)
        return query
