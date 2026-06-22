from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class PaymentCreate(BaseModel):
    registration_id: int
    payment_method: str
    # credit_card | bank_transfer | e_wallet


class PaymentStatusUpdate(BaseModel):
    payment_status: str
    # pending | paid | failed | refunded


class PaymentResponse(BaseModel):
    id: int
    registration_id: int
    amount: Decimal
    payment_method: Optional[str] = None
    payment_status: str
    transaction_date: datetime

    class Config:
        from_attributes = True
