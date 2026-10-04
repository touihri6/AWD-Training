/**
 * ============================================================================
 *  services/notificationService.js — Couche métier pour Notification
 * ============================================================================
 */

'use strict';

const notificationModel = require('../models/notificationModel');
const applicationModel  = require('../models/applicationModel');
const { HttpError }     = require('../middlewares/errorHandler');

async function checkApplication(applicationId, excludeId = null) {
  const application = await applicationModel.findById(applicationId);
  if (!application) {
    throw new HttpError(400, `La candidature ${applicationId} n'existe pas.`);
  }
  const used = await notificationModel.findByApplicationId(applicationId, excludeId);
  if (used) {
    throw new HttpError(409, `La candidature ${applicationId} a déjà une notification.`);
  }
}

async function getAllNotifications(options) {
  const page  = Number(options.page)  || 1;
  const limit = Math.min(Number(options.limit) || 20, 100);
  const { data, total } = await notificationModel.findAll({
    page,
    limit,
    recipient: options.recipient
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

async function getNotificationById(id) {
  const notification = await notificationModel.findById(id);
  if (!notification) {
    throw new HttpError(404, `Notification avec l'id ${id} non trouvée`);
  }
  return notification;
}

async function createNotification(data) {
  await checkApplication(data.application_id);
  const id = await notificationModel.create(data);
  return notificationModel.findById(id);
}

async function updateNotification(id, data) {
  const existing = await notificationModel.findById(id);
  if (!existing) {
    throw new HttpError(404, `Notification avec l'id ${id} non trouvée`);
  }
  await checkApplication(data.application_id, id);
  await notificationModel.update(id, data);
  return notificationModel.findById(id);
}

async function deleteNotification(id) {
  const success = await notificationModel.remove(id);
  if (!success) {
    throw new HttpError(404, `Notification avec l'id ${id} non trouvée`);
  }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification
};
