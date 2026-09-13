const razorpayService = require('../services/razorpay.service');
const PaymentModel = require('../models/payment.model');
const BookingModel = require('../models/booking.model');
const { sendEmail } = require('../services/email.service');

// Step 1: Create a Razorpay order for an existing (pending) booking
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'This booking is already paid' });
    }

    const order = await razorpayService.createOrder({
      amount: booking.price,
      receipt: `booking_${booking.id}`,
    });

    await PaymentModel.create({
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amount: booking.price,
    });

    res.status(201).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      booking: { id: booking.id, service_title: booking.service_title },
    });
  } catch (err) {
    next(err);
  }
};

// Step 2: Frontend calls this after Razorpay checkout succeeds client-side,
// carrying the order_id, payment_id, and signature returned by Razorpay's widget
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const isValid = razorpayService.verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      await PaymentModel.markFailed(razorpay_order_id);
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    await PaymentModel.markPaid({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    await BookingModel.updateStatus(bookingId, {
      paymentStatus: 'paid',
      bookingStatus: 'waiting_approval',
    });

    const booking = await BookingModel.findById(bookingId);

    await sendEmail({
      to: booking.customer_email,
      subject: 'Payment received — booking pending approval',
      html: `
        <p>Hi ${booking.customer_name},</p>
        <p>We've received your payment for <strong>${booking.service_title}</strong> on ${booking.date} at ${booking.start_time}.</p>
        <p>Your booking is now awaiting admin approval. You'll get a confirmation email with the meeting link shortly.</p>
      `,
    });

    res.json({ success: true, message: 'Payment verified successfully', booking });
  } catch (err) {
    next(err);
  }
};

// Webhook: Razorpay server-to-server notification (backup in case client-side verify is missed)
exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = razorpayService.verifyWebhookSignature(req.rawBody, signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;

      const payment = await PaymentModel.findByOrderId(orderId);
      if (payment && payment.status !== 'paid') {
        await PaymentModel.markPaid({ orderId, paymentId, signature: 'webhook_verified' });
        await BookingModel.updateStatus(payment.booking_id, {
          paymentStatus: 'paid',
          bookingStatus: 'waiting_approval',
        });
      }
    }

    if (event === 'payment.failed') {
      const orderId = payload.payment.entity.order_id;
      await PaymentModel.markFailed(orderId);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};