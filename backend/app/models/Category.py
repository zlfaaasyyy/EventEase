from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):

    __tablename__="categories"

    id=Column(
        Integer,
        primary_key=True,
        index=True
    )

    category_name=Column(
        String(100),
        unique=True
    )

    description=Column(
        String(255),
        nullable=True
    )

    events=relationship(
        "Event",
        back_populates="category"
    )
