"""Notification routes: /api/notifications/..."""
from fastapi import APIRouter, Query, Response

from app.schemas import (
    HelloResponse,
    Notification,
    NotificationCreate,
    NotificationStatus,
    NotificationType,
)
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

NOT_FOUND = {404: {"description": "Notification not found"}}
CANDIDATE_ERRORS = {
    400: {"description": "Candidate not found in the candidat microservice"},
    503: {"description": "No CANDIDAT instance available in Eureka"},
}


@router.get(
    "/hello",
    response_model=HelloResponse,
    summary="Hello from the notification microservice",
    description="Checks that the microservice is up and returns a greeting message.",
)
def hello() -> HelloResponse:
    return HelloResponse(message="hello I'm microservice notification")


@router.get(
    "",
    response_model=list[Notification],
    summary="List notifications",
    description="Optionally filtered by status and/or type.",
)
def find_all(
    status: NotificationStatus | None = Query(None),
    type: NotificationType | None = Query(None),
) -> list[Notification]:
    return notification_service.find_all(status=status, type=type)


@router.get(
    "/{notification_id}",
    response_model=Notification,
    summary="Get a notification",
    responses=NOT_FOUND,
)
def find_by_id(notification_id: int) -> Notification:
    return notification_service.find_by_id(notification_id)


@router.post(
    "",
    response_model=Notification,
    status_code=201,
    summary="Create a notification",
    description="Created with status PENDING. If candidateId is set, the candidate must exist.",
    responses=CANDIDATE_ERRORS,
)
async def create(body: NotificationCreate) -> Notification:
    return await notification_service.create(body)


@router.put(
    "/{notification_id}",
    response_model=Notification,
    summary="Update a notification",
    description="If candidateId is set, the candidate must exist.",
    responses={**NOT_FOUND, **CANDIDATE_ERRORS},
)
async def update(notification_id: int, body: NotificationCreate) -> Notification:
    return await notification_service.update(notification_id, body)


@router.patch(
    "/{notification_id}/send",
    response_model=Notification,
    summary="Mark a notification as sent",
    responses={**NOT_FOUND, 409: {"description": "Notification already sent"}},
)
def send(notification_id: int) -> Notification:
    return notification_service.send(notification_id)


@router.delete(
    "/{notification_id}",
    status_code=204,
    summary="Delete a notification",
    responses=NOT_FOUND,
)
def delete(notification_id: int) -> Response:
    notification_service.delete(notification_id)
    return Response(status_code=204)
