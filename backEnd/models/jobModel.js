/**
 * ============================================================================
 *  models/jobModel.js — Couche d'accès aux données pour Job
 * ============================================================================
 */

'use strict';

const { pool } = require('../config/database');

const COLUMNS = `id, name, description, available, date, category_id, created_at, updated_at`;

function formatRow(row) {
  if (!row) return null;
  return { ...row, available: Boolean(row.available) };
}

function buildFilters({ search, category_id, available }) {
  const conditions = [];
  const params = [];
  if (search) {
    conditions.push(`name LIKE ?`);
    params.push(`%${search}%`);
  }
  if (category_id) {
    conditions.push(`category_id = ?`);
    params.push(category_id);
  }
  if (available !== undefined) {
    conditions.push(`available = ?`);
    params.push(available);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

async function findAll({ page = 1, limit = 20, search, category_id, available } = {}) {
  const offset = (page - 1) * limit;
  const { where, params } = buildFilters({ search, category_id, available });
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM jobs ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM jobs ${where}`, params);
  return { data: rows.map(formatRow), total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM jobs WHERE id = ? LIMIT 1`,
    [id]
  );
  return formatRow(rows[0]);
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO jobs (name, description, available, date, category_id)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.description, data.available ?? true, data.date, data.category_id]
  );
  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE jobs SET
        name = ?, description = ?, available = ?, date = ?, category_id = ?,
        updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.name, data.description, data.available ?? true, data.date, data.category_id, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query(`DELETE FROM jobs WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
