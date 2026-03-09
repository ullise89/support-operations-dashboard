from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str
    priority: Literal["low", "medium", "high"] = "medium"
    service: str


class IncidentUpdate(BaseModel):
    status: Optional[Literal["open", "in_progress", "resolved"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None


class IncidentResponse(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    service: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LogAnalysisRequest(BaseModel):
    content: str


class ServiceCheckRequest(BaseModel):
    name: str
    url: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    role: Literal["admin", "standard"]