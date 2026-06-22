from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
