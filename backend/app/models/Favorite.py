from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Favorite(Base):

    __tablename__="favorites"

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

    created_at=Column(
        DateTime,
        server_default=func.now()
    )

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_user_event_favorite"),
    )

    # relationships
    user=relationship(
        "User",
        back_populates="favorites"
    )

    event=relationship(
        "Event",
        back_populates="favorited_by"
    )
