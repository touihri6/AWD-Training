import random

import httpx
from fastapi import HTTPException
from py_eureka_client import eureka_client

CANDIDAT_APP_ID = "CANDIDAT"


def _candidat_url() -> str:
    client = eureka_client.get_client()
    instances = []
    if client is not None and client.applications is not None:
        instances = client.applications.get_application(CANDIDAT_APP_ID).up_instances
    if not instances:
        raise HTTPException(status_code=503, detail=f"No available instance of {CANDIDAT_APP_ID} in Eureka")
    instance = random.choice(instances)
    return f"http://{instance.hostName}:{instance.port.port}"


async def ensure_candidate_exists(candidate_id: int) -> None:
    url = f"{_candidat_url()}/api/candidates/{candidate_id}"
    try:
        async with httpx.AsyncClient(timeout=5) as http:
            response = await http.get(url)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=503, detail=f"{CANDIDAT_APP_ID} is unreachable") from error

    if response.status_code == 404:
        raise HTTPException(status_code=400, detail=f"Candidate {candidate_id} not found")
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"{CANDIDAT_APP_ID} answered with status {response.status_code}",
        )
