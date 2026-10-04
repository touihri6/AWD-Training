/**
 * ============================================================================
 *  routes/notificationRoutes.js — Routes REST pour Notification
 * ============================================================================
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/notificationController');
const validator  = require('../middlewares/notificationValidator');
const validate   = require('../middlewares/validate');

// ---------------------------------------------------------------------------
// GET /api/notifications
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Liste toutes les notifications
 *     description: Retourne la liste paginée des notifications, avec filtre optionnel par destinataire.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: recipient
 *         in: query
 *         required: false
 *         description: Filtre par email du destinataire.
 *         schema: { type: string, format: email, example: 'youssef.mzoughi@example.tn' }
 *     responses:
 *       200:
 *         description: Liste paginée des notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', validator.listRules, validate, controller.getAllNotifications);

// ---------------------------------------------------------------------------
// GET /api/notifications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Récupère une notification par son id
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: La notification demandée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validator.idRule, validate, controller.getNotificationById);

// ---------------------------------------------------------------------------
// POST /api/notifications
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Crée une nouvelle notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *           example:
 *             sender: "recruitment@jobboard.tn"
 *             recipient: "salma.bouaziz@example.tn"
 *             content: "Votre entretien est confirmé."
 *             date: "2026-02-20T10:00:00Z"
 *             application_id: 4
 *     responses:
 *       201:
 *         description: Notification créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/', validator.createRules, validate, controller.createNotification);

// ---------------------------------------------------------------------------
// PUT /api/notifications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     tags: [Notifications]
 *     summary: Met à jour une notification existante
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       200:
 *         description: La notification mise à jour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id', validator.updateRules, validate, controller.updateNotification);

// ---------------------------------------------------------------------------
// DELETE /api/notifications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Supprime une notification
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       204:
 *         description: Notification supprimée (pas de corps).
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', validator.idRule, validate, controller.deleteNotification);

module.exports = router;
