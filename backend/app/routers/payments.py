from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.Registration import Registration
from app.models.Ticket import Ticket
from app.models.Event import Event
from app.models.Payment import Payment
from app.models.User import User
from app.schemas.Payment import PaymentCreate
from app.schemas.Payment import PaymentStatusUpdate
from app.schemas.Payment import PaymentResponse
from app.auth.dependencies import get_current_user
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()

VALID_PAYMENT_METHODS = ["credit_card", "bank_transfer", "e_wallet"]


# ---------- User: Make a payment for a registration ----------

@router.post("/payments", response_model=PaymentResponse)
def make_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if payload.payment_method not in VALID_PAYMENT_METHODS:
        raise HTTPException(
            status_code=400,
            detail=f"payment_method must be one of {VALID_PAYMENT_METHODS}"
        )

    registration = db.query(Registration).filter(
        Registration.id == payload.registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    if registration.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to pay for this registration"
        )

    if registration.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cannot pay for a cancelled registration"
        )

    existing_paid = db.query(Payment).filter(
        Payment.registration_id == registration.id,
        Payment.payment_status == "paid"
    ).first()

    if existing_paid:
        raise HTTPException(
            status_code=400,
            detail="This registration has already been paid"
        )

    ticket = db.query(Ticket).filter(Ticket.id == registration.ticket_id).first()

    amount = ticket.price if ticket else 0

    # NOTE: In this academic project, payment is simulated and marked as
    # "paid" immediately since there is no real payment gateway integration.
    new_payment = Payment(
        registration_id=registration.id,
        amount=amount,
        payment_method=payload.payment_method,
        payment_status="paid"
    )

    db.add(new_payment)

    registration.status = "confirmed"

    db.commit()
    db.refresh(new_payment)

    return new_payment


# ---------- User: View own payment / transaction history ----------

@router.get("/payments/me", response_model=list[PaymentResponse])
def list_my_payments(
    payment_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Payment).join(
        Registration, Payment.registration_id == Registration.id
    ).filter(
        Registration.user_id == current_user.id
    )

    if payment_status:
        query = query.filter(Payment.payment_status == payment_status)

    return query.order_by(Payment.transaction_date.desc()).all()


@router.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment_detail(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    registration = db.query(Registration).filter(
        Registration.id == payment.registration_id
    ).first()

    if registration.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this payment"
        )

    return payment


# ---------- User: Retry a failed payment ----------

@router.patch("/payments/{payment_id}/retry", response_model=PaymentResponse)
def retry_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    registration = db.query(Registration).filter(
        Registration.id == payment.registration_id
    ).first()

    if registration.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to retry this payment"
        )

    if payment.payment_status != "failed":
        raise HTTPException(
            status_code=400,
            detail="Only failed payments can be retried"
        )

    payment.payment_status = "paid"
    registration.status = "confirmed"

    db.commit()
    db.refresh(payment)

    return payment


# ---------- Organizer/Admin: Update payment status (e.g. verify bank transfer) ----------

@router.patch("/organizer/payments/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int,
    payload: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    registration = db.query(Registration).filter(
        Registration.id == payment.registration_id
    ).first()

    event = db.query(Event).filter(Event.id == registration.event_id).first()

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this payment"
        )

    payment.payment_status = payload.payment_status

    if payload.payment_status == "paid":
        registration.status = "confirmed"
    elif payload.payment_status in ("failed", "refunded"):
        if registration.status != "cancelled":
            registration.status = "cancelled"

    db.commit()
    db.refresh(payment)

    return payment
