const BookingModel = require('../models/booking.model');
const UserModel = require('../models/user.model');
const SlotModel = require('../models/slot.model');
const { sendEmail } = require('../services/email.service');
const { createMeetEvent, deleteMeetEvent } = require('../services/googleMeet.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalBookings, totalRevenue, todayAppointments] = await Promise.all([
      UserModel.countAll(),
      BookingModel.countAll(),
      BookingModel.sumRevenue(),
      BookingModel.countToday(),
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalBookings, totalRevenue, todayAppointments },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.query;
    const bookings = await BookingModel.findAll({ status, paymentStatus });
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// Approve: only allowed once payment is confirmed. Generates the Meet link and emails it.
exports.approveBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot approve a booking that has not been paid' });
    }
    if (booking.booking_status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed' });
    }

    let meetLink, eventId;
    try {
      const result = await createMeetEvent({
        summary: `${booking.service_title} — ${booking.customer_name}`,
        description: `1:1 session booked via the platform.`,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        attendeeEmail: booking.customer_email,
      });
      meetLink = result.meetLink;
      eventId = result.eventId;
    } catch (meetErr) {
      console.error('Google Meet event creation failed:', meetErr.response?.data || meetErr.message);
      return res.status(502).json({
        success: false,
        message: 'Could not generate the Google Meet link. Check the Google Calendar credentials in .env and try again.',
      });
    }

    await BookingModel.updateStatus(booking.id, {
      bookingStatus: 'confirmed',
      meetingLink: meetLink,
    });
    await BookingModel.setMeetingEventId(booking.id, eventId);

    await sendEmail({
      to: booking.customer_email,
      subject: 'Your booking is confirmed — meeting link inside',
      html: `
        <p>Hi ${booking.customer_name},</p>
        <p>Your booking for <strong>${booking.service_title}</strong> on ${booking.date} at ${booking.start_time} is confirmed.</p>
        <p>Join here: <a href="${meetLink}">${meetLink}</a></p>
      `,
    });

    const updated = await BookingModel.findById(booking.id);
    res.json({ success: true, message: 'Booking approved and meeting link sent', booking: updated });
  } catch (err) {
    next(err);
  }
};
exports.rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await BookingModel.updateStatus(booking.id, {
      bookingStatus: 'rejected',
      adminNotes: reason || null,
    });
    await SlotModel.decrementBooked(booking.slot_id);

    await sendEmail({
      to: booking.customer_email,
      subject: 'Update on your booking',
      html: `
        <p>Hi ${booking.customer_name},</p>
        <p>Unfortunately your booking for <strong>${booking.service_title}</strong> on ${booking.date} could not be confirmed.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>If you were charged, a refund will be processed. Reach out if you have questions.</p>
      `,
    });

    res.json({ success: true, message: 'Booking rejected' });
  } catch (err) {
    next(err);
  }
};

exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { newSlotId } = req.body;
    if (!newSlotId) {
      return res.status(400).json({ success: false, message: 'newSlotId is required' });
    }

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const newSlot = await SlotModel.findById(newSlotId);
    if (!newSlot || newSlot.booked_count >= newSlot.max_bookings) {
      return res.status(409).json({ success: false, message: 'Selected slot is not available' });
    }

    // Free the old slot, reserve the new one
    await SlotModel.decrementBooked(booking.slot_id);
    await SlotModel.incrementBooked(newSlotId);
    await BookingModel.updateSlot(booking.id, newSlotId);

    // If it was already confirmed with a Meet event, cancel the old one — admin re-approves to regenerate
    if (booking.meeting_event_id) {
      await deleteMeetEvent(booking.meeting_event_id);
      await BookingModel.updateStatus(booking.id, {
        bookingStatus: 'waiting_approval',
        meetingLink: null,
      });
    }

    const updated = await BookingModel.findById(booking.id);

    await sendEmail({
      to: updated.customer_email,
      subject: 'Your booking has been rescheduled',
      html: `
        <p>Hi ${updated.customer_name},</p>
        <p>Your booking for <strong>${updated.service_title}</strong> has been moved to ${updated.date} at ${updated.start_time}.</p>
        <p>${booking.meeting_event_id ? "We'll send a new meeting link once it's re-confirmed." : ''}</p>
      `,
    });

    res.json({ success: true, message: 'Booking rescheduled', booking: updated });
  } catch (err) {
    next(err);
  }
};

exports.cancelBookingAdmin = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await BookingModel.updateStatus(booking.id, { bookingStatus: 'cancelled' });
    await SlotModel.decrementBooked(booking.slot_id);

    if (booking.meeting_event_id) {
      await deleteMeetEvent(booking.meeting_event_id);
    }

    await sendEmail({
      to: booking.customer_email,
      subject: 'Your booking has been cancelled',
      html: `<p>Hi ${booking.customer_name},</p><p>Your booking for <strong>${booking.service_title}</strong> has been cancelled by the admin.</p>`,
    });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    next(err);
  }
};