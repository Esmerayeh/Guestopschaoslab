from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.api import ComparisonOut
from app.services import run_store

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/best", response_model=ComparisonOut)
def run_best_demo(db: Session = Depends(get_db)) -> ComparisonOut:
    return run_store.run_best_demo(db)

