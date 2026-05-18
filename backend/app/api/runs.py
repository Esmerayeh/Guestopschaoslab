from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.api import AgentRunOut, RunReportOut, RunRequest, ToolCallOut
from app.services import run_store

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.post("", response_model=AgentRunOut)
def create_run(request: RunRequest, db: Session = Depends(get_db)) -> AgentRunOut:
    return run_store.create_run(db, request.scenario_id, request.agent_version)


@router.get("/{run_id}", response_model=AgentRunOut)
def get_run(run_id: str, db: Session = Depends(get_db)) -> AgentRunOut:
    return run_store.get_run(db, run_id)


@router.get("/{run_id}/trace", response_model=list[ToolCallOut])
def get_trace(run_id: str, db: Session = Depends(get_db)) -> list[ToolCallOut]:
    return run_store.get_trace(db, run_id)


@router.get("/{run_id}/report", response_model=RunReportOut)
def get_report(run_id: str, db: Session = Depends(get_db)) -> RunReportOut:
    return run_store.get_report(db, run_id)

