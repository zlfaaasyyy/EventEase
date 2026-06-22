from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Numeric
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from app.database import Base


class Payment(Base):

    __tablename__="payments"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    registration_id=Column(
        Integer,
        ForeignKey("registrations.id")
    )

    amount=Column(
        Numeric(12, 2),
        default=0
    )

    payment_method=Column(
        String(50),
        nullable=True
        # credit_card | bank_transfer | e_wallet
    )

    payment_status=Column(
        String(50),
        default="pending"
        # pending | paid | failed | refunded
    )

    transaction_date=Column(
        DateTime,
        server_default=func.now()
    )

    # relationships
    registration=relationship(
        "Registration",
        back_populates="payments"
    )
