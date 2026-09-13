const { pool } = require('../config/db');
const ServiceModel = require('../models/service.model');
const SlotModel = require('../models/slot.model');
const FormModel = require('../models/form.model');
const BookingModel = require('../models/booking.model');

exports.createBooking = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { serviceId, slotId } = req.body;
    const userId = req.user.id;

    if (!serviceId || !slotId) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'serviceId and slotId are required' });
    }

    const service = await ServiceModel.findById(serviceId);
    if (!service || service.status !== 'active') {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Service not available' });
    }

    const slot = await SlotModel.findById(slotId);
    if (!slot || !slot.available || slot.booked_count >= slot.max_bookings) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'This slot is no longer available' });
    }

    // Validate dynamic form against what admin configured for this service
    const formFields = await FormModel.getByService(serviceId);
    const errors = [];

    for (const field of formFields) {
      const key = `field_${field.id}`;
      const isFileField = field.field_type === 'file';
      const submittedFile = req.files?.find((f) => f.fieldname === key);
      const submittedValue = req.body[key];

      if (field.required) {
        if (isFileField && !submittedFile) {
          errors.push(`${field.field_name} is required`);
        } else if (!isFileField && (!submittedValue || submittedValue.trim() === '')) {
          errors.push(`${field.field_name} is required`);
        }
      }
    }

    if (errors.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Form validation failed', errors });
    }

    // Reserve the slot
    const bookingId = await BookingModel.create({ userId, serviceId, slotId });
    await SlotModel.incrementBooked(slotId);

    // Save form responses
    for (const field of formFields) {
      const key = `field_${field.id}`;
      const isFileField = field.field_type === 'file';
      const submittedFile = req.files?.find((f) => f.fieldname === key);

      let value = null;
      if (isFileField && submittedFile) {
        value = `/uploads/${submittedFile.filename}`;
      } else if (req.body[key] !== undefined) {
        value = req.body[key];
      }

      if (value !== null) {
        await FormModel.saveResponse({ bookingId, fieldId: field.id, value });
      }
    }

    await conn.commit();

    const booking = await BookingModel.findById(bookingId);
    res.status(201).json({
      success: true,
      message: 'Booking created, proceed to payment',
      booking,
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the owner or an admin can view it
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const formResponses = await FormModel.getResponsesByBooking(booking.id);
    res.json({ success: true, booking, formResponses });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findByUser(req.user.id);
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (['completed', 'cancelled'].includes(booking.booking_status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.booking_status} booking` });
    }

    await BookingModel.updateStatus(booking.id, { bookingStatus: 'cancelled' });
    await SlotModel.decrementBooked(booking.slot_id);

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    next(err);
  }
};