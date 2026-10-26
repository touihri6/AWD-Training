const EVENT_TYPE = 'ApplicationSubmitted';
const STRING_FIELDS = ['eventId', 'candidateFirstname', 'candidateLastname', 'jobName'];
const INTEGER_FIELDS = ['applicationId', 'candidateId', 'jobId'];

function parseApplicationSubmitted(content) {
  const event = JSON.parse(content.toString('utf8'));
  if (event === null || typeof event !== 'object' || Array.isArray(event)) {
    throw new Error('the message must be a JSON object');
  }
  if (event.eventType !== EVENT_TYPE) {
    throw new Error(`unexpected eventType '${event.eventType}'`);
  }
  for (const field of STRING_FIELDS) {
    if (typeof event[field] !== 'string' || event[field].trim() === '') {
      throw new Error(`field '${field}' is missing or is not a string`);
    }
  }
  for (const field of INTEGER_FIELDS) {
    if (!Number.isInteger(event[field])) {
      throw new Error(`field '${field}' is missing or is not an integer`);
    }
  }
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    applicationId: event.applicationId,
    candidateId: event.candidateId,
    candidateFirstname: event.candidateFirstname,
    candidateLastname: event.candidateLastname,
    jobId: event.jobId,
    jobName: event.jobName,
  };
}

module.exports = { EVENT_TYPE, parseApplicationSubmitted };
