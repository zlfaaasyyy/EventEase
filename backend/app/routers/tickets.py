from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.Event import Event
from app.models.Ticket import Ticket
from app.models.User import User
from app.schemas.Ticket import TicketCreate
from app.schemas.Ticket import TicketUpdate
from app.schemas.Ticket import TicketResponse
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()


def _get_owned_event(event_id: int, db: Session, current_user: User) -> Event:

    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to manage tickets for this event"
        )

    return event


# Public: view ticket types for an event (used on event detail page)
@router.get("/events/{event_id}/tickets", response_model=list[TicketResponse])
def list_event_tickets(
    event_id: int,
    db: Session = Depends(get_db)
):

    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event.tickets


# Organizer: add a new ticket type to an event
@router.post("/organizer/events/{event_id}/tickets", response_model=TicketResponse)
def create_ticket(
    event_id: int,
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    _get_owned_event(event_id, db, current_user)

    new_ticket = Ticket(
        event_id=event_id,
        ticket_type=payload.ticket_type,
        price=payload.price,
        quota=payload.quota,
        sold=0
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


def _get_owned_ticket(ticket_id: int, db: Session, current_user: User) -> Ticket:

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    event = db.query(Event).filter(
        Event.id == ticket.event_id
    ).first()

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to manage this ticket"
        )

    return ticket


# Organizer: update a ticket type (price, quota, name)
@router.put("/organizer/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    ticket = _get_owned_ticket(ticket_id, db, current_user)

    update_data = payload.model_dump(exclude_unset=True)

    if "quota" in update_data and update_data["quota"] < ticket.sold:
        raise HTTPException(
            status_code=400,
            detail="Quota cannot be less than tickets already sold"
        )

    for field, value in update_data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return ticket


# Organizer: remove a ticket type
@router.delete("/organizer/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    ticket = _get_owned_ticket(ticket_id, db, current_user)

    if ticket.sold > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a ticket type that already has sales"
        )

    db.delete(ticket)
    db.commit()

    return {
        "message": "Ticket type deleted"
    }
