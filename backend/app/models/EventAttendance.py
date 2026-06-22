from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class EventAttendance(Base):

    __tablename__="event_attendance"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    registration_id=Column(
        Integer,
        ForeignKey("registrations.id")
    )

    check_in_time=Column(
        DateTime,
        nullable=True
    )

    status=Column(
        String(50),
        default="belum_hadir"
        # hadir | belum_hadir
    )

    # relationships
    registration=relationship(
        "Registration",
        back_populates="attendance"
    )
