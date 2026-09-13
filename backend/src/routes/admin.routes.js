const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.use(authMiddleware, adminMiddleware); // every route below requires admin

router.get('/dashboard', adminController.getDashboard);
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/approve', adminController.approveBooking);
router.put('/bookings/:id/reject', adminController.rejectBooking);
router.put('/bookings/:id/reschedule', adminController.rescheduleBooking);
router.put('/bookings/:id/cancel', adminController.cancelBookingAdmin);

module.exports = router;