from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class Registration(Base):

    __tablename__="registrations"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id=Column(
        Integer,
        ForeignKey("users.id")
    )

    event_id=Column(
        Integer,
        ForeignKey("events.id")
    )

    ticket_id=Column(
        Integer,
        ForeignKey("tickets.id")
    )

    registration_date=Column(
        DateTime,
        server_default=func.now()
    )

    status=Column(
        String(50),
        default="pending"
        # pending | confirmed | cancelled
    )

    # relationships
    user=relationship(
        "User",
        back_populates="registrations"
    )

    event=relationship(
        "Event",
        back_populates="registrations"
    )

    ticket=relationship(
        "Ticket",
        back_populates="registrations"
    )

    payments=relationship(
        "Payment",
        back_populates="registration",
        cascade="all, delete-orphan"
    )

    attendance=relationship(
        "EventAttendance",
        back_populates="registration",
        uselist=False,
        cascade="all, delete-orphan"
    )
