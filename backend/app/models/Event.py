from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class Event(Base):

    __tablename__="events"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    title=Column(
        String(255)
    )

    description=Column(
        Text,
        nullable=True
    )

    start_date=Column(
        DateTime
    )

    end_date=Column(
        DateTime
    )

    location=Column(
        String(255),
        nullable=True
    )

    # extended field (not in original ERD, required by UI "Schedule & Location" -> venue + address)
    venue_name=Column(
        String(255),
        nullable=True
    )

    address=Column(
        String(255),
        nullable=True
    )

    # extended field (not in original ERD, required by UI "Event Banner")
    banner_url=Column(
        String(500),
        nullable=True
    )

    organizer_id=Column(
        Integer,
        ForeignKey("users.id")
    )

    category_id=Column(
        Integer,
        ForeignKey("categories.id")
    )

    status=Column(
        String(50),
        default="draft"
        # draft | pending_approval | published | ended | rejected
    )

    created_at=Column(
        DateTime,
        server_default=func.now()
    )

    # relationships
    organizer=relationship(
        "User",
        back_populates="events",
        foreign_keys=[organizer_id]
    )

    category=relationship(
        "Category",
        back_populates="events"
    )

    tickets=relationship(
        "Ticket",
        back_populates="event",
        cascade="all, delete-orphan"
    )

    registrations=relationship(
        "Registration",
        back_populates="event"
    )

    feedbacks=relationship(
        "Feedback",
        back_populates="event"
    )

    favorited_by=relationship(
        "Favorite",
        back_populates="event",
        cascade="all, delete-orphan"
    )
