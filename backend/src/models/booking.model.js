const { pool } = require('../config/db');

const BookingModel = {
  async create({ userId, serviceId, slotId }) {
    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, service_id, slot_id) VALUES (?, ?, ?)`,
      [userId, serviceId, slotId]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT b.*, s.title AS service_title, s.duration, s.price, s.meeting_type,
              sl.date, sl.start_time, sl.end_time,
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN slots sl ON b.slot_id = sl.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT b.*, s.title AS service_title, s.duration, s.price,
              sl.date, sl.start_time, sl.end_time
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN slots sl ON b.slot_id = sl.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findAll({ status, paymentStatus } = {}) {
    let query = `
      SELECT b.*, s.title AS service_title, sl.date, sl.start_time, sl.end_time,
             u.name AS customer_name, u.email AS customer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND b.booking_status = ?`;
      params.push(status);
    }
    if (paymentStatus) {
      query += ` AND b.payment_status = ?`;
      params.push(paymentStatus);
    }
    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async updateStatus(id, { bookingStatus, paymentStatus, meetingLink, adminNotes }) {
    const fields = [];
    const values = [];

    if (bookingStatus) { fields.push('booking_status = ?'); values.push(bookingStatus); }
    if (paymentStatus) { fields.push('payment_status = ?'); values.push(paymentStatus); }
    if (meetingLink !== undefined) { fields.push('meeting_link = ?'); values.push(meetingLink); }
    if (adminNotes !== undefined) { fields.push('admin_notes = ?'); values.push(adminNotes); }

    if (fields.length === 0) return;
    values.push(id);

    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async countAll() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM bookings`);
    return rows[0].total;
  },

  async sumRevenue() {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(s.price), 0) AS total
       FROM bookings b JOIN services s ON b.service_id = s.id
       WHERE b.payment_status = 'paid'`
    );
    return rows[0].total;
  },

  async updateSlot(id, newSlotId) {
  await pool.query(`UPDATE bookings SET slot_id = ? WHERE id = ?`, [newSlotId, id]);
},

async setMeetingEventId(id, eventId) {
  await pool.query(`UPDATE bookings SET meeting_event_id = ? WHERE id = ?`, [eventId, id]);
},


async findStalePending(minutesOld) {
  const [rows] = await pool.query(
    `SELECT * FROM bookings
     WHERE booking_status = 'pending'
     AND payment_status = 'pending'
     AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [minutesOld]
  );
  return rows;
},

  async countToday() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings b
       JOIN slots sl ON b.slot_id = sl.id
       WHERE sl.date = CURDATE() AND b.booking_status IN ('confirmed', 'waiting_approval')`
    );
    return rows[0].total;
  },
};

module.exports = BookingModel;