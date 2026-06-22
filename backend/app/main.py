from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.events import router as events_router
from app.routers.tickets import router as tickets_router
from app.routers.registrations import router as registrations_router
from app.routers.payments import router as payments_router
from app.routers.attendance import router as attendance_router
from app.routers.feedback import router as feedback_router
from app.routers.reports import router as reports_router
from app.routers.favorites import router as favorites_router
from app.routers.qrcode_router import router as qrcode_router
from app.routers.subscriptions import router as subscriptions_router

app = FastAPI(
    title="EventEase API",
    version="1.0"
)

# Allow the React frontend (running on a different origin/port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api",
    tags=["Auth"]
)

app.include_router(
    users_router,
    prefix="/api",
    tags=["Users"]
)

app.include_router(
    categories_router,
    prefix="/api",
    tags=["Categories"]
)

app.include_router(
    events_router,
    prefix="/api",
    tags=["Events"]
)

app.include_router(
    tickets_router,
    prefix="/api",
    tags=["Tickets"]
)

app.include_router(
    registrations_router,
    prefix="/api",
    tags=["Registrations"]
)

app.include_router(
    payments_router,
    prefix="/api",
    tags=["Payments"]
)

app.include_router(
    attendance_router,
    prefix="/api",
    tags=["Attendance"]
)

app.include_router(
    feedback_router,
    prefix="/api",
    tags=["Feedback"]
)

app.include_router(
    reports_router,
    prefix="/api",
    tags=["Reports"]
)

app.include_router(
    favorites_router,
    prefix="/api",
    tags=["Favorites"]
)

app.include_router(
    qrcode_router,
    prefix="/api",
    tags=["QR Code"]
)

app.include_router(
    subscriptions_router,
    prefix="/api",
    tags=["Subscriptions"]
)

@app.get("/")
def root():
    return {
        "message": "EventEase API running"
    }
