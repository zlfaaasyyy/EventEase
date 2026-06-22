from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class SubscriptionResponse(BaseModel):
    id: int
    organizer_id: int
    plan: str
    price: Decimal
    status: str
    started_at: datetime
    next_billing_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionUpgrade(BaseModel):
    plan: str
    # free | pro
