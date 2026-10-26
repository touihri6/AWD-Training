const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  EXCHANGE,
  ROUTING_KEY,
  QUEUE,
  DEAD_LETTER_EXCHANGE,
  DEAD_LETTER_QUEUE,
  declareTopology,
  createMessageHandler,
} = require('../src/messaging/consumer');
const { MeetingService } = require('../src/services/meeting.service');

const fakeChannel = () => {
  const calls = [];
  const record = (name) => async (...args) => { calls.push([name, ...args]); };
  return {
    calls,
    acked: [],
    rejected: [],
    assertExchange: record('assertExchange'),
    assertQueue: record('assertQueue'),
    bindQueue: record('bindQueue'),
    ack(message) { this.acked.push(message); },
    reject(message, requeue) { this.rejected.push({ message, requeue }); },
  };
};

const message = (body) => ({
  content: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)),
  properties: { messageId: 'msg-1' },
});

const validEvent = {
  eventId: 'evt-1',
  eventType: 'ApplicationSubmitted',
  occurredAt: '2026-10-26T10:00:00Z',
  applicationId: 6,
  applicationDate: '2026-10-26',
  candidateId: 4,
  candidateFirstname: 'Lina',
  candidateLastname: 'Mansour',
  candidateEmail: 'lina.mansour@example.com',
  jobId: 1,
  jobName: 'Java Spring Boot Developer',
};

test('declareTopology binds the meeting queue to the shared exchange with its own DLQ', async () => {
  const channel = fakeChannel();

  await declareTopology(channel);

  assert.deepEqual(channel.calls, [
    ['assertExchange', EXCHANGE, 'topic', { durable: true }],
    ['assertExchange', DEAD_LETTER_EXCHANGE, 'direct', { durable: true }],
    ['assertQueue', DEAD_LETTER_QUEUE, { durable: true }],
    ['bindQueue', DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, QUEUE],
    ['assertQueue', QUEUE, { durable: true, deadLetterExchange: DEAD_LETTER_EXCHANGE, deadLetterRoutingKey: QUEUE }],
    ['bindQueue', QUEUE, EXCHANGE, ROUTING_KEY],
  ]);
  assert.equal(QUEUE, 'meeting.application-submitted');
  assert.equal(ROUTING_KEY, 'application.submitted');
});

test('a valid event is processed then acknowledged', () => {
  const channel = fakeChannel();
  const service = new MeetingService();
  const msg = message(validEvent);

  createMessageHandler(channel, service)(msg);

  assert.deepEqual(channel.acked, [msg]);
  assert.deepEqual(channel.rejected, []);
  assert.equal(service.findAll().length, 1);
});

test('a duplicate event is acknowledged without creating a second interview', () => {
  const channel = fakeChannel();
  const service = new MeetingService();
  const handler = createMessageHandler(channel, service);

  handler(message(validEvent));
  handler(message(validEvent));

  assert.equal(channel.acked.length, 2);
  assert.equal(service.findAll().length, 1);
});

test('an unreadable message is rejected without requeue (-> DLQ)', () => {
  const channel = fakeChannel();
  const service = new MeetingService();
  const msg = message("{ this is not JSON");

  createMessageHandler(channel, service)(msg);

  assert.deepEqual(channel.acked, []);
  assert.deepEqual(channel.rejected, [{ message: msg, requeue: false }]);
  assert.equal(service.findAll().length, 0);
});

test('an event with a missing field is rejected without requeue (-> DLQ)', () => {
  const channel = fakeChannel();
  const { jobName, ...withoutJobName } = validEvent;

  createMessageHandler(channel, new MeetingService())(message(withoutJobName));

  assert.equal(channel.rejected.length, 1);
  assert.equal(channel.rejected[0].requeue, false);
});

test('an event of another type is rejected without requeue (-> DLQ)', () => {
  const channel = fakeChannel();

  createMessageHandler(channel, new MeetingService())(message({ ...validEvent, eventType: 'ApplicationWithdrawn' }));

  assert.equal(channel.rejected.length, 1);
});

test('a null message (consumer cancelled by RabbitMQ) is ignored', () => {
  const channel = fakeChannel();

  createMessageHandler(channel, new MeetingService())(null);

  assert.deepEqual(channel.acked, []);
  assert.deepEqual(channel.rejected, []);
});
