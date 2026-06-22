from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class Feedback(Base):

    __tablename__="feedback"

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

    rating=Column(
        Integer
    )

    comment=Column(
        Text,
        nullable=True
    )

    created_at=Column(
        DateTime,
        server_default=func.now()
    )

    # extended fields (not in original ERD, required by UI "Organizer replied")
    organizer_reply=Column(
        Text,
        nullable=True
    )

    replied_at=Column(
        DateTime,
        nullable=True
    )

    # relationships
    user=relationship(
        "User",
        back_populates="feedbacks"
    )

    event=relationship(
        "Event",
        back_populates="feedbacks"
    )
