/**
 * ============================================================================
 *  services/applicationService.js — Couche métier pour Application
 * ============================================================================
 */

'use strict';

const applicationModel = require('../models/applicationModel');
const candidateModel   = require('../models/candidateModel');
const jobModel         = require('../models/jobModel');
const { HttpError }    = require('../middlewares/errorHandler');

async function checkReferences(data, excludeId = null) {
  const candidate = await candidateModel.findById(data.candidate_id);
  if (!candidate) {
    throw new HttpError(400, `Le candidat ${data.candidate_id} n'existe pas.`);
  }
  const job = await jobModel.findById(data.job_id);
  if (!job) {
    throw new HttpError(400, `L'offre ${data.job_id} n'existe pas.`);
  }
  const duplicate = await applicationModel.findByCandidateAndJob(data.candidate_id, data.job_id, excludeId);
  if (duplicate) {
    throw new HttpError(409, `Le candidat ${data.candidate_id} a déjà postulé à l'offre ${data.job_id}.`);
  }
}

async function getAllApplications(options) {
  const page  = Number(options.page)  || 1;
  const limit = Math.min(Number(options.limit) || 20, 100);
  const { data, total } = await applicationModel.findAll({ page, limit });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

async function getApplicationById(id) {
  const application = await applicationModel.findById(id);
  if (!application) {
    throw new HttpError(404, `Application avec l'id ${id} non trouvée`);
  }
  return application;
}

async function createApplication(data) {
  await checkReferences(data);
  const id = await applicationModel.create(data);
  return applicationModel.findById(id);
}

async function updateApplication(id, data) {
  const existing = await applicationModel.findById(id);
  if (!existing) {
    throw new HttpError(404, `Application avec l'id ${id} non trouvée`);
  }
  await checkReferences(data, id);
  await applicationModel.update(id, data);
  return applicationModel.findById(id);
}

async function deleteApplication(id) {
  const success = await applicationModel.remove(id);
  if (!success) {
    throw new HttpError(404, `Application avec l'id ${id} non trouvée`);
  }
}

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
