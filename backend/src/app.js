const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const slotRoutes = require('./routes/slot.routes');
const formRoutes = require('./routes/form.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Capture raw body ONLY for the webhook route, before JSON parsing
app.use('/api/payment/webhook', express.json({
  verify: (req, res, buf) => { req.rawBody = buf; },
}));

app.use('/api/admin', adminRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;