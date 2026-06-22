from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.Event import Event
from app.models.Registration import Registration
from app.models.EventAttendance import EventAttendance
from app.models.User import User
from app.schemas.EventAttendance import CheckInRequest
from app.schemas.EventAttendance import AttendanceResponse
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()


def _ensure_event_access(event_id: int, db: Session, current_user: User) -> Event:

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to manage attendance for this event"
        )

    return event


def _do_check_in(registration_id: int, db: Session, current_user: User) -> EventAttendance:

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration ID not found / invalid"
        )

    _ensure_event_access(registration.event_id, db, current_user)

    if registration.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail="Only confirmed registrations can be checked in"
        )

    attendance = db.query(EventAttendance).filter(
        EventAttendance.registration_id == registration.id
    ).first()

    if attendance and attendance.status == "hadir":
        raise HTTPException(
            status_code=400,
            detail="This participant has already been checked in"
        )

    if not attendance:
        attendance = EventAttendance(
            registration_id=registration.id
        )
        db.add(attendance)

    attendance.status = "hadir"
    attendance.check_in_time = datetime.utcnow()

    db.commit()
    db.refresh(attendance)

    return attendance


# ---------- Organizer: Scan/Manual Check-in ----------

@router.post("/organizer/attendance/check-in", response_model=AttendanceResponse)
def check_in(
    payload: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    return _do_check_in(payload.registration_id, db, current_user)


# ---------- Organizer: List attendance for an event ----------

@router.get("/organizer/events/{event_id}/attendance", response_model=list[AttendanceResponse])
def list_event_attendance(
    event_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    _ensure_event_access(event_id, db, current_user)

    query = db.query(EventAttendance).join(
        Registration, EventAttendance.registration_id == Registration.id
    ).filter(
        Registration.event_id == event_id
    )

    if status:
        query = query.filter(EventAttendance.status == status)

    return query.all()


# ---------- Organizer: Manual check-in by registration id (alternate route) ----------

@router.patch("/organizer/registrations/{registration_id}/check-in", response_model=AttendanceResponse)
def manual_check_in(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    return _do_check_in(registration_id, db, current_user)


# ---------- Organizer: Check-in by scanning QR code data ----------
# The QR code on a ticket encodes the registration_id as a plain string
# (see /registrations/{id}/qrcode). This endpoint lets the camera-scan flow
# submit that raw scanned string directly.

@router.post("/organizer/attendance/scan", response_model=AttendanceResponse)
def check_in_by_scanned_data(
    payload: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    return _do_check_in(payload.registration_id, db, current_user)
