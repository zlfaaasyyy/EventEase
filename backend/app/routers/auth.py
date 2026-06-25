from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.schemas.auth import LoginSchema
from app.auth.jwt_handler import create_access_token
from app.database import get_db
from app.models.User import User
from app.schemas.auth import RegisterSchema

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@router.post("/register")
def register(
    user:RegisterSchema,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Password does not match"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    # Organizer accounts require admin approval before they are active.
    # Regular users are active immediately.
    initial_status = "pending" if user.role == "organizer" else "active"

    new_user = User(
        name=user.name,
        email=user.email,
        role=user.role,
        password=hashed_password,
        status=initial_status
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if new_user.role == "organizer":
        message = "Register success. Your organizer account is pending admin approval."
    else:
        message = "Register success"

    return {
        "message": message,
        "user":{
            "id":new_user.id,
            "name":new_user.name,
            "email":new_user.email,
            "role":new_user.role,
            "status":new_user.status
        }
    }

@router.post("/login")
def login(
    user: LoginSchema,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not pwd_context.verify(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if existing_user.status == "pending":
        raise HTTPException(
            status_code=403,
            detail="Your organizer account is still pending admin approval"
        )

    if existing_user.status == "rejected":
        raise HTTPException(
            status_code=403,
            detail="Your organizer application was rejected"
        )

    if existing_user.status == "suspended":
        raise HTTPException(
            status_code=403,
            detail="Your account has been suspended"
        )

    token = create_access_token({
        "id": existing_user.id,
        "email": existing_user.email,
        "role": existing_user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
            "role": existing_user.role,
            "status": existing_user.status
        }
    }