from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class RegistrationCreate(BaseModel):
    event_id: int
    ticket_id: int


class RegistrationStatusUpdate(BaseModel):
    status: str
    # pending | confirmed | cancelled


class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    ticket_id: int
    registration_date: datetime
    status: str

    class Config:
        from_attributes = True


# --- Lightweight nested summaries used inside RegistrationDetailResponse ---
# (kept minimal on purpose: just enough for list/table UIs to render event
# name, date, location, and ticket type without a second round-trip per row)

class EventSummary(BaseModel):
    id: int
    title: str
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None

    class Config:
        from_attributes = True


class TicketSummary(BaseModel):
    id: int
    ticket_type: str
    price: Decimal

    class Config:
        from_attributes = True


class RegistrationDetailResponse(RegistrationResponse):
    event: Optional[EventSummary] = None
    ticket: Optional[TicketSummary] = None

    class Config:
        from_attributes = True