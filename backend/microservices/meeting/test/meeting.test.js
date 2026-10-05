const { test, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const candidateService = require('../src/services/candidate.service');
const httpError = require('../src/utils/http-error');

const realEnsureExists = candidateService.ensureExists;

let server;
let baseUrl;
let dateOffset = 0;

const nextDate = () => {
  dateOffset += 1;
  return new Date(Date.UTC(2026, 9, 5, 8) + dateOffset * 3600000).toISOString();
};

const meetingBody = (overrides = {}) => ({
  title: 'Technical interview',
  date: nextDate(),
  candidateId: 1,
  jobId: 1,
  ...overrides,
});

const send = (method, path, body) => fetch(`${baseUrl}${path}`, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

const createMeeting = async (overrides) => {
  const res = await send('POST', '/api/meetings', meetingBody(overrides));
  assert.equal(res.status, 201);
  return res.json();
};

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

beforeEach(() => {
  mock.restoreAll();
  mock.method(candidateService, 'ensureExists', async () => {});
});

test('POST /api/meetings creates a meeting', async () => {
  const body = meetingBody({ candidateId: 7, jobId: 3 });
  const res = await send('POST', '/api/meetings', body);
  assert.equal(res.status, 201);
  const meeting = await res.json();
  assert.ok(Number.isInteger(meeting.id));
  assert.equal(meeting.title, body.title);
  assert.equal(meeting.date, body.date);
  assert.equal(meeting.candidateId, 7);
  assert.equal(meeting.jobId, 3);
  assert.equal(candidateService.ensureExists.mock.calls[0].arguments[0], 7);
});

test('POST /api/meetings returns 400 for an invalid body', async () => {
  const cases = [
    meetingBody({ title: '  ' }),
    meetingBody({ date: 'not-a-date' }),
    meetingBody({ date: '2026-13-45T10:00:00Z' }),
    meetingBody({ candidateId: '1' }),
    meetingBody({ jobId: undefined }),
  ];
  for (const body of cases) {
    const res = await send('POST', '/api/meetings', body);
    assert.equal(res.status, 400);
    const error = await res.json();
    assert.equal(error.status, 400);
    assert.equal(error.error, 'Bad Request');
    assert.ok(error.message);
  }
});

test('POST /api/meetings returns 400 when the candidate does not exist', async () => {
  mock.method(candidateService, 'ensureExists', async (id) => {
    throw httpError(400, `Candidate ${id} not found`);
  });
  const res = await send('POST', '/api/meetings', meetingBody({ candidateId: 999 }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, 'Candidate 999 not found');
});

test('POST /api/meetings returns 503 when CANDIDAT is not available', async () => {
  mock.method(candidateService, 'ensureExists', realEnsureExists);
  const res = await send('POST', '/api/meetings', meetingBody());
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, 'Service Unavailable');
});

test('POST /api/meetings returns 409 for the same candidate at the same date', async () => {
  const first = await createMeeting({ candidateId: 42 });
  const res = await send('POST', '/api/meetings', meetingBody({ candidateId: 42, date: first.date }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'Conflict');
});

test('GET /api/meetings returns the list', async () => {
  const created = await createMeeting();
  const res = await fetch(`${baseUrl}/api/meetings`);
  assert.equal(res.status, 200);
  const meetings = await res.json();
  assert.ok(Array.isArray(meetings));
  assert.ok(meetings.some((meeting) => meeting.id === created.id));
});

test('GET /api/meetings filters by candidateId and jobId', async () => {
  const match = await createMeeting({ candidateId: 501, jobId: 601 });
  await createMeeting({ candidateId: 501, jobId: 602 });
  await createMeeting({ candidateId: 502, jobId: 601 });

  const byCandidate = await (await fetch(`${baseUrl}/api/meetings?candidateId=501`)).json();
  assert.equal(byCandidate.length, 2);
  assert.ok(byCandidate.every((meeting) => meeting.candidateId === 501));

  const byJob = await (await fetch(`${baseUrl}/api/meetings?jobId=601`)).json();
  assert.equal(byJob.length, 2);
  assert.ok(byJob.every((meeting) => meeting.jobId === 601));

  const both = await (await fetch(`${baseUrl}/api/meetings?candidateId=501&jobId=601`)).json();
  assert.deepEqual(both, [match]);

  const invalid = await fetch(`${baseUrl}/api/meetings?candidateId=abc`);
  assert.equal(invalid.status, 400);
});

test('GET /api/meetings/:id returns the meeting or 404', async () => {
  const created = await createMeeting();
  const res = await fetch(`${baseUrl}/api/meetings/${created.id}`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), created);

  const missing = await fetch(`${baseUrl}/api/meetings/99999`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { status: 404, error: 'Not Found', message: 'Meeting 99999 not found' });
});

test('PUT /api/meetings/:id updates the meeting', async () => {
  const created = await createMeeting();
  const body = meetingBody({ title: 'HR interview', jobId: 2 });
  const res = await send('PUT', `/api/meetings/${created.id}`, body);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { id: created.id, ...body });
});

test('PUT /api/meetings/:id keeps its own date without conflict', async () => {
  const created = await createMeeting({ candidateId: 77 });
  const res = await send('PUT', `/api/meetings/${created.id}`, { ...created, title: 'Renamed' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).title, 'Renamed');
});

test('PUT /api/meetings/:id returns 400, 404 and 409', async () => {
  const created = await createMeeting({ candidateId: 88 });
  const other = await createMeeting({ candidateId: 88 });

  const invalid = await send('PUT', `/api/meetings/${created.id}`, meetingBody({ title: '' }));
  assert.equal(invalid.status, 400);

  const missing = await send('PUT', '/api/meetings/99999', meetingBody());
  assert.equal(missing.status, 404);

  const conflict = await send('PUT', `/api/meetings/${created.id}`, meetingBody({ candidateId: 88, date: other.date }));
  assert.equal(conflict.status, 409);
});

test('DELETE /api/meetings/:id deletes the meeting or returns 404', async () => {
  const created = await createMeeting();
  const res = await send('DELETE', `/api/meetings/${created.id}`);
  assert.equal(res.status, 204);

  const after = await fetch(`${baseUrl}/api/meetings/${created.id}`);
  assert.equal(after.status, 404);

  const again = await send('DELETE', `/api/meetings/${created.id}`);
  assert.equal(again.status, 404);
});

test('GET /api/meetings/candidates/:id returns 503 without Eureka', async () => {
  const res = await fetch(`${baseUrl}/api/meetings/candidates/1`);
  assert.equal(res.status, 503);
});

test('GET /api/meetings/hello still works next to /:id', async () => {
  const res = await fetch(`${baseUrl}/api/meetings/hello`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { message: "hello I'm microservice meeting" });
});
