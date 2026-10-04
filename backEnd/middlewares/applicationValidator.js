/**
 * ============================================================================
 *  middlewares/applicationValidator.js — Validation des candidatures
 * ============================================================================
 */

'use strict';

const { body, param } = require('express-validator');

const createRules = [
  body('applicationDate')
    .exists({ checkFalsy: true }).withMessage('La date de candidature est obligatoire.')
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('La date de candidature doit être au format YYYY-MM-DD.'),

  body('motivation')
    .exists({ checkFalsy: true }).withMessage('La motivation est obligatoire.')
    .isString().withMessage('La motivation doit être une chaîne.')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('La motivation doit contenir 10 à 5000 caractères.'),

  body('candidate_id')
    .exists({ checkFalsy: true }).withMessage('candidate_id est obligatoire.')
    .isInt({ min: 1 }).withMessage('candidate_id doit être un entier positif.'),

  body('job_id')
    .exists({ checkFalsy: true }).withMessage('job_id est obligatoire.')
    .isInt({ min: 1 }).withMessage('job_id doit être un entier positif.')
];

const updateRules = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif."),
  ...createRules
];

const idRule = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif.")
];

module.exports = { createRules, updateRules, idRule };
