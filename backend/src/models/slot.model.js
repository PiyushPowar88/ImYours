const { pool } = require('../config/db');

const SlotModel = {
  async create({ serviceId, date, startTime, endTime, maxBookings }) {
    const [result] = await pool.query(
      `INSERT INTO slots (service_id, date, start_time, end_time, max_bookings)
       VALUES (?, ?, ?, ?, ?)`,
      [serviceId, date, startTime, endTime, maxBookings || 1]
    );
    return result.insertId;
  },

  async bulkCreate(slotsArray) {
    if (slotsArray.length === 0) return [];
    const values = slotsArray.map((s) => [
      s.serviceId, s.date, s.startTime, s.endTime, s.maxBookings || 1,
    ]);
    const [result] = await pool.query(
      `INSERT IGNORE INTO slots (service_id, date, start_time, end_time, max_bookings) VALUES ?`,
      [values]
    );
    return result;
  },

  async findByService(serviceId, { date, upcoming } = {}) {
    let query = `SELECT * FROM slots WHERE service_id = ? AND available = TRUE AND is_holiday = FALSE`;
    const params = [serviceId];

    if (date) {
      query += ` AND date = ?`;
      params.push(date);
    } else if (upcoming) {
      query += ` AND date >= CURDATE()`;
    }

    query += ` AND booked_count < max_bookings ORDER BY date ASC, start_time ASC`;
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM slots WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async update(id, fields) {
    const allowed = ['date', 'start_time', 'end_time', 'max_bookings', 'available', 'is_holiday'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    await pool.query(`UPDATE slots SET ${setClause} WHERE id = ?`, values);
  },

  async incrementBooked(id) {
    await pool.query(`UPDATE slots SET booked_count = booked_count + 1 WHERE id = ?`, [id]);
  },

  async decrementBooked(id) {
    await pool.query(`UPDATE slots SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = ?`, [id]);
  },

  async findAllByServiceAdmin(serviceId) {
  const [rows] = await pool.query(
    `SELECT * FROM slots WHERE service_id = ? ORDER BY date ASC, start_time ASC`,
    [serviceId]
  );
  return rows;
},

  async remove(id) {
    await pool.query(`DELETE FROM slots WHERE id = ?`, [id]);
  },
};

module.exports = SlotModel;