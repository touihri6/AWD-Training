from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Declared as healthCheckUrl and statusPageUrl in Eureka.",
)
def health() -> HealthResponse:
    return HealthResponse(status="UP")
