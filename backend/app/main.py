from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import compare, demo, evals, health, properties, reservations, runs, scenarios
from app.config import get_settings
from app.db import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(
    title="GuestOps Chaos Lab API",
    description="Reliability simulator APIs for hospitality AI concierge agents.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(scenarios.router)
app.include_router(properties.router)
app.include_router(reservations.router)
app.include_router(runs.router)
app.include_router(compare.router)
app.include_router(demo.router)
app.include_router(evals.router)
