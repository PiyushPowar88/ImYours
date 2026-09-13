const { pool } = require('../config/db');

const UserModel = {
  async create({ name, email, phone, hashedPassword }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
      [name, email, phone || null, hashedPassword]
    );
    return result.insertId;
  },

async countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE role = 'user'`);
  return rows[0].total;
},

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async setResetToken(email, token, expiresAt) {
    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?`,
      [token, expiresAt, email]
    );
  },

  async findByResetToken(token) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()`,
      [token]
    );
    return rows[0] || null;
  },

  async updatePassword(id, hashedPassword) {
    await pool.query(
      `UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
      [hashedPassword, id]
    );
  },
};

module.exports = UserModel;