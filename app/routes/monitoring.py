from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import urllib.request
import time

from app.database import get_db, IncidentDB
from app.models import ServiceCheckRequest
from app.logger import get_logger
from app.auth import get_current_user

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])
logger = get_logger("monitoring")


@router.post("/check")
def check_service(
    data: ServiceCheckRequest,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    logger.info(f"{user['username']} checking service: {data.name} at {data.url}")

    try:
        start = time.time()
        req = urllib.request.urlopen(data.url, timeout=5)
        latency = round((time.time() - start) * 1000)
        status_code = req.getcode()
        status = "healthy" if status_code == 200 else "degraded"

        logger.info(
            f"Service {data.name} checked by {user['username']} -> {status} | latency: {latency}ms"
        )

        return {
            "service": data.name,
            "url": data.url,
            "status": status,
            "status_code": status_code,
            "latency_ms": latency
        }

    except Exception as e:
        logger.error(f"Service {data.name} checked by {user['username']} is DOWN: {e}")
        return {
            "service": data.name,
            "url": data.url,
            "status": "down",
            "error": str(e)
        }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    total = db.query(IncidentDB).count()
    open_count = db.query(IncidentDB).filter(IncidentDB.status == "open").count()
    resolved = db.query(IncidentDB).filter(IncidentDB.status == "resolved").count()
    high_priority = db.query(IncidentDB).filter(IncidentDB.priority == "high").count()

    logger.info(f"Stats requested by {user['username']} ({user['role']})")

    return {
        "total_incidents": total,
        "open": open_count,
        "resolved": resolved,
        "high_priority": high_priority
    }