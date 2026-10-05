const app = require('./app');
const { startEureka, stopEureka } = require('./config/eureka');

const PORT = Number(process.env.PORT || 8083);

const server = app.listen(PORT, () => {
  console.log(`meeting microservice running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
  startEureka(PORT);
});

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down meeting microservice`);
  await stopEureka();
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
