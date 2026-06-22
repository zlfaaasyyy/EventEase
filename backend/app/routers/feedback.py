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
from app.models.Feedback import Feedback
from app.models.User import User
from app.schemas.Feedback import FeedbackCreate
from app.schemas.Feedback import FeedbackReply
from app.schemas.Feedback import FeedbackResponse
from app.auth.dependencies import get_current_user
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()


# ---------- User: Submit feedback for an event attended ----------

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5"
        )

    event = db.query(Event).filter(Event.id == payload.event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    has_attended = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == payload.event_id,
        Registration.status == "confirmed"
    ).first()

    if not has_attended:
        raise HTTPException(
            status_code=400,
            detail="You can only give feedback for events you have registered and confirmed for"
        )

    existing = db.query(Feedback).filter(
        Feedback.user_id == current_user.id,
        Feedback.event_id == payload.event_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted feedback for this event"
        )

    new_feedback = Feedback(
        user_id=current_user.id,
        event_id=payload.event_id,
        rating=payload.rating,
        comment=payload.comment
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback


# ---------- Public: View feedback for an event (event detail page reviews) ----------

@router.get("/events/{event_id}/feedback", response_model=list[FeedbackResponse])
def list_event_feedback(
    event_id: int,
    db: Session = Depends(get_db)
):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return db.query(Feedback).filter(
        Feedback.event_id == event_id
    ).order_by(Feedback.created_at.desc()).all()


# ---------- User: View own feedback history ----------

@router.get("/feedback/me", response_model=list[FeedbackResponse])
def list_my_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).order_by(Feedback.created_at.desc()).all()


# ---------- Organizer: View feedback across own events ----------

@router.get("/organizer/feedback", response_model=list[FeedbackResponse])
def list_organizer_feedback(
    event_id: Optional[int] = Query(None),
    replied: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    query = db.query(Feedback).join(
        Event, Feedback.event_id == Event.id
    )

    if current_user.role != "admin":
        query = query.filter(Event.organizer_id == current_user.id)

    if event_id:
        query = query.filter(Feedback.event_id == event_id)

    if replied is True:
        query = query.filter(Feedback.organizer_reply.isnot(None))
    elif replied is False:
        query = query.filter(Feedback.organizer_reply.is_(None))

    return query.order_by(Feedback.created_at.desc()).all()


# ---------- Organizer: Reply to feedback ----------

@router.patch("/organizer/feedback/{feedback_id}/reply", response_model=FeedbackResponse)
def reply_to_feedback(
    feedback_id: int,
    payload: FeedbackReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    event = db.query(Event).filter(Event.id == feedback.event_id).first()

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to reply to this feedback"
        )

    feedback.organizer_reply = payload.organizer_reply
    feedback.replied_at = datetime.utcnow()

    db.commit()
    db.refresh(feedback)

    return feedback
