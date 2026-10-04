/**
 * ============================================================================
 *  models/applicationModel.js — Couche d'accès aux données pour Application
 * ============================================================================
 */

'use strict';

const { pool } = require('../config/database');

const COLUMNS = `id, applicationDate, motivation, candidate_id, job_id, created_at, updated_at`;

async function findAll({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM applications ORDER BY id ASC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM applications`);
  return { data: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM applications WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByCandidateAndJob(candidateId, jobId, excludeId = null) {
  let query = `SELECT id FROM applications WHERE candidate_id = ? AND job_id = ?`;
  const params = [candidateId, jobId];
  if (excludeId !== null) {
    query += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO applications (applicationDate, motivation, candidate_id, job_id)
     VALUES (?, ?, ?, ?)`,
    [data.applicationDate, data.motivation || null, data.candidate_id, data.job_id]
  );
  return result.insertId;
}

async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE applications SET
        applicationDate = ?, motivation = ?, candidate_id = ?, job_id = ?,
        updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.applicationDate, data.motivation || null, data.candidate_id, data.job_id, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query(`DELETE FROM applications WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByCandidateAndJob,
  create,
  update,
  remove
};
