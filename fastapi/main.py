from fastapi import FastAPI
from database import lifespan
from routers import routers

app = FastAPI(
    title="Ollama FastAPI Service",
    description="FastAPI service for Ollama integration with LangGraph",
    version="1.0.0",
    prefix="/api/v1",
    docs_url="/",
    lifespan=lifespan,
)

for router in routers:
    app.include_router(router[1], prefix=router[0], tags=[router[0]])

@app.get("/")
async def root():
    return {"message": "Ollama FastAPI Service is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
