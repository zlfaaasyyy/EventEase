from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
import qrcode
import io
import base64

from app.database import get_db
from app.models.Registration import Registration
from app.models.User import User
from app.auth.dependencies import get_current_user

router = APIRouter()


def _generate_qr_base64(data: str) -> str:

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{encoded}"


@router.get("/registrations/{registration_id}/qrcode")
def get_ticket_qrcode(
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

    if registration.user_id != current_user.id and current_user.role not in ("organizer", "admin"):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this ticket's QR code"
        )

    if registration.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail="QR code is only available for confirmed registrations"
        )

    # The QR code encodes the registration_id, which organizers scan/enter
    # at check-in (see /organizer/attendance/check-in).
    qr_data = str(registration.id)

    qr_base64_image = _generate_qr_base64(qr_data)

    return {
        "registration_id": registration.id,
        "qr_data": qr_data,
        "qr_image_base64": qr_base64_image
    }
