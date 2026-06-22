from pydantic import BaseModel, EmailStr
from typing import Literal
from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    role: Literal["user", "organizer"]
    password: str
    confirm_password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str