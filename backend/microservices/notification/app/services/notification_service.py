from datetime import datetime, timezone
from itertools import count

from fastapi import HTTPException

from app.schemas import Notification, NotificationCreate, NotificationStatus, NotificationType
from app.services import candidate_client

notifications: dict[int, Notification] = {}
_ids = count(1)


def find_all(
    status: NotificationStatus | None = None,
    type: NotificationType | None = None,
) -> list[Notification]:
    return [
        notification
        for notification in notifications.values()
        if (status is None or notification.status == status)
        and (type is None or notification.type == type)
    ]


def find_by_id(notification_id: int) -> Notification:
    notification = notifications.get(notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail=f"Notification {notification_id} not found")
    return notification


async def create(body: NotificationCreate) -> Notification:
    if body.candidateId is not None:
        await candidate_client.ensure_candidate_exists(body.candidateId)
    notification = Notification(
        id=next(_ids),
        status=NotificationStatus.PENDING,
        createdAt=datetime.now(timezone.utc),
        **body.model_dump(),
    )
    notifications[notification.id] = notification
    return notification


async def update(notification_id: int, body: NotificationCreate) -> Notification:
    existing = find_by_id(notification_id)
    if body.candidateId is not None:
        await candidate_client.ensure_candidate_exists(body.candidateId)
    updated = existing.model_copy(update=body.model_dump())
    notifications[notification_id] = updated
    return updated


def send(notification_id: int) -> Notification:
    notification = find_by_id(notification_id)
    if notification.status == NotificationStatus.SENT:
        raise HTTPException(status_code=409, detail=f"Notification {notification_id} is already sent")
    sent = notification.model_copy(update={"status": NotificationStatus.SENT})
    notifications[notification_id] = sent
    return sent


def delete(notification_id: int) -> None:
    find_by_id(notification_id)
    del notifications[notification_id]
