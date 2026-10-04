/**
 * ============================================================================
 *  middlewares/meetingValidator.js — Validation des réunions
 * ============================================================================
 */

'use strict';

const { body, param, query } = require('express-validator');

const STATUSES = ['scheduled', 'held', 'cancelled'];

const listRules = [
  query('status')
    .optional()
    .isIn(STATUSES).withMessage(`status doit valoir : ${STATUSES.join(', ')}.`)
];

const createRules = [
  body('reference')
    .exists({ checkFalsy: true }).withMessage('La référence est obligatoire.')
    .isString().withMessage('La référence doit être une chaîne.')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('La référence doit contenir 2 à 50 caractères.'),

  body('link')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage("Le lien n'est pas une URL valide.")
    .isLength({ max: 500 }).withMessage('Le lien est trop long (max 500 caractères).'),

  body('status')
    .optional()
    .isIn(STATUSES).withMessage(`status doit valoir : ${STATUSES.join(', ')}.`),

  body('application_id')
    .exists({ checkFalsy: true }).withMessage('application_id est obligatoire.')
    .isInt({ min: 1 }).withMessage('application_id doit être un entier positif.')
];

const updateRules = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif."),
  ...createRules
];

const statusRules = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif."),
  body('status')
    .exists({ checkFalsy: true }).withMessage('Le statut est obligatoire.')
    .isIn(STATUSES).withMessage(`status doit valoir : ${STATUSES.join(', ')}.`)
];

const idRule = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif.")
];

module.exports = { listRules, createRules, updateRules, statusRules, idRule };
