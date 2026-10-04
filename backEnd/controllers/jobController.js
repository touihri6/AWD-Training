/**
 * ============================================================================
 *  controllers/jobController.js — Contrôleur HTTP pour Job
 * ============================================================================
 */

'use strict';

const jobService = require('../services/jobService');

async function getAllJobs(req, res, next) {
  try {
    const result = await jobService.getAllJobs({
      page:        req.query.page,
      limit:       req.query.limit,
      search:      req.query.search,
      category_id: req.query.category_id,
      available:   req.query.available
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getJobById(req, res, next) {
  try {
    const job = await jobService.getJobById(Number(req.params.id));
    res.status(200).json(job);
  } catch (err) { next(err); }
}

async function createJob(req, res, next) {
  try {
    const job = await jobService.createJob(req.body);
    res.status(201)
       .location(`/api/jobs/${job.id}`)
       .json(job);
  } catch (err) { next(err); }
}

async function updateJob(req, res, next) {
  try {
    const job = await jobService.updateJob(Number(req.params.id), req.body);
    res.status(200).json(job);
  } catch (err) { next(err); }
}

async function deleteJob(req, res, next) {
  try {
    await jobService.deleteJob(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
