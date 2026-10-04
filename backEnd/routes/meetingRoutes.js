/**
 * ============================================================================
 *  routes/meetingRoutes.js — Routes REST pour Meeting
 * ============================================================================
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/meetingController');
const validator  = require('../middlewares/meetingValidator');
const validate   = require('../middlewares/validate');

// ---------------------------------------------------------------------------
// GET /api/meetings
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings:
 *   get:
 *     tags: [Meetings]
 *     summary: Liste toutes les réunions
 *     description: Retourne la liste paginée des réunions, avec filtre optionnel par statut.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filtre par statut.
 *         schema: { type: string, enum: [scheduled, held, cancelled] }
 *     responses:
 *       200:
 *         description: Liste paginée des réunions.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', validator.listRules, validate, controller.getAllMeetings);

// ---------------------------------------------------------------------------
// GET /api/meetings/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     tags: [Meetings]
 *     summary: Récupère une réunion par son id
 *     parameters:
 *       - $ref: '#/components/parameters/MeetingId'
 *     responses:
 *       200:
 *         description: La réunion demandée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validator.idRule, validate, controller.getMeetingById);

// ---------------------------------------------------------------------------
// POST /api/meetings
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings:
 *   post:
 *     tags: [Meetings]
 *     summary: Crée une nouvelle réunion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeetingInput'
 *           example:
 *             reference: "MTG-2026-003"
 *             link: "https://meet.jobboard.tn/mtg-2026-003"
 *             status: "scheduled"
 *             application_id: 3
 *     responses:
 *       201:
 *         description: Réunion créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/', validator.createRules, validate, controller.createMeeting);

// ---------------------------------------------------------------------------
// PUT /api/meetings/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings/{id}:
 *   put:
 *     tags: [Meetings]
 *     summary: Met à jour une réunion existante
 *     parameters:
 *       - $ref: '#/components/parameters/MeetingId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeetingInput'
 *     responses:
 *       200:
 *         description: La réunion mise à jour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id', validator.updateRules, validate, controller.updateMeeting);

// ---------------------------------------------------------------------------
// PATCH /api/meetings/:id/status
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings/{id}/status:
 *   patch:
 *     tags: [Meetings]
 *     summary: Change uniquement le statut d'une réunion
 *     description: "Transitions autorisées : scheduled → held, scheduled → cancelled."
 *     parameters:
 *       - $ref: '#/components/parameters/MeetingId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeetingStatusInput'
 *           example:
 *             status: "held"
 *     responses:
 *       200:
 *         description: La réunion avec son nouveau statut.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.patch('/:id/status', validator.statusRules, validate, controller.updateMeetingStatus);

// ---------------------------------------------------------------------------
// DELETE /api/meetings/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Supprime une réunion
 *     parameters:
 *       - $ref: '#/components/parameters/MeetingId'
 *     responses:
 *       204:
 *         description: Réunion supprimée (pas de corps).
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', validator.idRule, validate, controller.deleteMeeting);

module.exports = router;
