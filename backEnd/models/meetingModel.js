/**
 * ============================================================================
 *  models/meetingModel.js — Couche d'accès aux données pour Meeting
 * ============================================================================
 */

'use strict';

const { pool } = require('../config/database');

const COLUMNS = `id, reference, link, status, application_id, created_at, updated_at`;

async function findAll({ page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit;
  const where = status ? `WHERE status = ?` : '';
  const params = status ? [status] : [];
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM meetings ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM meetings ${where}`, params);
  return { data: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM meetings WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByApplicationId(applicationId, excludeId = null) {
  let query = `SELECT id FROM meetings WHERE application_id = ?`;
  const params = [applicationId];
  if (excludeId !== null) {
    query += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

async function findByReference(reference, excludeId = null) {
  let query = `SELECT id FROM meetings WHERE reference = ?`;
  const params = [reference];
  if (excludeId !== null) {
    query += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO meetings (reference, link, status, application_id)
     VALUES (?, ?, ?, ?)`,
    [data.reference, data.link || null, data.status || 'scheduled', data.application_id]
  );
  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE meetings SET
        reference = ?, link = ?, status = ?, application_id = ?,
        updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.reference, data.link || null, data.status, data.application_id, id]
  );
  return result.affectedRows > 0;
}

async function updateStatus(id, status) {
  const [result] = await pool.query(
    `UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query(`DELETE FROM meetings WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByApplicationId,
  findByReference,
  create,
  update,
  updateStatus,
  remove
};
