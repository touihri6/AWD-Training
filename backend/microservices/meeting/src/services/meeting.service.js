const candidateService = require('./candidate.service');
const httpError = require('../utils/http-error');

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/;

const meetings = [];
let nextId = 1;

const validate = (body) => {
  const { title, date, candidateId, jobId } = body || {};
  if (typeof title !== 'string' || title.trim() === '') {
    throw httpError(400, 'title is required and must not be empty');
  }
  if (typeof date !== 'string' || !ISO_DATE_TIME.test(date) || Number.isNaN(Date.parse(date))) {
    throw httpError(400, 'date is required and must be a valid ISO 8601 date-time');
  }
  if (!Number.isInteger(candidateId)) {
    throw httpError(400, 'candidateId is required and must be an integer');
  }
  if (!Number.isInteger(jobId)) {
    throw httpError(400, 'jobId is required and must be an integer');
  }
  return { title: title.trim(), date: new Date(date).toISOString(), candidateId, jobId };
};

const parseFilter = (value, name) => {
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number)) throw httpError(400, `${name} must be an integer`);
  return number;
};

const ensureNoConflict = (data, excludedId) => {
  const conflict = meetings.find((meeting) => meeting.id !== excludedId
    && meeting.candidateId === data.candidateId
    && meeting.date === data.date);
  if (conflict) {
    throw httpError(409, `Candidate ${data.candidateId} already has a meeting at ${data.date}`);
  }
};

const findAll = (query = {}) => {
  const candidateId = parseFilter(query.candidateId, 'candidateId');
  const jobId = parseFilter(query.jobId, 'jobId');
  return meetings.filter((meeting) => (candidateId === undefined || meeting.candidateId === candidateId)
    && (jobId === undefined || meeting.jobId === jobId));
};

const findById = (id) => {
  const meeting = meetings.find((item) => item.id === Number(id));
  if (!meeting) throw httpError(404, `Meeting ${id} not found`);
  return meeting;
};

const create = async (body) => {
  const data = validate(body);
  ensureNoConflict(data);
  await candidateService.ensureExists(data.candidateId);
  const meeting = { id: nextId++, ...data };
  meetings.push(meeting);
  return meeting;
};

const update = async (id, body) => {
  const meeting = findById(id);
  const data = validate(body);
  ensureNoConflict(data, meeting.id);
  await candidateService.ensureExists(data.candidateId);
  Object.assign(meeting, data);
  return meeting;
};

const remove = (id) => {
  const meeting = findById(id);
  meetings.splice(meetings.indexOf(meeting), 1);
};

module.exports = { findAll, findById, create, update, remove };
