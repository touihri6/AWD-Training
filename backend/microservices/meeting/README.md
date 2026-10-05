# meeting microservice

Node.js / Express microservice, **no database**, documented with Swagger (OpenAPI 3).
Meetings are stored in memory. The service registers in Eureka as `MEETING` and discovers `CANDIDAT` through it.

## Run
```bash
npm install
npm start          # or: npm run dev  (auto-restart on changes)
```
- API: http://localhost:8083/api/meetings/hello
- Swagger UI: http://localhost:8083/swagger-ui
- OpenAPI JSON: http://localhost:8083/v3/api-docs

Port: `8083` by default (candidat = 8081, job = 8082). Change with `PORT=9000 npm start` (or `$env:PORT=9000; npm start` in PowerShell).

Start the Eureka server first (http://localhost:8761). Creating or updating a meeting needs `CANDIDAT` to be registered in Eureka.

## Endpoints
| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /api/meetings/hello | 200 `{"message": "hello I'm microservice meeting"}` | |
| GET | /health | 200 `{"status": "UP"}` | |
| GET | /api/meetings?candidateId=1&jobId=1 | 200 + list (filters optional) | 400 |
| GET | /api/meetings/:id | 200 + meeting | 404 |
| POST | /api/meetings | 201 + created meeting | 400, 409, 503 |
| PUT | /api/meetings/:id | 200 + updated meeting | 400, 404, 409, 503 |
| DELETE | /api/meetings/:id | 204 | 404 |
| GET | /api/meetings/candidates/:id | candidate from CANDIDAT (via Eureka) | 404, 503 |

Meeting body: `{ "title": "Technical interview", "date": "2026-10-05T10:00:00Z", "candidateId": 1, "jobId": 1 }`.
A candidate cannot have two meetings at the same date (409). Errors use `{ "status", "error", "message" }`.

## Tests
```bash
npm test
```
Uses Node's built-in test runner (`node:test`), Node 18+.

## Structure
```
meeting/
├── src/
│   ├── server.js                      starts the HTTP server
│   ├── app.js                         Express app: JSON, Swagger, routes, 404, errors
│   ├── config/swagger.js              OpenAPI spec
│   ├── config/eureka.js               Eureka client (register, deregister, discovery)
│   ├── routes/meeting.routes.js       URL -> controller mapping
│   ├── controllers/meeting.controller.js   request handling
│   ├── services/meeting.service.js    in-memory meetings, validation, conflicts
│   ├── services/candidate.service.js  calls CANDIDAT through Eureka
│   └── utils/http-error.js            error with an HTTP status
├── test/hello.test.js
├── test/meeting.test.js
└── package.json
```
