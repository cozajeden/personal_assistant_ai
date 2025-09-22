from database import SessionDependency
from models.stored_models import StoredModels
import httpx
import settings
from sqlmodel import select


async def update_list(session: SessionDependency):
    """
    ### Update the models in the database.
    - Models list will be fetched from Ollama.
    - Models will be added to the database if they are not already in the database.
    """
    async with httpx.AsyncClient() as client:
        ollama_models = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")

    stored_models = (await session.exec(select(StoredModels))).all()
    stored_model_names = [m.model_name for m in stored_models]

    for model in ollama_models.json()["models"]:
        if model["model"] not in stored_model_names:
            session.add(
                StoredModels(
                    model_name=model["model"],
                    size=model["size"],
                )
            )

    await session.commit()
    return {"message": "Models updated", "ollama_models": ollama_models.json()}
