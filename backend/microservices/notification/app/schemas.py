"""Pydantic schemas: they validate data AND generate the Swagger documentation."""
import re
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, model_validator

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"^\d+$")


class HelloResponse(BaseModel):
    message: str = Field(..., examples=["hello I'm microservice notification"])


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["UP"])


class NotificationType(str, Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"


class NotificationStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"


class NotificationCreate(BaseModel):
    recipient: str = Field(..., min_length=1, examples=["badia@example.com"])
    subject: str = Field(..., min_length=1, max_length=150, examples=["Interview scheduled"])
    message: str = Field(..., min_length=1, examples=["Your interview is on 2026-10-05 at 10:00"])
    type: NotificationType = NotificationType.EMAIL
    candidateId: int | None = Field(None, examples=[1])

    @model_validator(mode="after")
    def check_recipient(self) -> "NotificationCreate":
        if self.type == NotificationType.EMAIL and not EMAIL_PATTERN.match(self.recipient):
            raise ValueError("recipient must be a valid email address for EMAIL notifications")
        if self.type == NotificationType.SMS and not PHONE_PATTERN.match(self.recipient):
            raise ValueError("recipient must contain digits only for SMS notifications")
        return self


class Notification(NotificationCreate):
    id: int = Field(..., examples=[1])
    status: NotificationStatus = Field(..., examples=[NotificationStatus.PENDING])
    createdAt: datetime
