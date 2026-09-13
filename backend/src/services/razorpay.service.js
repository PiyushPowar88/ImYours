const Razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('../config/env');

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

async function createOrder({ amount, receipt }) {
  // Razorpay expects amount in paise
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
  return order;
}

function verifySignature({ orderId, paymentId, signature }) {
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}

function verifyWebhookSignature(rawBody, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return generatedSignature === signature;
}

module.exports = { razorpay, createOrder, verifySignature, verifyWebhookSignature };