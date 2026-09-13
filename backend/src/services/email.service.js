const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"Booking Platform" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
}

module.exports = { sendEmail };