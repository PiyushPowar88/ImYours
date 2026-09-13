require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT || 3306,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RESET_TOKEN_EXPIRES_MIN: parseInt(process.env.RESET_TOKEN_EXPIRES_MIN || '30', 10),
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
ADMIN_TIMEZONE: process.env.ADMIN_TIMEZONE || 'Asia/Kolkata',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

console.log('Razorpay Key ID loaded:', module.exports.RAZORPAY_KEY_ID);