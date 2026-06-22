from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.Event import Event
from app.models.Ticket import Ticket
from app.models.Registration import Registration
from app.models.User import User
from app.schemas.Registration import RegistrationCreate
from app.schemas.Registration import RegistrationStatusUpdate
from app.schemas.Registration import RegistrationResponse
from app.auth.dependencies import get_current_user
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()


# ---------- User: Register for an event ----------

@router.post("/registrations", response_model=RegistrationResponse)
def register_for_event(
    payload: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    event = db.query(Event).filter(
        Event.id == payload.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.status != "published":
        raise HTTPException(
            status_code=400,
            detail="This event is not open for registration"
        )

    ticket = db.query(Ticket).filter(
        Ticket.id == payload.ticket_id,
        Ticket.event_id == payload.event_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket type not found for this event"
        )

    if ticket.sold >= ticket.quota:
        raise HTTPException(
            status_code=400,
            detail="This ticket type is sold out"
        )

    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == payload.event_id,
        Registration.status != "cancelled"
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active registration for this event"
        )

    new_registration = Registration(
        user_id=current_user.id,
        event_id=payload.event_id,
        ticket_id=payload.ticket_id,
        status="pending"
    )

    db.add(new_registration)

    ticket.sold += 1

    db.commit()
    db.refresh(new_registration)

    return new_registration


# ---------- User: View own registrations ----------

@router.get("/registrations/me", response_model=list[RegistrationResponse])
def list_my_registrations(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Registration).filter(
        Registration.user_id == current_user.id
    )

    if status:
        query = query.filter(Registration.status == status)

    registrations = query.order_by(Registration.registration_date.desc()).all()

    return registrations


@router.get("/registrations/{registration_id}", response_model=RegistrationResponse)
def get_registration_detail(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    event = db.query(Event).filter(Event.id == registration.event_id).first()

    is_owner = registration.user_id == current_user.id
    is_event_organizer = event and event.organizer_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_owner or is_event_organizer or is_admin):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this registration"
        )

    return registration


# ---------- User: Cancel own registration ----------

@router.patch("/registrations/{registration_id}/cancel", response_model=RegistrationResponse)
def cancel_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    if registration.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to cancel this registration"
        )

    if registration.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Registration is already cancelled"
        )

    ticket = db.query(Ticket).filter(Ticket.id == registration.ticket_id).first()

    if ticket and ticket.sold > 0:
        ticket.sold -= 1

    registration.status = "cancelled"

    db.commit()
    db.refresh(registration)

    return registration


# ---------- Organizer: View registrations for their events ----------

@router.get("/organizer/events/{event_id}/registrations", response_model=list[RegistrationResponse])
def list_event_registrations(
    event_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view registrations for this event"
        )

    query = db.query(Registration).filter(Registration.event_id == event_id)

    if status:
        query = query.filter(Registration.status == status)

    return query.order_by(Registration.registration_date.desc()).all()


# ---------- Organizer: Update registration status (confirm/cancel) ----------

@router.patch("/organizer/registrations/{registration_id}/status", response_model=RegistrationResponse)
def update_registration_status(
    registration_id: int,
    payload: RegistrationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    event = db.query(Event).filter(Event.id == registration.event_id).first()

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to manage this registration"
        )

    ticket = db.query(Ticket).filter(Ticket.id == registration.ticket_id).first()

    if payload.status == "cancelled" and registration.status != "cancelled":
        if ticket and ticket.sold > 0:
            ticket.sold -= 1

    registration.status = payload.status

    db.commit()
    db.refresh(registration)

    return registration


# ---------- Organizer: Manually register a participant ----------

@router.post("/organizer/events/{event_id}/registrations", response_model=RegistrationResponse)
def manually_register_participant(
    event_id: int,
    ticket_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to register participants for this event"
        )

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.event_id == event_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket type not found for this event"
        )

    if ticket.sold >= ticket.quota:
        raise HTTPException(
            status_code=400,
            detail="This ticket type is sold out"
        )

    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_registration = Registration(
        user_id=user_id,
        event_id=event_id,
        ticket_id=ticket_id,
        status="confirmed"
    )

    db.add(new_registration)

    ticket.sold += 1

    db.commit()
    db.refresh(new_registration)

    return new_registration
