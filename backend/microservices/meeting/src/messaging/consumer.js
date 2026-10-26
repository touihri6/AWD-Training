const amqp = require('amqplib');
const { parseApplicationSubmitted } = require('./application-submitted.event');

const EXCHANGE = 'jobboard.events';
const ROUTING_KEY = 'application.submitted';
const QUEUE = 'meeting.application-submitted';
const DEAD_LETTER_EXCHANGE = 'jobboard.events.dlx';
const DEAD_LETTER_QUEUE = 'meeting.application-submitted.dlq';
const PREFETCH = 10;
const RETRY_DELAY_MS = 5000;

async function declareTopology(channel) {
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });
  await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, QUEUE);

  await channel.assertQueue(QUEUE, {
    durable: true,
    deadLetterExchange: DEAD_LETTER_EXCHANGE,
    deadLetterRoutingKey: QUEUE,
  });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
}

function createMessageHandler(channel, service) {
  return (message) => {
    if (message === null) {
      return;
    }
    try {
      const event = parseApplicationSubmitted(message.content);
      service.handleApplicationSubmitted(event);
    } catch (err) {
      console.error(`Message ${message.properties.messageId} rejected to the DLQ: ${err.message}`);
      channel.reject(message, false);
      return;
    }
    channel.ack(message);
  };
}

class ApplicationSubmittedConsumer {
  constructor(url, service) {
    this.url = url;
    this.service = service;
    this.connection = null;
    this.retryTimer = null;
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.connect();
  }

  async stop() {
    this.stopped = true;
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
    if (this.connection !== null) {
      const connection = this.connection;
      this.connection = null;
      await connection.close().catch(() => {});
    }
    console.log('RabbitMQ consumer stopped');
  }

  async connect() {
    let connection = null;
    try {
      connection = await amqp.connect(this.url);
      connection.on('error', (err) => console.error(`RabbitMQ connection error: ${err.message}`));
      const channel = await connection.createChannel();
      await channel.prefetch(PREFETCH);
      await declareTopology(channel);
      await channel.consume(QUEUE, createMessageHandler(channel, this.service), { noAck: false });

      if (this.stopped) {
        await connection.close().catch(() => {});
        return;
      }
      this.connection = connection;
      connection.on('close', () => {
        if (this.connection !== connection) {
          return;
        }
        this.connection = null;
        console.warn('RabbitMQ connection lost');
        this.scheduleRetry();
      });
      console.log(`Listening on queue '${QUEUE}' (binding '${ROUTING_KEY}' on '${EXCHANGE}')`);
    } catch (err) {
      if (connection !== null) {
        await connection.close().catch(() => {});
      }
      console.warn(`RabbitMQ unreachable (${err.message}): retrying in ${RETRY_DELAY_MS / 1000} s`);
      this.scheduleRetry();
    }
  }

  scheduleRetry() {
    if (this.stopped || this.retryTimer !== null) {
      return;
    }
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, RETRY_DELAY_MS);
  }
}

module.exports = {
  EXCHANGE,
  ROUTING_KEY,
  QUEUE,
  DEAD_LETTER_EXCHANGE,
  DEAD_LETTER_QUEUE,
  declareTopology,
  createMessageHandler,
  ApplicationSubmittedConsumer,
};
