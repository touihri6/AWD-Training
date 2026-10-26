const app = require('./app');
const rabbitmq = require('./config/rabbitmq');
const { meetingService } = require('./services/meeting.service');
const { ApplicationSubmittedConsumer } = require('./messaging/consumer');

const PORT = process.env.PORT || 8083;

const server = app.listen(PORT, () => {
  console.log(`meeting microservice running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
});

let consumer = null;
if (rabbitmq.enabled) {
  consumer = new ApplicationSubmittedConsumer(rabbitmq.url, meetingService);
  consumer.start();
}

const shutdown = async () => {
  if (consumer !== null) {
    await consumer.stop();
  }
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
