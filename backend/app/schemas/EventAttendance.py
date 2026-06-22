from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckInRequest(BaseModel):
    registration_id: int


class AttendanceResponse(BaseModel):
    id: int
    registration_id: int
    check_in_time: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True
