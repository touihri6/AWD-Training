const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { meetingService } = require('../src/services/meeting.service');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  meetingService.handleApplicationSubmitted({
    eventId: 'api-evt-1',
    eventType: 'ApplicationSubmitted',
    applicationId: 6,
    candidateId: 4,
    candidateFirstname: 'Lina',
    candidateLastname: 'Mansour',
    jobId: 1,
    jobName: 'Java Spring Boot Developer',
  });
});

after(() => server.close());

test('GET /api/meetings lists the interviews created from events', async () => {
  const res = await fetch(`${baseUrl}/api/meetings`);
  assert.equal(res.status, 200);
  const meetings = await res.json();
  assert.equal(meetings.length, 1);
  assert.equal(meetings[0].status, 'TO_SCHEDULE');
  assert.equal(meetings[0].applicationId, 6);
});

test('GET /api/meetings/:id returns the interview', async () => {
  const res = await fetch(`${baseUrl}/api/meetings/1`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).eventId, 'api-evt-1');
});

test('GET /api/meetings/:id returns 404 JSON for an unknown interview', async () => {
  const res = await fetch(`${baseUrl}/api/meetings/42`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { status: 404, error: 'Not Found', message: 'Meeting 42 not found' });
});

test('GET /api/meetings/hello still answers', async () => {
  const res = await fetch(`${baseUrl}/api/meetings/hello`);
  assert.equal(res.status, 200);
});

test('the OpenAPI spec documents the meeting routes', async () => {
  const spec = await (await fetch(`${baseUrl}/v3/api-docs`)).json();
  assert.ok(spec.paths['/api/meetings'].get);
  assert.ok(spec.paths['/api/meetings/{id}'].get);
  assert.ok(spec.components.schemas.Meeting);
});
