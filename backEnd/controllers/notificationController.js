/**
 * ============================================================================
 *  controllers/notificationController.js — Contrôleur HTTP pour Notification
 * ============================================================================
 */

'use strict';

const notificationService = require('../services/notificationService');

async function getAllNotifications(req, res, next) {
  try {
    const result = await notificationService.getAllNotifications({
      page:      req.query.page,
      limit:     req.query.limit,
      recipient: req.query.recipient
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getNotificationById(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(Number(req.params.id));
    res.status(200).json(notification);
  } catch (err) { next(err); }
}

async function createNotification(req, res, next) {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201)
       .location(`/api/notifications/${notification.id}`)
       .json(notification);
  } catch (err) { next(err); }
}

async function updateNotification(req, res, next) {
  try {
    const notification = await notificationService.updateNotification(Number(req.params.id), req.body);
    res.status(200).json(notification);
  } catch (err) { next(err); }
}

async function deleteNotification(req, res, next) {
  try {
    await notificationService.deleteNotification(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification
};
