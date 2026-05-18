from fastapi import APIRouter, HTTPException

from app.schemas.api import Scenario
from app.services import seed_loader

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.get("", response_model=list[Scenario])
def list_scenarios() -> list[Scenario]:
    return seed_loader.get_scenarios()


@router.get("/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: str) -> Scenario:
    scenario = seed_loader.get_scenario(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"Unknown scenario: {scenario_id}")
    return scenario

