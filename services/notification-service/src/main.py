import os
import asyncio
import json
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from azure.servicebus.aio import ServiceBusClient
from azure.communication.email import EmailClient
from jinja2 import Environment, BaseLoader

app = FastAPI(title="HealthSync Notification Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
# Cosmos DB Serverless doesn't support retryable writes
if "cosmos.azure.com" in MONGO_URI and "retrywrites" not in MONGO_URI.lower():
    separator = "&" if "?" in MONGO_URI else "?"
    MONGO_URI += f"{separator}retryWrites=false"
DB_NAME = os.getenv("DB_NAME", "healthsync_notifications")
SERVICEBUS_CONNECTION_STRING = os.getenv("SERVICEBUS_CONNECTION_STRING", "")
ACS_CONNECTION_STRING = os.getenv("ACS_CONNECTION_STRING", "")
ACS_SENDER_EMAIL = os.getenv("ACS_SENDER_EMAIL", "healthsync@15904a49-17e2-4535-baaf-810adca30207.azurecomm.net")

client: Optional[AsyncIOMotorClient] = None
db = None
sb_client: Optional[ServiceBusClient] = None
email_client: Optional[EmailClient] = None
event_tasks: list = []

QUEUES = ["appointment-events", "prescription-events", "doctor-events"]


class NotificationData(BaseModel):
    appointmentId: Optional[str] = None
    prescriptionId: Optional[str] = None
    doctorName: Optional[str] = None
    patientName: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    diagnosis: Optional[str] = None
    amount: Optional[str] = None


class NotificationCreate(BaseModel):
    type: str
    recipientEmail: Optional[str] = None
    recipientName: Optional[str] = None
    data: Optional[NotificationData] = None


class NotificationResponse(BaseModel):
    id: str
    type: str
    recipientEmail: Optional[str] = None
    recipientName: Optional[str] = None
    title: str
    message: str
    status: str
    channel: str
    createdAt: str


def _doctor_display(name: str) -> str:
    """Return doctor name with exactly one 'Dr.' prefix."""
    stripped = name.strip()
    if stripped.lower().startswith("dr.") or stripped.lower().startswith("dr "):
        return stripped
    return f"Dr. {stripped}"


def generate_notification_content(event_type: str, data: dict) -> tuple:
    """Generate title and message for PATIENT based on event type."""
    if event_type in ("appointment.booked", "appointment_booked"):
        doctor = _doctor_display(data.get("doctorName", "your doctor"))
        date = data.get("date", "upcoming")
        time = data.get("time", "")
        return (
            "Appointment Confirmed",
            f"Your appointment with {doctor} has been confirmed for {date} at {time}. Please arrive 15 minutes early."
        )
    elif event_type in ("appointment.confirmed",):
        doctor = _doctor_display(data.get("doctorName", "your doctor"))
        date = data.get("date", "upcoming")
        time = data.get("time", "")
        return (
            "Appointment Confirmed by Doctor",
            f"Great news! {doctor} has confirmed your appointment on {date} at {time}."
        )
    elif event_type in ("appointment.rejected", "appointment_cancelled"):
        reason = data.get("reason", "")
        return (
            "Appointment Cancelled",
            f"Your appointment has been cancelled. {('Reason: ' + reason) if reason else 'Please rebook at your convenience.'}"
        )
    elif event_type in ("prescription.created", "prescription_created"):
        doctor = _doctor_display(data.get("doctorName", "your doctor"))
        return (
            "New Prescription Available",
            f"{doctor} has issued a new prescription for you. View it in your HealthSync dashboard."
        )
    elif event_type == "payment_received":
        doctor = _doctor_display(data.get("doctorName", "your doctor"))
        amount = data.get("amount", "")
        return (
            "Payment Confirmed",
            f"Your payment of {amount} for consultation with {doctor} has been confirmed. Thank you!"
        )
    elif event_type == "payment_received_doctor":
        patient = data.get("patientName", "A patient")
        amount = data.get("amount", "")
        return (
            "Payment Received",
            f"Payment of {amount} from {patient} has been confirmed for your consultation."
        )
    elif event_type == "appointment_reminder":
        return (
            "Appointment Reminder",
            "You have an upcoming appointment tomorrow. Don't forget to bring your insurance card."
        )
    else:
        return ("HealthSync Notification", f"You have a new notification: {event_type}")


def generate_doctor_content(event_type: str, data: dict) -> Optional[tuple]:
    """Generate title and message for DOCTOR. Returns None if no doctor notification needed."""
    patient = data.get("patientName", "A patient")
    date = data.get("date", "upcoming")
    time = data.get("time", "")

    if event_type in ("appointment.booked", "appointment_booked"):
        return (
            "New Appointment Booking",
            f"{patient} has booked an appointment with you on {date} at {time}. Please review and confirm."
        )
    elif event_type in ("prescription.created", "prescription_created"):
        return (
            "Prescription Issued",
            f"Your prescription for {patient} has been recorded successfully in HealthSync."
        )
    elif event_type == "payment_received_doctor":
        amount = data.get("amount", "")
        return (
            "Payment Received",
            f"Payment of {amount} from {patient} has been confirmed for your consultation."
        )
    return None


# ─── Email HTML template ───
EMAIL_TEMPLATE = """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 32px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏥 HealthSync</h1>
  </div>
  <div style="padding: 32px; color: #e2e8f0;">
    <h2 style="color: #06b6d4; margin-top: 0;">{{ title }}</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hi {{ name }},</p>
    <p style="font-size: 16px; line-height: 1.6;">{{ message }}</p>
    <div style="margin-top: 24px; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 4px solid #06b6d4;">
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">This is an automated notification from HealthSync. Do not reply to this email.</p>
    </div>
  </div>
  <div style="padding: 16px 32px; background: #1e293b; text-align: center;">
    <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 HealthSync Healthcare Platform</p>
  </div>
</div>
"""

jinja_env = Environment(loader=BaseLoader())
email_tmpl = jinja_env.from_string(EMAIL_TEMPLATE)


async def send_email(to_email: str, subject: str, name: str, title: str, message: str):
    """Send email notification via Azure Communication Services Email."""
    if not email_client:
        print(f"📧 [EMAIL-SKIP] No ACS Email configured. Would send to {to_email}: {subject}")
        return

    try:
        html = email_tmpl.render(title=title, name=name, message=message)
        email_message = {
            "senderAddress": ACS_SENDER_EMAIL,
            "recipients": {
                "to": [{"address": to_email, "displayName": name}]
            },
            "content": {
                "subject": f"HealthSync: {subject}",
                "plainText": message,
                "html": html,
            },
        }
        loop = asyncio.get_event_loop()
        max_retries = 5
        delays = [5, 10, 20, 30]
        for attempt in range(max_retries):
            try:
                result = await loop.run_in_executor(
                    None, lambda: email_client.begin_send(email_message).result()
                )
                print(f"📧 [EMAIL-SENT] {subject} → {to_email} (id: {result['id']})")
                return
            except Exception as retry_err:
                if "TooManyRequests" in str(retry_err) and attempt < max_retries - 1:
                    wait = delays[min(attempt, len(delays) - 1)]
                    print(f"📧 [EMAIL-RETRY] Rate limited, waiting {wait}s (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait)
                else:
                    raise retry_err
    except Exception as e:
        print(f"📧 [EMAIL-ERROR] Failed to send to {to_email}: {e}")


def _dedup_key(data: dict) -> Optional[str]:
    """Build a deduplication key from event data."""
    pid = data.get("prescriptionId")
    aid = data.get("appointmentId")
    return pid or aid or None


async def _already_notified(event_type: str, dedup_key: str, recipient_email: str) -> bool:
    """Check if an in-app notification already exists for this event+recipient."""
    if not dedup_key or not recipient_email:
        return False
    existing = await db.notifications.find_one({
        "type": event_type,
        "recipientEmail": recipient_email,
        "channel": "in-app",
        "$or": [
            {"data.prescriptionId": dedup_key},
            {"data.appointmentId": dedup_key},
        ],
    })
    return existing is not None


async def process_event(event_type: str, data: dict):
    """Process a single event: save to DB + send email. Deduplicates by event key."""
    now = datetime.utcnow().isoformat()
    title, message = generate_notification_content(event_type, data)
    patient_email = data.get("patientEmail") or data.get("recipientEmail")
    patient_name = data.get("patientName") or data.get("recipientName") or "Patient"
    doctor_email = data.get("doctorEmail")
    doctor_name = data.get("doctorName", "Doctor")
    dedup = _dedup_key(data)

    # ─── Patient notification ───
    if not await _already_notified(event_type, dedup, patient_email):
        doc = {
            "type": event_type,
            "recipientEmail": patient_email,
            "recipientName": patient_name,
            "title": title,
            "message": message,
            "data": data,
            "status": "sent",
            "channel": "in-app",
            "readAt": None,
            "createdAt": now,
        }
        await db.notifications.insert_one(doc)

        if patient_email:
            await send_email(patient_email, title, patient_name, title, message)
            await db.notifications.insert_one({
                **doc, "_id": ObjectId(), "channel": "email", "status": "sent",
            })
    else:
        print(f"🔔 [DEDUP-SKIP] {event_type} already sent to patient={patient_email}")

    # ─── Doctor notification (skip entirely for prescriptions — doctor just created it) ───
    is_prescription = event_type in ("prescription.created", "prescription_created")
    if is_prescription:
        print(f"🔔 [SKIP-DOCTOR] Prescription notification not needed for doctor={doctor_email}")
    elif not await _already_notified(event_type, dedup, doctor_email):
        doctor_content = generate_doctor_content(event_type, data)
        if doctor_content and doctor_email:
            d_title, d_message = doctor_content
            d_doc = {
                "type": event_type,
                "recipientEmail": doctor_email,
                "recipientName": doctor_name,
                "title": d_title,
                "message": d_message,
                "data": data,
                "status": "sent",
                "channel": "in-app",
                "readAt": None,
                "createdAt": now,
            }
            await db.notifications.insert_one(d_doc)
            await send_email(doctor_email, d_title, doctor_name, d_title, d_message)
            await db.notifications.insert_one({
                **d_doc, "_id": ObjectId(), "channel": "email", "status": "sent",
            })
    else:
        print(f"🔔 [DEDUP-SKIP] {event_type} already sent to doctor={doctor_email}")

    print(f"🔔 [PROCESSED] {event_type} for patient={patient_email or 'unknown'} doctor={doctor_email or 'unknown'}")


async def consume_queue(queue_name: str):
    """Continuously consume messages from a Service Bus queue."""
    if not sb_client:
        return
    receiver = sb_client.get_queue_receiver(queue_name=queue_name, max_wait_time=5)
    print(f"🔔 Listening on queue: {queue_name}")

    async with receiver:
        while True:
            try:
                messages = await receiver.receive_messages(max_message_count=10, max_wait_time=10)
                for msg in messages:
                    try:
                        body = json.loads(str(msg))
                        event_type = body.get("eventType", "unknown")
                        data = body.get("data", {})
                        await process_event(event_type, data)
                        await receiver.complete_message(msg)
                    except Exception as e:
                        print(f"🔔 [ERROR] Processing message from {queue_name}: {e}")
                        await receiver.abandon_message(msg)

                if not messages:
                    await asyncio.sleep(1)
            except Exception as e:
                print(f"🔔 [ERROR] Queue {queue_name} receiver: {e}")
                await asyncio.sleep(5)


@app.on_event("startup")
async def startup():
    global client, db, sb_client, email_client
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    print("🔔 Connected to MongoDB (notifications)")

    # ── Deduplicate existing in-app notifications on startup (Cosmos DB compatible) ──
    try:
        duplicates = 0
        seen = set()  # (type, recipientEmail, prescriptionId or appointmentId)
        cursor = db.notifications.find({"channel": "in-app"}).sort("_id", 1)
        async for doc in cursor:
            key = (
                doc.get("type", ""),
                doc.get("recipientEmail", ""),
                (doc.get("data") or {}).get("prescriptionId", ""),
                (doc.get("data") or {}).get("appointmentId", ""),
            )
            if key in seen:
                await db.notifications.delete_one({"_id": doc["_id"]})
                duplicates += 1
            else:
                seen.add(key)
        # Also remove email-channel duplicates (only in-app should display)
        email_del = await db.notifications.delete_many({"channel": "email"})
        duplicates += email_del.deleted_count
        if duplicates:
            print(f"🧹 Cleaned up {duplicates} duplicate/email notifications")
    except Exception as e:
        print(f"🧹 Dedup cleanup error: {e}")

    # Initialize ACS Email client
    if ACS_CONNECTION_STRING:
        email_client = EmailClient.from_connection_string(ACS_CONNECTION_STRING)
        print(f"📧 ACS Email client initialized (sender: {ACS_SENDER_EMAIL})")
    else:
        print("📧 No ACS_CONNECTION_STRING — emails will be skipped")

    # Start Service Bus consumers
    if SERVICEBUS_CONNECTION_STRING:
        sb_client = ServiceBusClient.from_connection_string(SERVICEBUS_CONNECTION_STRING)
        for queue_name in QUEUES:
            task = asyncio.create_task(consume_queue(queue_name))
            event_tasks.append(task)
        print(f"🔔 Service Bus consumers started for {len(QUEUES)} queues")
    else:
        print("🔔 No SERVICEBUS_CONNECTION_STRING — running in HTTP-only mode")


@app.on_event("shutdown")
async def shutdown():
    global sb_client, email_client
    for task in event_tasks:
        task.cancel()
    if sb_client:
        await sb_client.close()
        sb_client = None
    email_client = None
    if client:
        client.close()


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "notification-service", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api", response_model=NotificationResponse)
@app.post("/api/notifications", response_model=NotificationResponse)
async def create_notification(notif: NotificationCreate):
    data_dict = notif.data.dict() if notif.data else {}
    title, message = generate_notification_content(notif.type, data_dict)
    now = datetime.utcnow().isoformat()

    # Dedup check: skip if same notification already exists for this recipient
    dedup = _dedup_key(data_dict)
    if dedup and notif.recipientEmail:
        if await _already_notified(notif.type, dedup, notif.recipientEmail):
            # Return existing notification instead of creating duplicate
            existing = await db.notifications.find_one({
                "type": notif.type, "recipientEmail": notif.recipientEmail, "channel": "in-app",
            })
            if existing:
                existing["id"] = str(existing.pop("_id"))
                return NotificationResponse(
                    id=existing["id"], type=existing.get("type", notif.type),
                    recipientEmail=existing.get("recipientEmail"), recipientName=existing.get("recipientName"),
                    title=existing.get("title", title), message=existing.get("message", message),
                    status=existing.get("status", "sent"), channel="in-app",
                    createdAt=existing.get("createdAt", now),
                )

    doc = {
        "type": notif.type,
        "recipientEmail": notif.recipientEmail,
        "recipientName": notif.recipientName,
        "title": title,
        "message": message,
        "data": data_dict,
        "status": "sent",
        "channel": "in-app",
        "readAt": None,
        "createdAt": now,
    }

    result = await db.notifications.insert_one(doc)

    # Send email notification
    if notif.recipientEmail:
        await send_email(notif.recipientEmail, title, notif.recipientName or "Patient", title, message)
        await db.notifications.insert_one({
            **doc,
            "_id": ObjectId(),
            "channel": "email",
            "status": "sent",
        })

    return NotificationResponse(
        id=str(result.inserted_id),
        type=notif.type,
        recipientEmail=notif.recipientEmail,
        recipientName=notif.recipientName,
        title=title,
        message=message,
        status="sent",
        channel="in-app",
        createdAt=now,
    )


@app.get("/api")
@app.get("/api/notifications")
async def get_notifications(
    recipientEmail: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    query = {"channel": {"$ne": "email"}}
    if recipientEmail:
        query["recipientEmail"] = recipientEmail
    if status:
        query["status"] = status

    skip = (page - 1) * limit
    cursor = db.notifications.find(query).sort("_id", -1).skip(skip).limit(limit)
    notifications = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        notifications.append(doc)

    total = await db.notifications.count_documents(query)
    return {"notifications": notifications, "total": total, "page": page, "pages": -(-total // limit)}


@app.get("/api/stats")
@app.get("/api/notifications/stats")
async def get_stats(recipientEmail: Optional[str] = None):
    base = {"channel": {"$ne": "email"}}
    if recipientEmail:
        base["recipientEmail"] = recipientEmail
    total = await db.notifications.count_documents(base)
    unread = await db.notifications.count_documents({**base, "status": "sent"})
    read = await db.notifications.count_documents({**base, "status": "read"})
    return {"total": total, "unread": unread, "sent": unread, "read": read}


@app.patch("/api/{notif_id}/read")
@app.patch("/api/notifications/{notif_id}/read")
async def mark_as_read(notif_id: str):
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notif_id)},
            {"$set": {"status": "read", "readAt": datetime.utcnow().isoformat()}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/{notif_id}")
@app.delete("/api/notifications/{notif_id}")
async def delete_notification(notif_id: str):
    try:
        result = await db.notifications.delete_one({"_id": ObjectId(notif_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api")
@app.delete("/api/notifications")
async def clear_all_notifications(recipientEmail: Optional[str] = None):
    query = {}
    if recipientEmail:
        query["recipientEmail"] = recipientEmail
    result = await db.notifications.delete_many(query)
    return {"message": f"Deleted {result.deleted_count} notifications"}
