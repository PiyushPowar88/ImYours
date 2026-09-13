const { pool } = require('../config/db');

const FormModel = {
  async addField({ serviceId, fieldName, fieldType, options, placeholder, required, sortOrder }) {
    const [result] = await pool.query(
      `INSERT INTO dynamic_forms (service_id, field_name, field_type, options, placeholder, required, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId,
        fieldName,
        fieldType,
        options ? JSON.stringify(options) : null,
        placeholder || null,
        required || false,
        sortOrder || 0,
      ]
    );
    return result.insertId;
  },

  async getByService(serviceId) {
    const [rows] = await pool.query(
      `SELECT * FROM dynamic_forms WHERE service_id = ? ORDER BY sort_order ASC, id ASC`,
      [serviceId]
    );
    return rows.map((r) => ({ ...r, options: r.options ? JSON.parse(r.options) : null }));
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM dynamic_forms WHERE id = ?`, [id]);
    if (!rows[0]) return null;
    return { ...rows[0], options: rows[0].options ? JSON.parse(rows[0].options) : null };
  },

  async update(id, fields) {
    const allowed = ['field_name', 'field_type', 'options', 'placeholder', 'required', 'sort_order'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return;

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (k === 'options' && fields[k] ? JSON.stringify(fields[k]) : fields[k]));
    values.push(id);

    await pool.query(`UPDATE dynamic_forms SET ${setClause} WHERE id = ?`, values);
  },

  async reorder(serviceId, orderedIds) {
    // orderedIds: [3, 1, 2] -> sort_order becomes 0, 1, 2 respectively
    const queries = orderedIds.map((id, index) =>
      pool.query(`UPDATE dynamic_forms SET sort_order = ? WHERE id = ? AND service_id = ?`, [index, id, serviceId])
    );
    await Promise.all(queries);
  },

  async remove(id) {
    await pool.query(`DELETE FROM dynamic_forms WHERE id = ?`, [id]);
  },

  // --- Form Responses ---
  async saveResponse({ bookingId, fieldId, value }) {
    await pool.query(
      `INSERT INTO form_responses (booking_id, field_id, value) VALUES (?, ?, ?)`,
      [bookingId, fieldId, value]
    );
  },

  async getResponsesByBooking(bookingId) {
    const [rows] = await pool.query(
      `SELECT fr.*, df.field_name, df.field_type
       FROM form_responses fr
       JOIN dynamic_forms df ON fr.field_id = df.id
       WHERE fr.booking_id = ?
       ORDER BY df.sort_order ASC`,
      [bookingId]
    );
    return rows;
  },
};

module.exports = FormModel;