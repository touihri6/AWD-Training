/**
 * OpenAPI 3 specification of the meeting microservice.
 * Served as JSON at /v3/api-docs and as Swagger UI at /swagger-ui.
 *
 * TODO (students): document every new route in `paths` and every new object in `components.schemas`.
 */
const PORT = process.env.PORT || 8083;

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Meeting Microservice API',
    version: '1.0.0',
    description: 'Meeting microservice (Node.js / Express, no database). ' +
      'Only the hello endpoint is implemented; the meeting logic is to be developed by students.',
    contact: { name: 'Badia Abouhdid' },
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],
  tags: [{ name: 'Meetings', description: 'Meeting endpoints' }],
  paths: {
    '/api/meetings/hello': {
      get: {
        tags: ['Meetings'],
        summary: 'Hello from the meeting microservice',
        description: 'Checks that the microservice is up and returns a greeting message.',
        operationId: 'hello',
        responses: {
          200: {
            description: 'Greeting message',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HelloResponse' },
                example: { message: "hello I'm microservice meeting" },
              },
            },
          },
        },
      },
    },

    '/api/meetings': {
      get: {
        tags: ['Meetings'],
        summary: 'List the meetings',
        description: 'Meetings created from the ApplicationSubmitted events consumed from RabbitMQ.',
        operationId: 'findAllMeetings',
        responses: {
          200: {
            description: 'List of meetings',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Meeting' } },
              },
            },
          },
        },
      },
    },
    '/api/meetings/{id}': {
      get: {
        tags: ['Meetings'],
        summary: 'Get one meeting',
        operationId: 'findMeetingById',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } },
        ],
        responses: {
          200: {
            description: 'The meeting',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } },
          },
          404: {
            description: 'Meeting not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // TODO (students): document the CRUD routes, for example:
    // '/api/meetings': { get: {...}, post: {...} },
    // '/api/meetings/{id}': { get: {...}, put: {...}, delete: {...} },
  },
  components: {
    schemas: {
      HelloResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: "hello I'm microservice meeting" },
        },
        required: ['message'],
      },

      Meeting: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Interview with Lina Mansour - Java Spring Boot Developer' },
          date: { type: 'string', format: 'date-time', nullable: true, example: null },
          status: { type: 'string', enum: ['TO_SCHEDULE', 'SCHEDULED', 'DONE', 'CANCELLED'], example: 'TO_SCHEDULE' },
          candidateId: { type: 'integer', example: 4 },
          jobId: { type: 'integer', example: 1 },
          applicationId: { type: 'integer', example: 6 },
          eventId: { type: 'string', example: '3f2a8c1e-5b7d-4e2a-9c1f-0a6b2d4e8f10' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-26T10:00:00.000Z' },
        },
        required: ['id', 'title', 'status', 'candidateId', 'jobId'],
      },

      // TODO (students): add the Meeting schema, for example:
      // Meeting: {
      //   type: 'object',
      //   properties: {
      //     id: { type: 'integer', example: 1 },
      //     title: { type: 'string', example: 'Technical interview' },
      //     date: { type: 'string', format: 'date-time', example: '2026-10-05T10:00:00Z' },
      //     candidateId: { type: 'integer', example: 1 },
      //     jobId: { type: 'integer', example: 1 },
      //   },
      // },

      Error: {
        type: 'object',
        properties: {
          status: { type: 'integer', example: 404 },
          error: { type: 'string', example: 'Not Found' },
          message: { type: 'string', example: 'Meeting 42 not found' },
        },
      },
    },
  },
};
