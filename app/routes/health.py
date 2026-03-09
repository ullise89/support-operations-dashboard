from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from app.database import get_db
from app.logger import get_logger

router = APIRouter(tags=["Health"])
logger = get_logger("health")


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"

    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"

    overall_status = "ok" if db_status == "healthy" else "degraded"

    logger.info(f"Health check requested | database: {db_status}")

    return {
        "status": overall_status,
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }