from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional

from app.database import get_db
from app.models.User import User
from app.schemas.User import UserResponse
from app.schemas.User import UserProfileUpdate
from app.schemas.User import PasswordUpdate
from app.schemas.User import UserStatusUpdate
from app.schemas.User import UserRoleUpdate
from app.auth.dependencies import get_current_user
from app.auth.dependencies import require_admin

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------- Current user: profile ----------

@router.get("/users/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user


@router.put("/users/me", response_model=UserResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/users/me/password")
def update_my_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not pwd_context.verify(payload.current_password, current_user.password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirmation do not match"
        )

    current_user.password = pwd_context.hash(payload.new_password)

    db.commit()

    return {
        "message": "Password updated successfully"
    }


@router.delete("/users/me")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    db.delete(current_user)
    db.commit()

    return {
        "message": "Your account has been deleted"
    }


# ---------- Admin: Manage Users ----------

@router.get("/admin/users", response_model=list[UserResponse])
def admin_list_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    if status:
        query = query.filter(User.status == status)

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    return query.order_by(User.created_at.desc()).all()


@router.get("/admin/users/{user_id}", response_model=UserResponse)
def admin_get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.patch("/admin/users/{user_id}/status", response_model=UserResponse)
def admin_update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.status = payload.status

    db.commit()
    db.refresh(user)

    return user


@router.patch("/admin/users/{user_id}/role", response_model=UserResponse)
def admin_update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.role = payload.role

    db.commit()
    db.refresh(user)

    return user


@router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted"
    }


# ---------- Admin: Organizer Approvals ----------

@router.get("/admin/organizer-approvals", response_model=list[UserResponse])
def list_organizer_approvals(
    status: Optional[str] = Query("pending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    query = db.query(User).filter(User.role == "organizer")

    if status:
        query = query.filter(User.status == status)

    return query.order_by(User.created_at.desc()).all()


@router.patch("/admin/organizer-approvals/{user_id}/approve", response_model=UserResponse)
def approve_organizer(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(
        User.id == user_id,
        User.role == "organizer"
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Organizer application not found"
        )

    user.status = "active"

    db.commit()
    db.refresh(user)

    return user


@router.patch("/admin/organizer-approvals/{user_id}/reject", response_model=UserResponse)
def reject_organizer(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(
        User.id == user_id,
        User.role == "organizer"
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Organizer application not found"
        )

    user.status = "rejected"

    db.commit()
    db.refresh(user)

    return user
