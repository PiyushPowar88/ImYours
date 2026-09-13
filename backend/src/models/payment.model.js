const { pool } = require('../config/db');

const PaymentModel = {
  async create({ bookingId, razorpayOrderId, amount }) {
    const [result] = await pool.query(
      `INSERT INTO payments (booking_id, razorpay_order_id, amount) VALUES (?, ?, ?)`,
      [bookingId, razorpayOrderId, amount]
    );
    return result.insertId;
  },

  async findByOrderId(orderId) {
    const [rows] = await pool.query(`SELECT * FROM payments WHERE razorpay_order_id = ?`, [orderId]);
    return rows[0] || null;
  },

  async findByBookingId(bookingId) {
    const [rows] = await pool.query(
      `SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`,
      [bookingId]
    );
    return rows[0] || null;
  },

  async markPaid({ orderId, paymentId, signature }) {
    await pool.query(
      `UPDATE payments SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ?`,
      [paymentId, signature, orderId]
    );
  },

  async markFailed(orderId) {
    await pool.query(`UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?`, [orderId]);
  },

  async markRefunded(orderId) {
    await pool.query(`UPDATE payments SET status = 'refunded' WHERE razorpay_order_id = ?`, [orderId]);
  },
};

module.exports = PaymentModel;