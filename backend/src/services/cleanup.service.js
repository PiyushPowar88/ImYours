const BookingModel = require('../models/booking.model');
const SlotModel = require('../models/slot.model');

const STALE_MINUTES = 15; // adjust as needed

async function releaseStaleBookings() {
  try {
    const staleBookings = await BookingModel.findStalePending(STALE_MINUTES);

    for (const booking of staleBookings) {
      await BookingModel.updateStatus(booking.id, { bookingStatus: 'cancelled' });
      await SlotModel.decrementBooked(booking.slot_id);
      console.log(`Released stale booking #${booking.id}, slot #${booking.slot_id}`);
    }
  } catch (err) {
    console.error('Cleanup job failed:', err.message);
  }
}

module.exports = { releaseStaleBookings };