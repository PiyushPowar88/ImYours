const { pool } = require('../config/db');

const ServiceModel = {
async create({ title, hostName, description, duration, price, hostPhoto, meetingType, isPopular }) {
  const [result] = await pool.query(
    `INSERT INTO services (title, host_name, description, duration, price, host_photo, meeting_type, is_popular)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, hostName || null, description, duration, price, hostPhoto || null, meetingType || 'google_meet', isPopular || false]
  );
  return result.insertId;
},

  async findAll({ status } = {}) {
    let query = `SELECT * FROM services`;
    const params = [];
    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }
    query += ` ORDER BY created_at DESC`;
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM services WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async update(id, fields) {
  const allowed = ['title', 'host_name', 'description', 'duration', 'price', 'image', 'host_photo', 'meeting_type', 'status', 'is_popular'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    await pool.query(`UPDATE services SET ${setClause} WHERE id = ?`, values);
  },

  async remove(id) {
    await pool.query(`DELETE FROM services WHERE id = ?`, [id]);
  },
};

module.exports = ServiceModel;