/**
 * ============================================================================
 *  models/notificationModel.js — Couche d'accès aux données pour Notification
 * ============================================================================
 */

'use strict';

const { pool } = require('../config/database');

const COLUMNS = `id, sender, recipient, content, date, application_id, created_at`;

async function findAll({ page = 1, limit = 20, recipient } = {}) {
  const offset = (page - 1) * limit;
  const where = recipient ? `WHERE recipient = ?` : '';
  const params = recipient ? [recipient] : [];
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM notifications ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM notifications ${where}`, params);
  return { data: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM notifications WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByApplicationId(applicationId, excludeId = null) {
  let query = `SELECT id FROM notifications WHERE application_id = ?`;
  const params = [applicationId];
  if (excludeId !== null) {
    query += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO notifications (sender, recipient, content, date, application_id)
     VALUES (?, ?, ?, ?, ?)`,
    [data.sender, data.recipient, data.content, data.date, data.application_id]
  );
  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE notifications SET
        sender = ?, recipient = ?, content = ?, date = ?, application_id = ?
     WHERE id = ?`,
    [data.sender, data.recipient, data.content, data.date, data.application_id, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query(`DELETE FROM notifications WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByApplicationId,
  create,
  update,
  remove
};
