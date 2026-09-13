const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadAny } = require('../middleware/upload.middleware');

router.post('/', authMiddleware, uploadAny.any(), bookingController.createBooking);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;