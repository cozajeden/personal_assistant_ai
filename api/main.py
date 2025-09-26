from fastapi import FastAPI
from database import lifespan
from routers import routers
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://react:5173",
]

app = FastAPI(
    title="Ollama FastAPI Service",
    description="FastAPI service for Ollama integration with LangGraph",
    version="1.0.0",
    prefix="/api/v1",
    docs_url="/",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Ollama FastAPI Service is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}