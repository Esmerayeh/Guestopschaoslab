from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.api import EvalSummaryOut
from app.services import run_store

router = APIRouter(prefix="/api/evals", tags=["evals"])


@router.get("/summary", response_model=EvalSummaryOut)
def eval_summary(db: Session = Depends(get_db)) -> EvalSummaryOut:
    return run_store.get_eval_summary(db)

