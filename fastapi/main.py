from fastapi import FastAPI
from database import lifespan

app = FastAPI(
    title="Ollama FastAPI Service",
    description="FastAPI service for Ollama integration with LangGraph",
    version="1.0.0",
    prefix="/api/v1",
    docs_url="/",
    lifespan=lifespan
)

# app.include_router(ollama_models_router, prefix="/ollama/models", tags=["ollama-models"])
# app.include_router(database_models_router, prefix="/models", tags=["database-models"])
# app.include_router(chat.router, prefix="/chat", tags=["chat"])
# app.include_router(stt.router, prefix="/stt", tags=["speech-to-text"])

@app.get("/")
async def root():
    return {"message": "Ollama FastAPI Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)