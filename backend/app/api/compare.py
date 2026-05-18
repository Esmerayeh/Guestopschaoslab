from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.api import CompareRequest, ComparisonOut
from app.services import run_store

router = APIRouter(prefix="/api/compare", tags=["compare"])


@router.post("", response_model=ComparisonOut)
def compare_agents(request: CompareRequest, db: Session = Depends(get_db)) -> ComparisonOut:
    return run_store.create_comparison(db, request.scenario_id, request.agent_versions)

