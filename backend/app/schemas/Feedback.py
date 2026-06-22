from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    event_id: int
    rating: int
    comment: Optional[str] = None


class FeedbackReply(BaseModel):
    organizer_reply: str


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    organizer_reply: Optional[str] = None
    replied_at: Optional[datetime] = None

    class Config:
        from_attributes = True
