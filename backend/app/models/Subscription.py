from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import Numeric
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class Subscription(Base):

    __tablename__="subscriptions"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    organizer_id=Column(
        Integer,
        ForeignKey("users.id")
    )

    plan=Column(
        String(50),
        default="free"
        # free | pro
    )

    price=Column(
        Numeric(12, 2),
        default=0
    )

    status=Column(
        String(50),
        default="active"
        # active | cancelled | expired
    )

    started_at=Column(
        DateTime,
        server_default=func.now()
    )

    next_billing_date=Column(
        DateTime,
        nullable=True
    )

    # relationships
    organizer=relationship(
        "User"
    )
