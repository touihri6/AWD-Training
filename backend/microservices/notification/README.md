# notification microservice

Python / FastAPI microservice, **no database**, with Swagger documentation generated automatically.
Notifications are stored in memory. The service registers in Eureka as `NOTIFICATION` and discovers `CANDIDAT` through it.

## Run
```bash
cd chemin\vers\notification

# 1. Créer et activer l'environnement virtuel (une seule fois)
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Installer les dépendances
python -m pip install -r requirements.txt

# 3. Lancer le microservice
python -m uvicorn app.main:app --reload --port 8084   # or: python -m app.main
```
- API: http://localhost:8084/api/notifications/hello
- Swagger UI: http://localhost:8084/swagger-ui
- OpenAPI JSON: http://localhost:8084/v3/api-docs
- ReDoc: http://localhost:8084/redoc

Port `8084` (candidat = 8081, job = 8082, meeting = 8083). For another instance, the `PORT` variable and `--port` must match:
`$env:PORT=8094; python -m uvicorn app.main:app --port 8094`.

Start the Eureka server first (http://localhost:8761). A notification with a `candidateId` needs `CANDIDAT` to be registered in Eureka.

## Endpoints
| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /api/notifications/hello | 200 `{"message": "hello I'm microservice notification"}` | |
| GET | /health | 200 `{"status": "UP"}` | |
| GET | /api/notifications?status=PENDING&type=EMAIL | 200 + list (filters optional) | 422 |
| GET | /api/notifications/{id} | 200 + notification | 404 |
| POST | /api/notifications | 201 + created notification (`PENDING`) | 400, 422, 503 |
| PUT | /api/notifications/{id} | 200 + updated notification | 400, 404, 422, 503 |
| PATCH | /api/notifications/{id}/send | 200, status becomes `SENT` | 404, 409 |
| DELETE | /api/notifications/{id} | 204 | 404 |

Notification body: `{ "recipient": "badia@example.com", "subject": "Interview scheduled", "message": "...", "type": "EMAIL", "candidateId": 1 }`.
`recipient` must be a valid email for `EMAIL` and digits only for `SMS`.

## Tests
```bash
pip install -r requirements-dev.txt
pytest
```

## Structure
```
notification/
├── app/
│   ├── main.py                    FastAPI app + Swagger config + Eureka lifespan
│   ├── eureka.py                  Eureka client (register, stop)
│   ├── schemas.py                 Pydantic models (validation + Swagger schemas)
│   ├── routers/health.py          /health
│   ├── routers/notification.py    /api/notifications routes
│   └── services/
│       ├── notification_service.py   in-memory notifications
│       └── candidate_client.py       calls CANDIDAT through Eureka
├── tests/test_hello.py
├── tests/test_notification.py
├── requirements.txt / requirements-dev.txt
└── pytest.ini
```
