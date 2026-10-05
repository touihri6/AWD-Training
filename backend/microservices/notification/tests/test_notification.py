import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.services import candidate_client, notification_service

client = TestClient(app)

real_ensure_candidate_exists = candidate_client.ensure_candidate_exists


@pytest.fixture(autouse=True)
def candidate_exists(monkeypatch):
    checked = []

    async def fake_ensure_candidate_exists(candidate_id: int) -> None:
        checked.append(candidate_id)

    monkeypatch.setattr(candidate_client, "ensure_candidate_exists", fake_ensure_candidate_exists)
    notification_service.notifications.clear()
    return checked


def notification_body(**overrides):
    body = {
        "recipient": "badia@example.com",
        "subject": "Interview scheduled",
        "message": "Your interview is on 2026-10-05 at 10:00",
        "type": "EMAIL",
        "candidateId": None,
    }
    body.update(overrides)
    return body


def create_notification(**overrides):
    res = client.post("/api/notifications", json=notification_body(**overrides))
    assert res.status_code == 201
    return res.json()


def test_create_notification(candidate_exists):
    res = client.post("/api/notifications", json=notification_body(candidateId=3))
    assert res.status_code == 201
    created = res.json()
    assert isinstance(created["id"], int)
    assert created["status"] == "PENDING"
    assert created["type"] == "EMAIL"
    assert created["candidateId"] == 3
    assert created["createdAt"]
    assert candidate_exists == [3]


def test_create_defaults_to_email():
    body = notification_body()
    del body["type"]
    res = client.post("/api/notifications", json=body)
    assert res.status_code == 201
    assert res.json()["type"] == "EMAIL"


def test_create_without_candidate_does_not_call_candidat(candidate_exists):
    create_notification()
    assert candidate_exists == []


@pytest.mark.parametrize(
    "overrides",
    [
        {"recipient": ""},
        {"subject": ""},
        {"subject": "x" * 151},
        {"message": ""},
        {"type": "FAX"},
        {"recipient": "not-an-email", "type": "EMAIL"},
        {"recipient": "+216 55 123", "type": "SMS"},
    ],
)
def test_create_invalid_body_returns_422(overrides):
    res = client.post("/api/notifications", json=notification_body(**overrides))
    assert res.status_code == 422


def test_create_sms_with_digits():
    res = client.post("/api/notifications", json=notification_body(recipient="21655123456", type="SMS"))
    assert res.status_code == 201
    assert res.json()["type"] == "SMS"


def test_create_with_unknown_candidate_returns_400(monkeypatch):
    async def missing_candidate(candidate_id: int) -> None:
        raise HTTPException(status_code=400, detail=f"Candidate {candidate_id} not found")

    monkeypatch.setattr(candidate_client, "ensure_candidate_exists", missing_candidate)
    res = client.post("/api/notifications", json=notification_body(candidateId=999))
    assert res.status_code == 400
    assert res.json()["detail"] == "Candidate 999 not found"


def test_create_returns_503_when_candidat_is_not_available(monkeypatch):
    monkeypatch.setattr(candidate_client, "ensure_candidate_exists", real_ensure_candidate_exists)
    res = client.post("/api/notifications", json=notification_body(candidateId=1))
    assert res.status_code == 503


def test_find_all_returns_list():
    first = create_notification()
    second = create_notification(subject="Second")
    res = client.get("/api/notifications")
    assert res.status_code == 200
    assert [item["id"] for item in res.json()] == [first["id"], second["id"]]


def test_find_all_filters_by_status_and_type():
    email = create_notification()
    sms = create_notification(recipient="21655123456", type="SMS")
    client.patch(f"/api/notifications/{sms['id']}/send")

    pending = client.get("/api/notifications", params={"status": "PENDING"}).json()
    assert [item["id"] for item in pending] == [email["id"]]

    sent_sms = client.get("/api/notifications", params={"status": "SENT", "type": "SMS"}).json()
    assert [item["id"] for item in sent_sms] == [sms["id"]]

    assert client.get("/api/notifications", params={"type": "EMAIL", "status": "SENT"}).json() == []
    assert client.get("/api/notifications", params={"status": "UNKNOWN"}).status_code == 422


def test_find_by_id():
    created = create_notification()
    res = client.get(f"/api/notifications/{created['id']}")
    assert res.status_code == 200
    assert res.json() == created


def test_find_by_id_returns_404():
    res = client.get("/api/notifications/99999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Notification 99999 not found"


def test_update_notification(candidate_exists):
    created = create_notification()
    body = notification_body(subject="Interview moved", candidateId=5)
    res = client.put(f"/api/notifications/{created['id']}", json=body)
    assert res.status_code == 200
    updated = res.json()
    assert updated["id"] == created["id"]
    assert updated["subject"] == "Interview moved"
    assert updated["candidateId"] == 5
    assert updated["status"] == created["status"]
    assert updated["createdAt"] == created["createdAt"]
    assert candidate_exists == [5]


def test_update_returns_404_and_422():
    created = create_notification()
    assert client.put("/api/notifications/99999", json=notification_body()).status_code == 404
    assert client.put(f"/api/notifications/{created['id']}", json=notification_body(subject="")).status_code == 422


def test_send_notification():
    created = create_notification()
    res = client.patch(f"/api/notifications/{created['id']}/send")
    assert res.status_code == 200
    assert res.json()["status"] == "SENT"


def test_send_returns_409_when_already_sent_and_404_when_missing():
    created = create_notification()
    client.patch(f"/api/notifications/{created['id']}/send")
    again = client.patch(f"/api/notifications/{created['id']}/send")
    assert again.status_code == 409
    assert again.json()["detail"] == f"Notification {created['id']} is already sent"
    assert client.patch("/api/notifications/99999/send").status_code == 404


def test_delete_notification():
    created = create_notification()
    res = client.delete(f"/api/notifications/{created['id']}")
    assert res.status_code == 204
    assert res.content == b""
    assert client.get(f"/api/notifications/{created['id']}").status_code == 404
    assert client.delete(f"/api/notifications/{created['id']}").status_code == 404


def test_hello_still_works_next_to_id_route():
    res = client.get("/api/notifications/hello")
    assert res.status_code == 200
    assert res.json() == {"message": "hello I'm microservice notification"}


def test_routes_are_documented_in_swagger():
    paths = client.get("/v3/api-docs").json()["paths"]
    assert set(paths["/api/notifications"]) == {"get", "post"}
    assert set(paths["/api/notifications/{notification_id}"]) == {"get", "put", "delete"}
    assert "patch" in paths["/api/notifications/{notification_id}/send"]
