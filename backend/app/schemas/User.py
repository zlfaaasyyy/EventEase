from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str


class UserStatusUpdate(BaseModel):
    status: str
    # active | suspended | pending | rejected


class UserRoleUpdate(BaseModel):
    role: str
    # user | organizer | admin