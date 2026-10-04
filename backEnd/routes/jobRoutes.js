/**
 * ============================================================================
 *  routes/jobRoutes.js — Routes REST pour Job
 * ============================================================================
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/jobController');
const validator  = require('../middlewares/jobValidator');
const validate   = require('../middlewares/validate');

// ---------------------------------------------------------------------------
// GET /api/jobs
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: Liste toutes les offres d'emploi
 *     description: Retourne la liste paginée des offres, avec recherche par nom et filtres par catégorie et disponibilité.
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: search
 *         in: query
 *         required: false
 *         description: Recherche partielle sur le nom de l'offre.
 *         schema: { type: string, example: 'Développeur' }
 *       - name: category_id
 *         in: query
 *         required: false
 *         description: Filtre par catégorie.
 *         schema: { type: integer, minimum: 1, example: 1 }
 *       - name: available
 *         in: query
 *         required: false
 *         description: Filtre par disponibilité.
 *         schema: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Liste paginée des offres.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', validator.listRules, validate, controller.getAllJobs);

// ---------------------------------------------------------------------------
// GET /api/jobs/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Récupère une offre par son id
 *     parameters:
 *       - $ref: '#/components/parameters/JobId'
 *     responses:
 *       200:
 *         description: L'offre demandée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validator.idRule, validate, controller.getJobById);

// ---------------------------------------------------------------------------
// POST /api/jobs
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Crée une nouvelle offre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *           example:
 *             name: "Développeur Angular"
 *             description: "Développement d'interfaces web modernes avec Angular."
 *             available: true
 *             date: "2026-03-01"
 *             category_id: 1
 *     responses:
 *       201:
 *         description: Offre créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', validator.createRules, validate, controller.createJob);

// ---------------------------------------------------------------------------
// PUT /api/jobs/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     tags: [Jobs]
 *     summary: Met à jour une offre existante
 *     parameters:
 *       - $ref: '#/components/parameters/JobId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       200:
 *         description: L'offre mise à jour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', validator.updateRules, validate, controller.updateJob);

// ---------------------------------------------------------------------------
// DELETE /api/jobs/:id
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Supprime une offre
 *     description: Supprime aussi les candidatures liées (CASCADE).
 *     parameters:
 *       - $ref: '#/components/parameters/JobId'
 *     responses:
 *       204:
 *         description: Offre supprimée (pas de corps).
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', validator.idRule, validate, controller.deleteJob);

module.exports = router;
