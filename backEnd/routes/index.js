/**
 * ============================================================================
 *  routes/index.js — Point d'entrée qui monte toutes les routes /api/*
 * ============================================================================
 *
 *  Cette version monte :
 *    - /api/candidates      → CRUD complet
 *    - /api/addresses       → CRUD complet
 *    - /api/applications    → CRUD complet
 *    - /api/jobs            → CRUD complet
 *    - /api/notifications   → CRUD complet
 *    - /api/meetings        → CRUD complet
 * ============================================================================
 */

'use strict';

const express = require('express');
const router  = express.Router();

const candidateRoutes    = require('./candidateRoutes');
const addressRoutes      = require('./addressRoutes');
const applicationRoutes  = require('./applicationRoutes');
const jobRoutes          = require('./jobRoutes');
const notificationRoutes = require('./notificationRoutes');
const meetingRoutes      = require('./meetingRoutes');

router.use('/candidates',    candidateRoutes);
router.use('/addresses',     addressRoutes);
router.use('/applications',  applicationRoutes);
router.use('/jobs',          jobRoutes);
router.use('/notifications', notificationRoutes);
router.use('/meetings',      meetingRoutes);

module.exports = router;
