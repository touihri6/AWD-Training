const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MeetingService, MeetingStatus } = require('../src/services/meeting.service');

const sampleEvent = (overrides = {}) => ({
  eventId: 'evt-1',
  eventType: 'ApplicationSubmitted',
  applicationId: 6,
  candidateId: 4,
  candidateFirstname: 'Lina',
  candidateLastname: 'Mansour',
  jobId: 1,
  jobName: 'Java Spring Boot Developer',
  ...overrides,
});

test('an ApplicationSubmitted event creates an interview to schedule', () => {
  const service = new MeetingService();

  const meeting = service.handleApplicationSubmitted(sampleEvent());

  assert.equal(meeting.id, 1);
  assert.equal(meeting.status, MeetingStatus.TO_SCHEDULE);
  assert.equal(meeting.date, null);
  assert.equal(meeting.title, 'Interview with Lina Mansour - Java Spring Boot Developer');
  assert.equal(meeting.candidateId, 4);
  assert.equal(meeting.jobId, 1);
  assert.equal(meeting.applicationId, 6);
  assert.equal(meeting.eventId, 'evt-1');
  assert.deepEqual(service.findAll(), [meeting]);
  assert.equal(service.findById(1), meeting);
});

test('the same event received twice creates only one interview', () => {
  const service = new MeetingService();

  service.handleApplicationSubmitted(sampleEvent());
  const duplicate = service.handleApplicationSubmitted(sampleEvent());

  assert.equal(duplicate, null);
  assert.equal(service.findAll().length, 1);
});

test('two different events create two interviews', () => {
  const service = new MeetingService();

  service.handleApplicationSubmitted(sampleEvent());
  service.handleApplicationSubmitted(sampleEvent({ eventId: 'evt-2', applicationId: 7 }));

  assert.deepEqual(service.findAll().map((m) => m.id), [1, 2]);
});

test('findById returns null for an unknown meeting', () => {
  assert.equal(new MeetingService().findById(42), null);
});
