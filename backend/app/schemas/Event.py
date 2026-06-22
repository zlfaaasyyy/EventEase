from pydantic import BaseModel
from typing import Optional
from typing import List
from datetime import datetime

from app.schemas.Ticket import TicketCreate
from app.schemas.Ticket import TicketResponse
from app.schemas.Category import CategoryResponse


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    banner_url: Optional[str] = None
    category_id: Optional[int] = None
    tickets: Optional[List[TicketCreate]] = []


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    banner_url: Optional[str] = None
    category_id: Optional[int] = None


class EventStatusUpdate(BaseModel):
    status: str
    # draft | pending_approval | published | ended | rejected


class OrganizerSummary(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    banner_url: Optional[str] = None
    organizer_id: int
    category_id: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EventDetailResponse(EventResponse):
    organizer: Optional[OrganizerSummary] = None
    category: Optional[CategoryResponse] = None
    tickets: List[TicketResponse] = []

    class Config:
        from_attributes = True
