"""
Test integration LANGSUNG ke server FastAPI yang sedang jalan (MySQL asli).

CARA PAKAI:
1. Pastikan server sudah jalan: uvicorn app.main:app --reload
2. Pastikan sudah ada 1 admin di database (lihat instruksi INSERT admin)
3. Install requests kalau belum: pip install requests
4. Jalankan: python test_live_server.py

Script ini akan membuat data baru (user, organizer, event, dst) di database
asli kamu setiap kali dijalankan -- jadi email yang dipakai pakai timestamp
biar tidak bentrok dengan run sebelumnya.
"""

import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

# Ganti ini sesuai admin yang sudah kamu INSERT manual ke database
ADMIN_EMAIL = "admin@eventease.com"
ADMIN_PASSWORD = "admin123"

# Supaya tidak bentrok setiap kali script dijalankan ulang
TS = str(int(time.time()))


def check(label, response, expected_status=200):
    status_ok = response.status_code == expected_status
    symbol = "PASS" if status_ok else "FAIL"
    print(f"[{symbol}] {label} -> {response.status_code} (expected {expected_status})")
    if not status_ok:
        print("    Response:", response.text[:300])
    return response


print("=" * 70)
print("0. CEK SERVER HIDUP")
print("=" * 70)

try:
    r = requests.get("http://127.0.0.1:8000/")
    check("Root endpoint", r)
except requests.exceptions.ConnectionError:
    print("[FAIL] Tidak bisa konek ke server. Pastikan uvicorn sudah jalan di port 8000.")
    exit(1)

print()
print("=" * 70)
print("1. LOGIN ADMIN (harus sudah di-INSERT manual ke database)")
print("=" * 70)

r = check("Login admin", requests.post(f"{BASE_URL}/login", json={
    "email": ADMIN_EMAIL,
    "password": ADMIN_PASSWORD
}))

if r.status_code != 200:
    print()
    print("STOP: Admin belum ada / password salah. Jalankan dulu query INSERT admin di HeidiSQL.")
    exit(1)

admin_token = r.json()["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}

print()
print("=" * 70)
print("2. REGISTER USER & ORGANIZER BARU")
print("=" * 70)

user_email = f"fahira_{TS}@example.com"
organizer_email = f"techorg_{TS}@example.com"

check("Register user", requests.post(f"{BASE_URL}/register", json={
    "name": "Fahira Test",
    "email": user_email,
    "role": "user",
    "password": "password123",
    "confirm_password": "password123"
}))

r = check("Register organizer", requests.post(f"{BASE_URL}/register", json={
    "name": "TechOrg Test",
    "email": organizer_email,
    "role": "organizer",
    "password": "password123",
    "confirm_password": "password123"
}))
print("    organizer status:", r.json()["user"]["status"])

print()
print("=" * 70)
print("3. LOGIN ORGANIZER SEBELUM APPROVE (harus GAGAL 403)")
print("=" * 70)

check("Login organizer (pending)", requests.post(f"{BASE_URL}/login", json={
    "email": organizer_email,
    "password": "password123"
}), expected_status=403)

print()
print("=" * 70)
print("4. ADMIN APPROVE ORGANIZER")
print("=" * 70)

r = check("List pending organizer approvals", requests.get(
    f"{BASE_URL}/admin/organizer-approvals", headers=admin_headers
))
pending = [u for u in r.json() if u["email"] == organizer_email]
if not pending:
    print("STOP: organizer baru tidak ditemukan di pending list")
    exit(1)
organizer_id = pending[0]["id"]

r = check("Approve organizer", requests.patch(
    f"{BASE_URL}/admin/organizer-approvals/{organizer_id}/approve", headers=admin_headers
))
print("    status setelah approve:", r.json()["status"])

print()
print("=" * 70)
print("5. LOGIN ORGANIZER & USER (setelah approve)")
print("=" * 70)

r = check("Login organizer", requests.post(f"{BASE_URL}/login", json={
    "email": organizer_email,
    "password": "password123"
}))
organizer_headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

r = check("Login user", requests.post(f"{BASE_URL}/login", json={
    "email": user_email,
    "password": "password123"
}))
user_headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

print()
print("=" * 70)
print("6. ADMIN BUAT KATEGORI")
print("=" * 70)

category_name = f"Technology_{TS}"
r = check("Create category", requests.post(
    f"{BASE_URL}/categories",
    json={"category_name": category_name, "description": "Tech events"},
    headers=admin_headers
))
category_id = r.json()["id"]

print()
print("=" * 70)
print("7. ORGANIZER BUAT EVENT + TIKET")
print("=" * 70)

r = check("Create event", requests.post(
    f"{BASE_URL}/organizer/events",
    json={
        "title": f"Tech Summit Test {TS}",
        "description": "Event untuk testing otomatis",
        "start_date": "2026-08-20T09:00:00",
        "end_date": "2026-08-22T17:00:00",
        "location": "Jakarta, Indonesia",
        "venue_name": "JCC",
        "address": "Jl. Gatot Subroto",
        "category_id": category_id,
        "tickets": [
            {"ticket_type": "VIP Pass", "price": "300000", "quota": 50},
            {"ticket_type": "Regular Pass", "price": "150000", "quota": 100}
        ]
    },
    headers=organizer_headers
))
event_id = r.json()["id"]
tickets = r.json()["tickets"]
vip_ticket_id = [t for t in tickets if t["ticket_type"] == "VIP Pass"][0]["id"]
print("    event_id:", event_id, "| status:", r.json()["status"])

print()
print("=" * 70)
print("8. PUBLISH EVENT & CEK MUNCUL DI BROWSE PUBLIK")
print("=" * 70)

check("Publish event", requests.patch(
    f"{BASE_URL}/organizer/events/{event_id}/publish", headers=organizer_headers
))

r = check("Browse published events", requests.get(f"{BASE_URL}/events"))
found = any(e["id"] == event_id for e in r.json())
print("    event baru muncul di browse publik:", found)

print()
print("=" * 70)
print("9. USER DAFTAR EVENT & BAYAR")
print("=" * 70)

r = check("User register event", requests.post(
    f"{BASE_URL}/registrations",
    json={"event_id": event_id, "ticket_id": vip_ticket_id},
    headers=user_headers
))
registration_id = r.json()["id"]

r = check("User bayar", requests.post(
    f"{BASE_URL}/payments",
    json={"registration_id": registration_id, "payment_method": "credit_card"},
    headers=user_headers
))
print("    payment status:", r.json()["payment_status"])

print()
print("=" * 70)
print("10. QR CODE TIKET")
print("=" * 70)

r = check("Get QR code", requests.get(
    f"{BASE_URL}/registrations/{registration_id}/qrcode", headers=user_headers
))
print("    qr_data:", r.json().get("qr_data"))
print("    qr image valid base64 PNG:", r.json().get("qr_image_base64", "").startswith("data:image/png;base64,"))

print()
print("=" * 70)
print("11. ORGANIZER CHECK-IN PESERTA")
print("=" * 70)

r = check("Check-in peserta", requests.post(
    f"{BASE_URL}/organizer/attendance/check-in",
    json={"registration_id": registration_id},
    headers=organizer_headers
))
print("    attendance status:", r.json().get("status"))

print()
print("=" * 70)
print("12. USER SUBMIT FEEDBACK + ORGANIZER REPLY")
print("=" * 70)

r = check("Submit feedback", requests.post(
    f"{BASE_URL}/feedback",
    json={"event_id": event_id, "rating": 5, "comment": "Mantap acaranya!"},
    headers=user_headers
))
feedback_id = r.json()["id"]

check("Organizer reply feedback", requests.patch(
    f"{BASE_URL}/organizer/feedback/{feedback_id}/reply",
    json={"organizer_reply": "Terima kasih sudah datang!"},
    headers=organizer_headers
))

print()
print("=" * 70)
print("13. FAVORITES")
print("=" * 70)

check("Tambah favorit", requests.post(
    f"{BASE_URL}/favorites/{event_id}", headers=user_headers
))
r = check("List favorit", requests.get(f"{BASE_URL}/favorites/me", headers=user_headers))
print("    jumlah favorit:", len(r.json()))

print()
print("=" * 70)
print("14. SUBSCRIPTION / PRO PLAN")
print("=" * 70)

r = check("Get subscription organizer", requests.get(
    f"{BASE_URL}/organizer/subscription", headers=organizer_headers
))
print("    plan:", r.json()["plan"])

check("Upgrade ke PRO", requests.patch(
    f"{BASE_URL}/organizer/subscription/upgrade", json={"plan": "pro"},
    headers=organizer_headers
))

print()
print("=" * 70)
print("15. REPORTS")
print("=" * 70)

r = check("Event report", requests.get(
    f"{BASE_URL}/organizer/events/{event_id}/reports", headers=organizer_headers
))
print("   ", r.json())

r = check("System report (admin)", requests.get(
    f"{BASE_URL}/admin/reports/system", headers=admin_headers
))
print("   ", r.json())

print()
print("=" * 70)
print("16. PERMISSION CHECK")
print("=" * 70)

check("User biasa TIDAK BOLEH bikin event", requests.post(
    f"{BASE_URL}/organizer/events",
    json={"title": "Hack", "start_date": "2026-01-01T00:00:00", "end_date": "2026-01-02T00:00:00"},
    headers=user_headers
), expected_status=403)

check("Tanpa token TIDAK BOLEH akses /users/me", requests.get(
    f"{BASE_URL}/users/me"
), expected_status=401)

print()
print("=" * 70)
print("SELESAI -- cek di atas apakah ada [FAIL]")
print("Kalau semua [PASS], backend kamu di MySQL sudah berfungsi sesuai ERD & UI.")
print("=" * 70)
