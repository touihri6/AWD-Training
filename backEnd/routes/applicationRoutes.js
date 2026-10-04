/**
 * ============================================================================
 *  routes/applicationRoutes.js — Routes REST pour Application
 * ============================================================================
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/applicationController');
const validator  = require('../middlewares/applicationValidator');
const validate   = require('../middlewares/validate');

// ---------------------------------------------------------------------------
// GET /api/applications
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/applications:
 *   get:
 *     tags: [Applications]
 *     summary: Liste toutes les candidatures
 *     description: Retourne la liste paginée des candidatures.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: Liste paginée des candidatures.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationList'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', controller.getAllApplications);

// ---------------------------------------------------------------------------
// GET /api/applications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Récupère une candidature par son id
 *     parameters:
 *       - $ref: '#/components/parameters/ApplicationId'
 *     responses:
 *       200:
 *         description: La candidature demandée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validator.idRule, validate, controller.getApplicationById);

// ---------------------------------------------------------------------------
// POST /api/applications
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Applications]
 *     summary: Crée une nouvelle candidature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationInput'
 *           example:
 *             applicationDate: "2026-02-20"
 *             motivation: "Très motivé par ce poste de développeur Full-Stack."
 *             candidate_id: 5
 *             job_id: 1
 *     responses:
 *       201:
 *         description: Candidature créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/', validator.createRules, validate, controller.createApplication);

// ---------------------------------------------------------------------------
// PUT /api/applications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     tags: [Applications]
 *     summary: Met à jour une candidature existante
 *     parameters:
 *       - $ref: '#/components/parameters/ApplicationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationInput'
 *     responses:
 *       200:
 *         description: La candidature mise à jour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id', validator.updateRules, validate, controller.updateApplication);

// ---------------------------------------------------------------------------
// DELETE /api/applications/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     tags: [Applications]
 *     summary: Supprime une candidature
 *     description: Supprime aussi la réunion et la notification liées (CASCADE).
 *     parameters:
 *       - $ref: '#/components/parameters/ApplicationId'
 *     responses:
 *       204:
 *         description: Candidature supprimée (pas de corps).
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', validator.idRule, validate, controller.deleteApplication);

module.exports = router;
