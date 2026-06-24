from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

ADMIN_DATA = {
    "name": "Admin EventEase",
    "email": "admin@eventease.com",
    "password": "admin123"
}