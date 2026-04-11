import os
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI(title="HealthSync Notification Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
DB_NAME = "healthsync_notifications"
client: Optional[AsyncIOMotorClient] = None
db = None


class NotificationData(BaseModel):
    appointmentId: Optional[str] = None
    prescriptionId: Optional[str] = None
    doctorName: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    diagnosis: Optional[str] = None


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


def generate_notification_content(notif_type: str, data: Optional[NotificationData]) -> tuple:
    """Generate title and message based on notification type."""
    if notif_type == "appointment_booked":
        doctor = data.doctorName if data else "your doctor"
        date = data.date if data else "upcoming"
        time = data.time if data else ""
        return (
            "Appointment Confirmed",
            f"Your appointment with Dr. {doctor} has been confirmed for {date} at {time}. Please arrive 15 minutes early."
        )
    elif notif_type == "appointment_cancelled":
        return (
            "Appointment Cancelled",
            "Your appointment has been cancelled. Please rebook at your convenience."
        )
    elif notif_type == "prescription_created":
        doctor = data.doctorName if data else "your doctor"
        return (
            "New Prescription Available",
            f"Dr. {doctor} has issued a new prescription for you. View it in your HealthSync dashboard."
        )
    elif notif_type == "appointment_reminder":
        return (
            "Appointment Reminder",
            "You have an upcoming appointment tomorrow. Don't forget to bring your insurance card."
        )
    else:
        return ("HealthSync Notification", f"You have a new notification: {notif_type}")


@app.on_event("startup")
async def startup():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    print("🔔 Connected to MongoDB (notifications)")


@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "notification-service", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api", response_model=NotificationResponse)
@app.post("/api/notifications", response_model=NotificationResponse)
async def create_notification(notif: NotificationCreate):
    title, message = generate_notification_content(notif.type, notif.data)

    doc = {
        "type": notif.type,
        "recipientEmail": notif.recipientEmail,
        "recipientName": notif.recipientName,
        "title": title,
        "message": message,
        "data": notif.data.dict() if notif.data else {},
        "status": "sent",
        "channel": "in-app",
        "readAt": None,
        "createdAt": datetime.utcnow().isoformat(),
    }

    result = await db.notifications.insert_one(doc)

    return NotificationResponse(
        id=str(result.inserted_id),
        type=notif.type,
        recipientEmail=notif.recipientEmail,
        recipientName=notif.recipientName,
        title=title,
        message=message,
        status="sent",
        channel="in-app",
        createdAt=doc["createdAt"],
    )


@app.get("/api")
@app.get("/api/notifications")
async def get_notifications(
    recipientEmail: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    query = {}
    if recipientEmail:
        query["recipientEmail"] = recipientEmail
    if status:
        query["status"] = status

    skip = (page - 1) * limit
    cursor = db.notifications.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    notifications = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        notifications.append(doc)

    total = await db.notifications.count_documents(query)
    return {"notifications": notifications, "total": total, "page": page, "pages": -(-total // limit)}


@app.get("/api/stats")
@app.get("/api/notifications/stats")
async def get_stats():
    total = await db.notifications.count_documents({})
    sent = await db.notifications.count_documents({"status": "sent"})
    read = await db.notifications.count_documents({"status": "read"})
    return {"total": total, "sent": sent, "read": read}


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
