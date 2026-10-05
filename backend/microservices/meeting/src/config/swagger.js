/**
 * OpenAPI 3 specification of the meeting microservice.
 * Served as JSON at /v3/api-docs and as Swagger UI at /swagger-ui.
 */
const PORT = process.env.PORT || 8083;

const json = (schema, example) => ({
  'application/json': example === undefined ? { schema } : { schema, example },
});
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const errorResponse = (description, status, error, message) => ({
  description,
  content: json(ref('Error'), { status, error, message }),
});
const idParameter = {
  name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1,
};
const candidatUnavailable = errorResponse(
  'No CANDIDAT instance available',
  503,
  'Service Unavailable',
  'No available instance of CANDIDAT in Eureka',
);
const meetingNotFound = errorResponse('Meeting not found', 404, 'Not Found', 'Meeting 42 not found');
const meetingConflict = errorResponse(
  'Candidate already has a meeting at this date',
  409,
  'Conflict',
  'Candidate 1 already has a meeting at 2026-10-05T10:00:00.000Z',
);

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Meeting Microservice API',
    version: '1.0.0',
    description: 'Meeting microservice (Node.js / Express, no database). '
      + 'Meetings are stored in memory and candidates are checked through Eureka.',
    contact: { name: 'Badia Abouhdid' },
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],
  tags: [
    { name: 'Meetings', description: 'Meeting endpoints' },
    { name: 'Health', description: 'Health check used by Eureka' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'health',
        responses: {
          200: { description: 'Service is up', content: json(ref('HealthResponse'), { status: 'UP' }) },
        },
      },
    },
    '/api/meetings/hello': {
      get: {
        tags: ['Meetings'],
        summary: 'Hello from the meeting microservice',
        description: 'Checks that the microservice is up and returns a greeting message.',
        operationId: 'hello',
        responses: {
          200: {
            description: 'Greeting message',
            content: json(ref('HelloResponse'), { message: "hello I'm microservice meeting" }),
          },
        },
      },
    },
    '/api/meetings/candidates/{id}': {
      get: {
        tags: ['Meetings'],
        summary: 'Get a candidate from the candidat microservice',
        description: 'Discovers the CANDIDAT address through Eureka and calls GET /api/candidates/{id}.',
        operationId: 'findCandidate',
        parameters: [idParameter],
        responses: {
          200: { description: 'Candidate returned by the candidat microservice', content: json({ type: 'object' }) },
          404: { description: 'Candidate not found', content: json({ type: 'object' }) },
          503: candidatUnavailable,
        },
      },
    },
    '/api/meetings': {
      get: {
        tags: ['Meetings'],
        summary: 'List meetings',
        description: 'Optionally filtered by candidateId and/or jobId.',
        operationId: 'findAll',
        parameters: [
          { name: 'candidateId', in: 'query', required: false, schema: { type: 'integer' }, example: 1 },
          { name: 'jobId', in: 'query', required: false, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'List of meetings', content: json({ type: 'array', items: ref('Meeting') }) },
          400: errorResponse('Invalid filter', 400, 'Bad Request', 'candidateId must be an integer'),
        },
      },
      post: {
        tags: ['Meetings'],
        summary: 'Create a meeting',
        description: 'The candidate must exist in the candidat microservice.',
        operationId: 'create',
        requestBody: { required: true, content: json(ref('MeetingInput')) },
        responses: {
          201: { description: 'Created meeting', content: json(ref('Meeting')) },
          400: errorResponse('Invalid body or unknown candidate', 400, 'Bad Request', 'title is required and must not be empty'),
          409: meetingConflict,
          503: candidatUnavailable,
        },
      },
    },
    '/api/meetings/{id}': {
      get: {
        tags: ['Meetings'],
        summary: 'Get a meeting',
        operationId: 'findById',
        parameters: [idParameter],
        responses: {
          200: { description: 'Meeting', content: json(ref('Meeting')) },
          404: meetingNotFound,
        },
      },
      put: {
        tags: ['Meetings'],
        summary: 'Update a meeting',
        description: 'The candidate must exist in the candidat microservice.',
        operationId: 'update',
        parameters: [idParameter],
        requestBody: { required: true, content: json(ref('MeetingInput')) },
        responses: {
          200: { description: 'Updated meeting', content: json(ref('Meeting')) },
          400: errorResponse('Invalid body or unknown candidate', 400, 'Bad Request', 'jobId is required and must be an integer'),
          404: meetingNotFound,
          409: meetingConflict,
          503: candidatUnavailable,
        },
      },
      delete: {
        tags: ['Meetings'],
        summary: 'Delete a meeting',
        operationId: 'remove',
        parameters: [idParameter],
        responses: {
          204: { description: 'Meeting deleted' },
          404: meetingNotFound,
        },
      },
    },
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
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'UP' },
        },
        required: ['status'],
      },
      MeetingInput: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Technical interview' },
          date: { type: 'string', format: 'date-time', example: '2026-10-05T10:00:00Z' },
          candidateId: { type: 'integer', example: 1 },
          jobId: { type: 'integer', example: 1 },
        },
        required: ['title', 'date', 'candidateId', 'jobId'],
      },
      Meeting: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Technical interview' },
          date: { type: 'string', format: 'date-time', example: '2026-10-05T10:00:00.000Z' },
          candidateId: { type: 'integer', example: 1 },
          jobId: { type: 'integer', example: 1 },
        },
        required: ['id', 'title', 'date', 'candidateId', 'jobId'],
      },
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
