from fastapi import APIRouter

from app.schemas.api import Property
from app.services import seed_loader

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=list[Property])
def list_properties() -> list[Property]:
    return seed_loader.get_properties()

