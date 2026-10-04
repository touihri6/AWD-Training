/**
 * ============================================================================
 *  middlewares/notificationValidator.js — Validation des notifications
 * ============================================================================
 */

'use strict';

const { body, param, query } = require('express-validator');

const listRules = [
  query('recipient')
    .optional()
    .isEmail().withMessage("Le destinataire n'est pas au bon format.")
    .normalizeEmail()
];

const createRules = [
  body('sender')
    .exists({ checkFalsy: true }).withMessage("L'expéditeur est obligatoire.")
    .isEmail().withMessage("L'expéditeur n'est pas au bon format.")
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage("L'expéditeur est trop long (max 150 caractères)."),

  body('recipient')
    .exists({ checkFalsy: true }).withMessage('Le destinataire est obligatoire.')
    .isEmail().withMessage("Le destinataire n'est pas au bon format.")
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Le destinataire est trop long (max 150 caractères).'),

  body('content')
    .exists({ checkFalsy: true }).withMessage('Le contenu est obligatoire.')
    .isString().withMessage('Le contenu doit être une chaîne.')
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Le contenu doit contenir 1 à 5000 caractères.'),

  body('date')
    .exists({ checkFalsy: true }).withMessage('La date est obligatoire.')
    .isISO8601().withMessage('La date doit être au format ISO 8601.')
    .toDate(),

  body('application_id')
    .exists({ checkFalsy: true }).withMessage('application_id est obligatoire.')
    .isInt({ min: 1 }).withMessage('application_id doit être un entier positif.')
];

const updateRules = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif."),
  ...createRules
];

const idRule = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif.")
];

module.exports = { listRules, createRules, updateRules, idRule };
