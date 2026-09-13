import { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../api/bookings';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  waiting_approval: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
};

const STATUS_LABELS = {
  pending: 'Pending Payment',
  waiting_approval: 'Waiting Approval',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function BookingCard({ booking, onCancel }) {
  const canCancel = ['pending', 'waiting_approval', 'confirmed'].includes(booking.booking_status);
  const isUpcoming = new Date(`${booking.date}T${booking.start_time}`) > new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.service_title}</h3>
          <p className="text-sm text-gray-500">
            {booking.date} at {booking.start_time?.slice(0, 5)} · {booking.duration} mins
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[booking.booking_status]}`}>
          {STATUS_LABELS[booking.booking_status]}
        </span>
      </div>

    <p className="text-sm text-gray-500 mb-3">
  ₹{Number(booking.price).toLocaleString("en-IN")}
</p>

{booking.booking_status === "confirmed" && booking.meeting_link && (
  <a
    href={booking.meeting_link}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium mb-3"
  >
    🎥 Join Google Meet
  </a>
)}

{booking.booking_status === "waiting_approval" && (
  <p className="text-sm text-gray-400 mb-3">
    Payment received — waiting for admin approval. You'll get the meeting link
    here once confirmed.
  </p>
)}

{booking.booking_status === "pending" && (
  <p className="text-sm text-yellow-600 mb-3">
    Payment not completed for this booking.
  </p>
)}

      {/* {canCancel && isUpcoming && (
        <button
          onClick={() => onCancel(booking.id)}
          className="text-red-500 text-sm font-medium"
        >
          Cancel Booking
        </button>
      )} */}
    </div>
  );
}

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await cancelBooking(id);
    fetchBookings();
  };

  const now = new Date();
  const upcoming = bookings.filter((b) =>
    new Date(`${b.date}T${b.start_time}`) >= now && !['cancelled', 'rejected', 'completed'].includes(b.booking_status)
  );
  const past = bookings.filter((b) =>
    new Date(`${b.date}T${b.start_time}`) < now || ['cancelled', 'rejected', 'completed'].includes(b.booking_status)
  );

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'upcoming' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'past' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            Past / Completed ({past.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500">No bookings here yet.</p>
        ) : (
          <div className="space-y-4">
            {list.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}