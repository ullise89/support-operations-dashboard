from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db, IncidentDB
from app.models import IncidentCreate, IncidentUpdate, IncidentResponse
from app.logger import get_logger
from app.auth import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents"])
logger = get_logger("incidents")


@router.get("/", response_model=list[IncidentResponse])
def get_all_incidents(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    logger.info(f"{user['username']} fetching all incidents")
    return db.query(IncidentDB).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        logger.warning(f"Incident {incident_id} not found")
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        logger.warning(f"Incident {incident_id} not found")
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/", response_model=IncidentResponse, status_code=201)
def create_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    incident = IncidentDB(**data.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    logger.info(f"{user['username']} created incident: {incident.title}")
    return incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    data: IncidentUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if data.status:
        incident.status = data.status
        if data.status == "resolved":
            incident.resolved_at = datetime.utcnow()

    if data.priority:
        incident.priority = data.priority

    db.commit()
    db.refresh(incident)
    logger.info(f"{user['username']} updated incident {incident_id}")
    return incident


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    db.delete(incident)
    db.commit()
    logger.info(f"{user['username']} deleted incident {incident_id}")
    return {"message": f"Incident {incident_id} deleted"}