from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models.Event import Event
from app.models.Ticket import Ticket
from app.models.Registration import Registration
from app.models.Payment import Payment
from app.models.Feedback import Feedback
from app.models.EventAttendance import EventAttendance
from app.models.User import User
from app.auth.dependencies import require_organizer_or_admin
from app.auth.dependencies import require_admin

router = APIRouter()


# ---------- Organizer: Reports for a specific event ----------

@router.get("/organizer/events/{event_id}/reports")
def event_report(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view reports for this event"
        )

    total_registrations = db.query(Registration).filter(
        Registration.event_id == event_id
    ).count()

    confirmed_registrations = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status == "confirmed"
    ).count()

    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0)).join(
        Registration, Payment.registration_id == Registration.id
    ).filter(
        Registration.event_id == event_id,
        Payment.payment_status == "paid"
    ).scalar()

    total_attended = db.query(EventAttendance).join(
        Registration, EventAttendance.registration_id == Registration.id
    ).filter(
        Registration.event_id == event_id,
        EventAttendance.status == "hadir"
    ).count()

    attendance_rate = (
        round((total_attended / confirmed_registrations) * 100, 1)
        if confirmed_registrations > 0 else 0
    )

    avg_rating = db.query(func.avg(Feedback.rating)).filter(
        Feedback.event_id == event_id
    ).scalar()

    total_feedback = db.query(Feedback).filter(
        Feedback.event_id == event_id
    ).count()

    revenue_by_ticket = db.query(
        Ticket.ticket_type,
        func.coalesce(func.sum(Payment.amount), 0)
    ).join(
        Registration, Registration.ticket_id == Ticket.id
    ).join(
        Payment, Payment.registration_id == Registration.id
    ).filter(
        Ticket.event_id == event_id,
        Payment.payment_status == "paid"
    ).group_by(Ticket.ticket_type).all()

    return {
        "event_id": event_id,
        "event_title": event.title,
        "total_registrations": total_registrations,
        "confirmed_registrations": confirmed_registrations,
        "total_revenue": float(total_revenue or 0),
        "total_attended": total_attended,
        "attendance_rate": attendance_rate,
        "average_rating": round(float(avg_rating), 1) if avg_rating else None,
        "total_feedback": total_feedback,
        "revenue_by_ticket": [
            {"ticket_type": t, "revenue": float(r)} for t, r in revenue_by_ticket
        ]
    }


# ---------- Organizer: Overall dashboard summary ----------

@router.get("/organizer/dashboard/summary")
def organizer_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    event_ids_query = db.query(Event.id).filter(
        Event.organizer_id == current_user.id
    )

    total_events = event_ids_query.count()

    published_events = db.query(Event).filter(
        Event.organizer_id == current_user.id,
        Event.status == "published"
    ).count()

    total_registrations = db.query(Registration).filter(
        Registration.event_id.in_(event_ids_query)
    ).count()

    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0)).join(
        Registration, Payment.registration_id == Registration.id
    ).filter(
        Registration.event_id.in_(event_ids_query),
        Payment.payment_status == "paid"
    ).scalar()

    avg_rating = db.query(func.avg(Feedback.rating)).filter(
        Feedback.event_id.in_(event_ids_query)
    ).scalar()

    return {
        "total_events": total_events,
        "published_events": published_events,
        "total_registrations": total_registrations,
        "total_revenue": float(total_revenue or 0),
        "average_rating": round(float(avg_rating), 1) if avg_rating else None
    }


# ---------- Admin: System-wide reports ----------

@router.get("/admin/reports/system")
def system_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    total_users = db.query(User).count()
    total_organizers = db.query(User).filter(User.role == "organizer").count()
    active_users = db.query(User).filter(User.status == "active").count()

    total_events = db.query(Event).count()
    published_events = db.query(Event).filter(Event.status == "published").count()
    pending_approval_events = db.query(Event).filter(
        Event.status == "pending_approval"
    ).count()

    total_registrations = db.query(Registration).count()

    total_revenue = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.payment_status == "paid"
    ).scalar()

    pending_organizer_approvals = db.query(User).filter(
        User.role == "organizer",
        User.status == "pending"
    ).count()

    return {
        "total_users": total_users,
        "total_organizers": total_organizers,
        "active_users": active_users,
        "total_events": total_events,
        "published_events": published_events,
        "pending_approval_events": pending_approval_events,
        "total_registrations": total_registrations,
        "total_revenue": float(total_revenue or 0),
        "pending_organizer_approvals": pending_organizer_approvals
    }


@router.get("/admin/reports/categories-popularity")
def categories_popularity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    from app.models.Category import Category

    results = db.query(
        Category.category_name,
        func.count(Event.id)
    ).outerjoin(
        Event, Event.category_id == Category.id
    ).group_by(Category.id).all()

    return [
        {"category_name": name, "events_count": count}
        for name, count in results
    ]


# ---------- Admin: Monthly growth analytics (users, events, registrations, revenue) ----------

@router.get("/admin/reports/monthly-growth")
def monthly_growth(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    from collections import defaultdict

    def month_key(dt):
        return dt.strftime("%Y-%m") if dt else None

    new_users_by_month = defaultdict(int)
    for (created_at,) in db.query(User.created_at).all():
        key = month_key(created_at)
        if key:
            new_users_by_month[key] += 1

    new_events_by_month = defaultdict(int)
    for (created_at,) in db.query(Event.created_at).all():
        key = month_key(created_at)
        if key:
            new_events_by_month[key] += 1

    registrations_by_month = defaultdict(int)
    for (reg_date,) in db.query(Registration.registration_date).all():
        key = month_key(reg_date)
        if key:
            registrations_by_month[key] += 1

    revenue_by_month = defaultdict(float)
    paid_payments = db.query(Payment.transaction_date, Payment.amount).filter(
        Payment.payment_status == "paid"
    ).all()
    for tx_date, amount in paid_payments:
        key = month_key(tx_date)
        if key:
            revenue_by_month[key] += float(amount or 0)

    all_months = sorted(set(
        list(new_users_by_month.keys())
        + list(new_events_by_month.keys())
        + list(registrations_by_month.keys())
        + list(revenue_by_month.keys())
    ))[-months:]

    return [
        {
            "month": month,
            "new_users": new_users_by_month.get(month, 0),
            "new_events": new_events_by_month.get(month, 0),
            "new_registrations": registrations_by_month.get(month, 0),
            "revenue": round(revenue_by_month.get(month, 0), 2)
        }
        for month in all_months
    ]


# ---------- Organizer: Monthly registrations/revenue for own events ----------

@router.get("/organizer/reports/monthly-growth")
def organizer_monthly_growth(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    from collections import defaultdict

    def month_key(dt):
        return dt.strftime("%Y-%m") if dt else None

    event_ids_query = db.query(Event.id).filter(
        Event.organizer_id == current_user.id
    )

    registrations_by_month = defaultdict(int)
    for (reg_date,) in db.query(Registration.registration_date).filter(
        Registration.event_id.in_(event_ids_query)
    ).all():
        key = month_key(reg_date)
        if key:
            registrations_by_month[key] += 1

    revenue_by_month = defaultdict(float)
    paid_payments = db.query(Payment.transaction_date, Payment.amount).join(
        Registration, Payment.registration_id == Registration.id
    ).filter(
        Registration.event_id.in_(event_ids_query),
        Payment.payment_status == "paid"
    ).all()
    for tx_date, amount in paid_payments:
        key = month_key(tx_date)
        if key:
            revenue_by_month[key] += float(amount or 0)

    all_months = sorted(set(
        list(registrations_by_month.keys()) + list(revenue_by_month.keys())
    ))

    return [
        {
            "month": month,
            "new_registrations": registrations_by_month.get(month, 0),
            "revenue": float(revenue_by_month.get(month, 0) or 0)
        }
        for month in all_months
    ]


# ---------- Admin: Top organizers ranking ----------

@router.get("/admin/reports/top-organizers")
def top_organizers(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    results = db.query(
        User.id,
        User.name,
        User.organization_name,
        func.count(Event.id).label("events_count"),
        func.avg(Feedback.rating).label("avg_rating")
    ).join(
        Event, Event.organizer_id == User.id
    ).outerjoin(
        Feedback, Feedback.event_id == Event.id
    ).filter(
        User.role == "organizer"
    ).group_by(User.id).order_by(
        func.count(Event.id).desc()
    ).limit(limit).all()

    return [
        {
            "organizer_id": r.id,
            "name": r.name,
            "organization_name": r.organization_name,
            "events_hosted": r.events_count,
            "average_rating": round(float(r.avg_rating), 1) if r.avg_rating else None
        }
        for r in results
    ]


# ---------- Admin: Top events ranking ----------

@router.get("/admin/reports/top-events")
def top_events(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    results = db.query(
        Event.id,
        Event.title,
        Event.status,
        func.count(Registration.id).label("registrations_count"),
        func.coalesce(func.sum(Payment.amount), 0).label("revenue")
    ).outerjoin(
        Registration, Registration.event_id == Event.id
    ).outerjoin(
        Payment, (Payment.registration_id == Registration.id) & (Payment.payment_status == "paid")
    ).group_by(Event.id).order_by(
        func.count(Registration.id).desc()
    ).limit(limit).all()

    return [
        {
            "event_id": r.id,
            "title": r.title,
            "status": r.status,
            "registrations_count": r.registrations_count,
            "revenue": float(r.revenue or 0)
        }
        for r in results
    ]


# ---------- Organizer: Export event registrations as CSV ----------

@router.get("/organizer/events/{event_id}/registrations/export")
def export_event_registrations_csv(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer_or_admin)
):

    import csv
    import io
    from fastapi.responses import StreamingResponse
    from app.models.User import User as UserModel
    from app.models.Ticket import Ticket as TicketModel

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to export registrations for this event"
        )

    rows = db.query(
        Registration, UserModel, TicketModel
    ).join(
        UserModel, Registration.user_id == UserModel.id
    ).join(
        TicketModel, Registration.ticket_id == TicketModel.id
    ).filter(
        Registration.event_id == event_id
    ).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "registration_id", "participant_name", "email",
        "ticket_type", "registration_date", "status"
    ])

    for registration, user, ticket in rows:
        writer.writerow([
            registration.id,
            user.name,
            user.email,
            ticket.ticket_type,
            registration.registration_date,
            registration.status
        ])

    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=registrations_event_{event_id}.csv"
        }
    )


# ---------- Admin: Export system report as CSV ----------

@router.get("/admin/reports/system/export")
def export_system_report_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    import csv
    import io
    from fastapi.responses import StreamingResponse

    total_users = db.query(User).count()
    total_organizers = db.query(User).filter(User.role == "organizer").count()
    total_events = db.query(Event).count()
    published_events = db.query(Event).filter(Event.status == "published").count()
    total_registrations = db.query(Registration).count()
    total_revenue = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(Payment.payment_status == "paid").scalar()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["metric", "value"])
    writer.writerow(["total_users", total_users])
    writer.writerow(["total_organizers", total_organizers])
    writer.writerow(["total_events", total_events])
    writer.writerow(["published_events", published_events])
    writer.writerow(["total_registrations", total_registrations])
    writer.writerow(["total_revenue", float(total_revenue or 0)])

    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=system_report.csv"
        }
    )

