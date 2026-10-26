module.exports = {
  url: process.env.RABBITMQ_URL || 'amqp://awd:awd@localhost:5672',
  enabled: (process.env.RABBITMQ_ENABLED || 'true').toLowerCase() === 'true',
};
