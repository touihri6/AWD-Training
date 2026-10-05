const { getServiceUrl } = require('../config/eureka');
const httpError = require('../utils/http-error');

const CANDIDAT_APP_ID = 'CANDIDAT';

const fetchCandidate = async (id) => {
  const baseUrl = getServiceUrl(CANDIDAT_APP_ID);
  try {
    return await fetch(`${baseUrl}/api/candidates/${encodeURIComponent(id)}`);
  } catch (error) {
    throw httpError(503, `${CANDIDAT_APP_ID} is unreachable`);
  }
};

const findById = async (id) => {
  const response = await fetchCandidate(id);
  return { status: response.status, body: await response.json() };
};

const ensureExists = async (id) => {
  const response = await fetchCandidate(id);
  if (response.status === 404) throw httpError(400, `Candidate ${id} not found`);
  if (!response.ok) throw httpError(502, `${CANDIDAT_APP_ID} answered with status ${response.status}`);
};

module.exports = { findById, ensureExists };
