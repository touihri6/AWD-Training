/**
 * ============================================================================
 *  services/jobService.js — Couche métier pour Job
 * ============================================================================
 */

'use strict';

const jobModel      = require('../models/jobModel');
const categoryModel = require('../models/categoryModel');
const { HttpError } = require('../middlewares/errorHandler');

async function checkCategory(categoryId) {
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    throw new HttpError(400, `La catégorie ${categoryId} n'existe pas.`);
  }
}

async function getAllJobs(options) {
  const page  = Number(options.page)  || 1;
  const limit = Math.min(Number(options.limit) || 20, 100);
  const { data, total } = await jobModel.findAll({
    page,
    limit,
    search:      options.search,
    category_id: options.category_id,
    available:   options.available
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

async function getJobById(id) {
  const job = await jobModel.findById(id);
  if (!job) {
    throw new HttpError(404, `Job avec l'id ${id} non trouvé`);
  }
  return job;
}

async function createJob(data) {
  await checkCategory(data.category_id);
  const id = await jobModel.create(data);
  return jobModel.findById(id);
}

async function updateJob(id, data) {
  const existing = await jobModel.findById(id);
  if (!existing) {
    throw new HttpError(404, `Job avec l'id ${id} non trouvé`);
  }
  await checkCategory(data.category_id);
  await jobModel.update(id, data);
  return jobModel.findById(id);
}

async function deleteJob(id) {
  const success = await jobModel.remove(id);
  if (!success) {
    throw new HttpError(404, `Job avec l'id ${id} non trouvé`);
  }
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
