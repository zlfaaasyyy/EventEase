from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app.models.Event import Event
from app.models.Ticket import Ticket
from app.models.User import User
from app.schemas.Event import EventCreate
from app.schemas.Event import EventUpdate
from app.schemas.Event import EventStatusUpdate
from app.schemas.Event import EventResponse
from app.schemas.Event import EventDetailResponse
from app.auth.dependencies import get_current_user
from app.auth.dependencies import require_organizer
from app.auth.dependencies import require_admin
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()


# ---------- Public: Browse / Search Events ----------

@router.get("/events", response_model=list[EventResponse])
def browse_events(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query("published"),
    page: int = Query(1, ge=1),
    page_size: int = Query(6, ge=1, le=100),
    db: Session = Depends(get_db)
):

    query = db.query(Event)

    if status:
        query = query.filter(Event.status == status)

    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )

    if category_id:
        query = query.filter(Event.category_id == category_id)

    if location:
        query = query.filter(Event.location.ilike(f"%{location}%"))

    query = query.order_by(Event.start_date.asc())

    total = query.count()
    events = query.offset((page - 1) * page_size).limit(page_size).all()

    return events


@router.get("/events/{event_id}", response_model=EventDetailResponse)
def get_event_detail(
    event_id: int,
    db: Session = Depends(get_db)
):

    event = db.query(Event).options(
        joinedload(Event.organizer),
        joinedload(Event.category),
        joinedload(Event.tickets)
    ).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event


# ---------- User: Recommended events (based on categories of past registrations) ----------

@router.get("/events/recommended/me", response_model=list[EventResponse])
def recommended_events(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    from app.models.Registration import Registration

    favorite_category_ids = [
        row[0] for row in db.query(Event.category_id).join(
            Registration, Registration.event_id == Event.id
        ).filter(
            Registration.user_id == current_user.id,
            Event.category_id.isnot(None)
        ).distinct().all()
    ]

    already_registered_event_ids = db.query(Registration.event_id).filter(
        Registration.user_id == current_user.id
    )

    query = db.query(Event).filter(
        Event.status == "published",
        Event.id.notin_(already_registered_event_ids)
    )

    if favorite_category_ids:
        query = query.filter(Event.category_id.in_(favorite_category_ids))

    events = query.order_by(Event.start_date.asc()).limit(limit).all()

    # Fallback: if user has no history or no matches, show upcoming published events
    if not events:
        events = db.query(Event).filter(
            Event.status == "published"
        ).order_by(Event.start_date.asc()).limit(limit).all()

    return events


# ---------- Organizer: Manage Own Events ----------

@router.get("/organizer/events", response_model=list[EventResponse])
def list_my_events(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer)
):

    query = db.query(Event).filter(
        Event.organizer_id == current_user.id
    )

    if status:
        query = query.filter(Event.status == status)

    events = query.order_by(Event.created_at.desc()).all()

    return events


@router.post("/organizer/events", response_model=EventDetailResponse)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer)
):

    allowed_initial_status = {"draft", "published"}
    initial_status = payload.status if payload.status in allowed_initial_status else "draft"

    new_event = Event(
        title=payload.title,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        location=payload.location,
        venue_name=payload.venue_name,
        address=payload.address,
        banner_url=payload.banner_url,
        category_id=payload.category_id,
        organizer_id=current_user.id,
        status=initial_status
    )

    db.add(new_event)
    db.flush()

    for ticket in payload.tickets:
        new_ticket = Ticket(
            event_id=new_event.id,
            ticket_type=ticket.ticket_type,
            price=ticket.price,
            quota=ticket.quota,
            sold=0
        )
        db.add(new_ticket)

    db.commit()
    db.refresh(new_event)

    return new_event


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
            detail="You do not have permission to manage this event"
        )

    return event


@router.put("/organizer/events/{event_id}", response_model=EventDetailResponse)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = _get_owned_event(event_id, db, current_user)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


@router.delete("/organizer/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = _get_owned_event(event_id, db, current_user)

    db.delete(event)
    db.commit()

    return {
        "message": "Event deleted"
    }


@router.patch("/organizer/events/{event_id}/publish", response_model=EventDetailResponse)
def publish_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = _get_owned_event(event_id, db, current_user)

    event.status = "published"

    db.commit()
    db.refresh(event)

    return event


@router.patch("/organizer/events/{event_id}/unpublish", response_model=EventDetailResponse)
def unpublish_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = _get_owned_event(event_id, db, current_user)

    event.status = "draft"

    db.commit()
    db.refresh(event)

    return event


# ---------- Admin: Manage All Events ----------

@router.get("/admin/events", response_model=list[EventResponse])
def admin_list_events(
    status: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    query = db.query(Event)

    if status:
        query = query.filter(Event.status == status)

    if category_id:
        query = query.filter(Event.category_id == category_id)

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    events = query.order_by(Event.created_at.desc()).all()

    return events


@router.patch("/admin/events/{event_id}/status", response_model=EventDetailResponse)
def admin_update_event_status(
    event_id: int,
    payload: EventStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    event.status = payload.status

    db.commit()
    db.refresh(event)

    return event


@router.delete("/admin/events/{event_id}")
def admin_delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    db.delete(event)
    db.commit()

    return {
        "message": "Event deleted"
    }