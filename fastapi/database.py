from sqlmodel import SQLModel, create_engine
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import Annotated
import os


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://ollama_user:ollama_password@0.0.0.0:5432/ollama_fastapi",
)

engine = create_async_engine(DATABASE_URL, echo=True, future=True)


async def close_db():
    global engine

    if engine:
        engine.dispose()
        engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_db()


async def get_session() -> AsyncSession:
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

SessionDependency = Annotated[AsyncSession, Depends(get_session)]