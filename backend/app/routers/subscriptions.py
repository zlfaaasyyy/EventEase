from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from datetime import timedelta
from decimal import Decimal

from app.database import get_db
from app.models.Subscription import Subscription
from app.models.User import User
from app.schemas.Subscription import SubscriptionResponse
from app.schemas.Subscription import SubscriptionUpgrade
from app.auth.dependencies import require_organizer_or_admin

router = APIRouter()

PLAN_PRICES = {
    "free": Decimal("0"),
    "pro": Decimal("299000")
}


@router.get("/organizer/subscription", response_model=SubscriptionResponse)
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    subscription = db.query(Subscription).filter(
        Subscription.organizer_id == current_user.id
    ).first()

    if not subscription:
        # Every organizer starts on the free plan by default.
        subscription = Subscription(
            organizer_id=current_user.id,
            plan="free",
            price=PLAN_PRICES["free"],
            status="active"
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)

    return subscription


@router.patch("/organizer/subscription/upgrade", response_model=SubscriptionResponse)
def upgrade_subscription(
    payload: SubscriptionUpgrade,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    if payload.plan not in PLAN_PRICES:
        raise HTTPException(
            status_code=400,
            detail=f"plan must be one of {list(PLAN_PRICES.keys())}"
        )

    subscription = db.query(Subscription).filter(
        Subscription.organizer_id == current_user.id
    ).first()

    if not subscription:
        subscription = Subscription(organizer_id=current_user.id)
        db.add(subscription)

    subscription.plan = payload.plan
    subscription.price = PLAN_PRICES[payload.plan]
    subscription.status = "active"
    subscription.started_at = datetime.utcnow()

    if payload.plan == "pro":
        subscription.next_billing_date = datetime.utcnow() + timedelta(days=30)
    else:
        subscription.next_billing_date = None

    db.commit()
    db.refresh(subscription)

    return subscription


@router.patch("/organizer/subscription/cancel", response_model=SubscriptionResponse)
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    subscription = db.query(Subscription).filter(
        Subscription.organizer_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )

    subscription.status = "cancelled"
    subscription.plan = "free"
    subscription.price = PLAN_PRICES["free"]
    subscription.next_billing_date = None

    db.commit()
    db.refresh(subscription)

    return subscription
