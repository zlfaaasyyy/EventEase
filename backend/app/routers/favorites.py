from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.Favorite import Favorite
from app.models.Event import Event
from app.models.User import User
from app.schemas.Event import EventResponse
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.post("/favorites/{event_id}")
def add_favorite(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.event_id == event_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Event already in favorites"
        )

    new_favorite = Favorite(
        user_id=current_user.id,
        event_id=event_id
    )

    db.add(new_favorite)
    db.commit()

    return {
        "message": "Event added to favorites"
    }


@router.delete("/favorites/{event_id}")
def remove_favorite(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.event_id == event_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Event is not in your favorites"
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Event removed from favorites"
    }


@router.get("/favorites/me", response_model=list[EventResponse])
def list_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    favorites = db.query(Favorite).options(
        joinedload(Favorite.event)
    ).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()

    return [f.event for f in favorites]
