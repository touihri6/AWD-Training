/**
 * ============================================================================
 *  services/meetingService.js — Couche métier pour Meeting
 * ============================================================================
 */

'use strict';

const meetingModel     = require('../models/meetingModel');
const applicationModel = require('../models/applicationModel');
const { HttpError }    = require('../middlewares/errorHandler');

const STATUS_TRANSITIONS = {
  scheduled: ['held', 'cancelled'],
  held:      [],
  cancelled: []
};

function checkTransition(from, to) {
  if (from !== to && !STATUS_TRANSITIONS[from].includes(to)) {
    throw new HttpError(409, `Transition de statut impossible : ${from} → ${to}.`);
  }
}

async function checkReferences(data, excludeId = null) {
  const duplicate = await meetingModel.findByReference(data.reference, excludeId);
  if (duplicate) {
    throw new HttpError(409, `La référence "${data.reference}" est déjà utilisée par une autre réunion.`);
  }
  const application = await applicationModel.findById(data.application_id);
  if (!application) {
    throw new HttpError(400, `La candidature ${data.application_id} n'existe pas.`);
  }
  const used = await meetingModel.findByApplicationId(data.application_id, excludeId);
  if (used) {
    throw new HttpError(409, `La candidature ${data.application_id} a déjà une réunion.`);
  }
}

async function getAllMeetings(options) {
  const page  = Number(options.page)  || 1;
  const limit = Math.min(Number(options.limit) || 20, 100);
  const { data, total } = await meetingModel.findAll({
    page,
    limit,
    status: options.status
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

async function getMeetingById(id) {
  const meeting = await meetingModel.findById(id);
  if (!meeting) {
    throw new HttpError(404, `Meeting avec l'id ${id} non trouvé`);
  }
  return meeting;
}

async function createMeeting(data) {
  await checkReferences(data);
  const id = await meetingModel.create(data);
  return meetingModel.findById(id);
}

async function updateMeeting(id, data) {
  const existing = await meetingModel.findById(id);
  if (!existing) {
    throw new HttpError(404, `Meeting avec l'id ${id} non trouvé`);
  }
  const status = data.status || existing.status;
  checkTransition(existing.status, status);
  await checkReferences(data, id);
  await meetingModel.update(id, { ...data, status });
  return meetingModel.findById(id);
}

async function updateMeetingStatus(id, status) {
  const existing = await meetingModel.findById(id);
  if (!existing) {
    throw new HttpError(404, `Meeting avec l'id ${id} non trouvé`);
  }
  checkTransition(existing.status, status);
  await meetingModel.updateStatus(id, status);
  return meetingModel.findById(id);
}

async function deleteMeeting(id) {
  const success = await meetingModel.remove(id);
  if (!success) {
    throw new HttpError(404, `Meeting avec l'id ${id} non trouvé`);
  }
}

module.exports = {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting
};
