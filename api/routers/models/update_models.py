from database import SessionDependency
from models.stored_models import StoredModels
from fastapi import APIRouter
import httpx
import settings
from sqlmodel import select, update, delete
import traceback

router = APIRouter(prefix="/update")

@router.post("/update_list")
async def update_list(session: SessionDependency):
    """
    ### Update the models in the database.
    - Models list will be fetched from Ollama.
    - Models will be added to the database if they are not already in the database.
    > Older models will remain in the database.
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
        else:
            session.exec(
                update(StoredModels)
                .where(StoredModels.model_name == model["model"])
                .values(size=model["size"])
            )

    await session.commit()
    return {"message": "Models updated", "ollama_models": ollama_models.json()}

@router.post("/upgrade_list")
async def upgrade_list(session: SessionDependency):
    """
    ### Upgrade the models in the database.
    - Models list will be fetched database.
    - For each model, the metadata will be fetched from Ollama.
    - The model metadata will be updated in the database.
    """
    try:
        database_models = (await session.exec(select(StoredModels))).all()
        async with httpx.AsyncClient() as client:
            for model in database_models:
                ollama_model = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/show",
                    json={"model": model.model_name},
                )
                json_response = ollama_model.json()
                if "model_info" in json_response:
                    context_window = [
                        key
                        for key in json_response["model_info"]
                        if key.find("context_length") != -1
                    ]
                    if len(context_window) > 0:
                        model.context_window = json_response["model_info"][context_window[0]]
                    model.tools = "tools" in json_response["capabilities"]
                    model.thinking = "thinking" in json_response["capabilities"]
                    model.vision = "vision" in json_response["capabilities"]
                    model.completion = "completion" in json_response["capabilities"]
                    model.insert = "insert" in json_response["capabilities"]
                    model.embedding = "embedding" in json_response["capabilities"]
                    model.capabilities = json_response["capabilities"]
                    session.add(model)
        await session.commit()
        return {"message": "Models upgraded"}
    except Exception as e:
        traceback.print_exc()
        return {"message": "Error upgrading models", "error": str(e),}


@router.post("/delete_model_from_database")
async def delete_model_from_database(model_name: str, session: SessionDependency):
    """
    ### Delete the model from the database.
    """
    session.exec(delete(StoredModels).where(StoredModels.model_name == model_name))
    await session.commit()
    return {"message": "Model deleted from database"}