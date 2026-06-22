from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):

    __tablename__="users"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    name=Column(
        String(255)
    )

    email=Column(
        String(255),
        unique=True
    )

    password=Column(
        String(255)
    )

    role=Column(
        String(50),
        default="user"
    )

    # extended fields (not in original ERD, required by UI)
    status=Column(
        String(50),
        default="active"
        # active | pending | suspended | rejected
        # organizer registers -> "pending" until approved by admin
        # regular user registers -> "active" immediately
    )

    phone=Column(
        String(50),
        nullable=True
    )

    bio=Column(
        String(255),
        nullable=True
    )

    avatar_url=Column(
        String(500),
        nullable=True
    )

    # extended field (not in original ERD, required by UI "Organizer Profile")
    organization_name=Column(
        String(255),
        nullable=True
    )

    created_at=Column(
        DateTime,
        server_default=func.now()
    )

    # relationships
    events=relationship(
        "Event",
        back_populates="organizer",
        foreign_keys="Event.organizer_id"
    )

    registrations=relationship(
        "Registration",
        back_populates="user"
    )

    feedbacks=relationship(
        "Feedback",
        back_populates="user"
    )

    favorites=relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan"
    )