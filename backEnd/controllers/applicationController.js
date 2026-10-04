/**
 * ============================================================================
 *  controllers/applicationController.js — Contrôleur HTTP pour Application
 * ============================================================================
 */

'use strict';

const applicationService = require('../services/applicationService');

async function getAllApplications(req, res, next) {
  try {
    const result = await applicationService.getAllApplications({
      page:  req.query.page,
      limit: req.query.limit
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getApplicationById(req, res, next) {
  try {
    const application = await applicationService.getApplicationById(Number(req.params.id));
    res.status(200).json(application);
  } catch (err) { next(err); }
}

async function createApplication(req, res, next) {
  try {
    const application = await applicationService.createApplication(req.body);
    res.status(201)
       .location(`/api/applications/${application.id}`)
       .json(application);
  } catch (err) { next(err); }
}

async function updateApplication(req, res, next) {
  try {
    const application = await applicationService.updateApplication(Number(req.params.id), req.body);
    res.status(200).json(application);
  } catch (err) { next(err); }
}

async function deleteApplication(req, res, next) {
  try {
    await applicationService.deleteApplication(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
