from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Numeric
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Ticket(Base):

    __tablename__="tickets"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    event_id=Column(
        Integer,
        ForeignKey("events.id")
    )

    ticket_type=Column(
        String(100)
    )

    price=Column(
        Numeric(12, 2),
        default=0
    )

    quota=Column(
        Integer,
        default=0
    )

    sold=Column(
        Integer,
        default=0
    )

    # relationships
    event=relationship(
        "Event",
        back_populates="tickets"
    )

    registrations=relationship(
        "Registration",
        back_populates="ticket"
    )
