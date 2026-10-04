/**
 * ============================================================================
 *  models/categoryModel.js — Couche d'accès aux données pour Category
 * ============================================================================
 */

'use strict';

const { pool } = require('../config/database');

const COLUMNS = `id, name, description, created_at`;

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM categories WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { findById };
