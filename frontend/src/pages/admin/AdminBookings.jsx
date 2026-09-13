import { useEffect, useState } from 'react';
import {
  getAllBookingsAdmin, approveBooking, rejectBooking, rescheduleBooking, cancelBookingAdmin, getAllServices,
} from '../../api/admin';
import { getAllSlotsAdmin } from '../../api/slots';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  waiting_approval: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBookingsAdmin(statusFilter ? { status: statusFilter } : {});
      setBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await approveBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return; // cancelled prompt
    setActionLoadingId(id);
    try {
      await rejectBooking(id, reason);
      fetchBookings();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoadingId(id);
    try {
      await cancelBookingAdmin(id);
      fetchBookings();
    } finally {
      setActionLoadingId(null);
    }
  };

  const openReschedule = async (booking) => {
    setRescheduleTarget(booking);
    setSelectedNewSlot('');
    const { data } = await getAllSlotsAdmin(booking.service_id);
    setRescheduleSlots(data.slots.filter((s) => s.available && s.booked_count < s.max_bookings));
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedNewSlot) return;
    setActionLoadingId(rescheduleTarget.id);
    try {
      await rescheduleBooking(rescheduleTarget.id, selectedNewSlot);
      setRescheduleTarget(null);
      fetchBookings();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="waiting_approval">Waiting Approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No bookings found.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 text-gray-900">#{b.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{b.customer_name}</p>
                    <p className="text-gray-400 text-xs">{b.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.service_title}</td>
                  <td className="px-4 py-3 text-gray-600">{b.date}</td>
                  <td className="px-4 py-3 text-gray-600">{b.start_time?.slice(0,5)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${b.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.booking_status]}`}>
                      {b.booking_status}
                    </span>
                    {b.booking_status === 'confirmed' && b.meeting_link && (
                      <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="block text-primary-600 text-xs mt-1 underline">
                        Meet link
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {b.payment_status === 'paid' && b.booking_status === 'waiting_approval' && (
                        <button disabled={actionLoadingId === b.id} onClick={() => handleApprove(b.id)}
                          className="text-green-600 text-xs font-medium text-left">Approve</button>
                      )}
                      {!['confirmed', 'completed', 'cancelled', 'rejected'].includes(b.booking_status) && (
                        <button disabled={actionLoadingId === b.id} onClick={() => handleReject(b.id)}
                          className="text-red-500 text-xs font-medium text-left">Reject</button>
                      )}
                      {['waiting_approval', 'confirmed'].includes(b.booking_status) && (
                        <button disabled={actionLoadingId === b.id} onClick={() => openReschedule(b)}
                          className="text-primary-600 text-xs font-medium text-left">Reschedule</button>
                      )}
                      {!['cancelled', 'completed'].includes(b.booking_status) && (
                        <button disabled={actionLoadingId === b.id} onClick={() => handleCancel(b.id)}
                          className="text-gray-500 text-xs font-medium text-left">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rescheduleTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Reschedule Booking #{rescheduleTarget.id}
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Slot</label>
            <select
              value={selectedNewSlot}
              onChange={(e) => setSelectedNewSlot(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Select a slot...</option>
              {rescheduleSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} — {s.start_time.slice(0,5)} to {s.end_time.slice(0,5)}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setRescheduleTarget(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleRescheduleSubmit} disabled={!selectedNewSlot}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}