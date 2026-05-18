from fastapi import APIRouter, HTTPException

from app.schemas.api import Reservation
from app.services import seed_loader

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.get("/{booking_id}", response_model=Reservation)
def get_reservation(booking_id: str) -> Reservation:
    reservation = seed_loader.get_reservation(booking_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail=f"Unknown reservation: {booking_id}")
    return reservation

