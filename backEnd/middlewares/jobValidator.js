/**
 * ============================================================================
 *  middlewares/jobValidator.js — Validation des offres d'emploi
 * ============================================================================
 */

'use strict';

const { body, param, query } = require('express-validator');

const listRules = [
  query('search')
    .optional()
    .isString().withMessage('search doit être une chaîne.')
    .trim()
    .isLength({ max: 150 }).withMessage('search est trop long (max 150 caractères).'),

  query('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id doit être un entier positif.')
    .toInt(),

  query('available')
    .optional()
    .isBoolean().withMessage('available doit valoir true ou false.')
    .toBoolean(true)
];

const createRules = [
  body('name')
    .exists({ checkFalsy: true }).withMessage('Le nom est obligatoire.')
    .isString().withMessage('Le nom doit être une chaîne.')
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Le nom doit contenir 2 à 150 caractères.'),

  body('description')
    .exists({ checkFalsy: true }).withMessage('La description est obligatoire.')
    .isString().withMessage('La description doit être une chaîne.')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('La description doit contenir 10 à 5000 caractères.'),

  body('available')
    .optional()
    .isBoolean().withMessage('available doit être un booléen.')
    .toBoolean(true),

  body('date')
    .exists({ checkFalsy: true }).withMessage('La date est obligatoire.')
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('La date doit être au format YYYY-MM-DD.'),

  body('category_id')
    .exists({ checkFalsy: true }).withMessage('category_id est obligatoire.')
    .isInt({ min: 1 }).withMessage('category_id doit être un entier positif.')
];

const updateRules = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif."),
  ...createRules
];

const idRule = [
  param('id').isInt({ min: 1 }).withMessage("L'identifiant doit être un entier positif.")
];

module.exports = { listRules, createRules, updateRules, idRule };
