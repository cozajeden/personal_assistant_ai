from database import SessionDependency
from models.stored_models import StoredModels, StoredModelsFilters
from typing import Annotated
from fastapi import APIRouter, Query
import httpx
import settings
from sqlmodel import select

router = APIRouter(prefix="/get")


@router.get("/ollama_list")
async def ollama_list():
    """
    ### show the models list from Ollama.
    """
    async with httpx.AsyncClient() as client:
        ollama_models = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")

    return {"message": "Models from Ollama", "ollama_models": ollama_models.json()}


@router.get("/db_list")
async def db_list(
    filters: Annotated[StoredModelsFilters, Query()],
    session: SessionDependency,
):
    """
    ### show the models list from database.
    """
    database_models = (await session.exec(filters.get_query_filtered())).all()

    return {
        "message": "Models from database",
        "database_models": database_models,
        "filters": filters,
    }


@router.post("/ollama_show")
async def ollama_show(model_name: str):
    """
    ### Show the model information from Ollama.
    """
    async with httpx.AsyncClient() as client:
        ollama_model = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/show",
            json={"model": model_name},
        )
    return {
        "message": "Model information from Ollama",
        "ollama_model": ollama_model.json(),
    }


@router.post("/db_show")
async def db_show(model_name: str, session: SessionDependency):
    """
    ### Show the model information from database.
    """
    database_model = (
        await session.exec(
            select(StoredModels).where(StoredModels.model_name == model_name)
        )
    ).first()
    return {
        "message": "Model information from database",
        "database_model": database_model,
    }
