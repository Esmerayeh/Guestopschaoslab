import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.schemas.api import AgentVersion, Property, Reservation, Scenario

SEED_DIR = Path(__file__).resolve().parents[1] / "seed"


def _load_json(filename: str) -> list[dict[str, Any]]:
    with (SEED_DIR / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache
def get_properties() -> list[Property]:
    return [Property(**item) for item in _load_json("properties.json")]


@lru_cache
def get_kb_chunks() -> list[dict[str, Any]]:
    return _load_json("kb_chunks.json")


@lru_cache
def get_reservations() -> list[Reservation]:
    return [Reservation(**item) for item in _load_json("reservations.json")]


@lru_cache
def get_scenarios() -> list[Scenario]:
    return [Scenario(**item) for item in _load_json("scenarios.json")]


@lru_cache
def get_agent_versions() -> list[AgentVersion]:
    return [AgentVersion(**item) for item in _load_json("agent_versions.json")]


def get_scenario(scenario_id: str) -> Scenario | None:
    return next((scenario for scenario in get_scenarios() if scenario.id == scenario_id), None)


def get_property(property_id: str) -> Property | None:
    return next((property_item for property_item in get_properties() if property_item.id == property_id), None)


def get_reservation(booking_id: str) -> Reservation | None:
    return next((reservation for reservation in get_reservations() if reservation.booking_id == booking_id), None)


def get_agent_version(agent_version_id: str) -> AgentVersion | None:
    return next((agent for agent in get_agent_versions() if agent.id == agent_version_id), None)

