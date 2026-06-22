from app.database import engine
from app.database import Base
from app.models import (
    User,
    Category,
    Event,
    Ticket,
    Registration,
    Payment,
    EventAttendance,
    Feedback,
    Favorite,
    Subscription,
)

Base.metadata.create_all(
    bind=engine
)

print("Database created")