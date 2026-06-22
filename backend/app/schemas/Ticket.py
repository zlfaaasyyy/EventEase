from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class TicketCreate(BaseModel):
    ticket_type: str
    price: Decimal = Decimal("0")
    quota: int = 0


class TicketUpdate(BaseModel):
    ticket_type: Optional[str] = None
    price: Optional[Decimal] = None
    quota: Optional[int] = None


class TicketResponse(BaseModel):
    id: int
    event_id: int
    ticket_type: str
    price: Decimal
    quota: int
    sold: int

    class Config:
        from_attributes = True
