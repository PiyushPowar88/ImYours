import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getServiceById } from '../api/services';
import { getFormFields } from '../api/forms';
import { createBooking, cancelBooking } from '../api/bookings'; 
import { createPaymentOrder, verifyPayment } from '../api/payment';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';

export default function BookingPage() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(location.state?.service || null);
  const [slot, setSlot] = useState(location.state?.slot || null);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [fileValues, setFileValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!service) {
          const { data } = await getServiceById(serviceId);
          setService(data.service);
        }
        const { data: formData } = await getFormFields(serviceId);
        setFields(formData.fields);
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!slot) {
    setError('No slot selected. Please go back and pick a time slot.');
    return;
  }

  setSubmitting(true);
  let createdBookingId = null;

  try {
    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('slotId', slot.id);
    Object.entries(values).forEach(([key, val]) => formData.append(key, val));
    Object.entries(fileValues).forEach(([key, file]) => formData.append(key, file));

    const { data: bookingData } = await createBooking(formData);
    const booking = bookingData.booking;
    createdBookingId = booking.id;

    const { data: orderData } = await createPaymentOrder(booking.id);

if (typeof window.Razorpay === 'undefined') {
  throw new Error('Payment gateway failed to load. Please disable any ad blocker and refresh the page.');
}

    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      order_id: orderData.order.id,
      name: 'Booking Platform',
      description: service.title,
      prefill: { name: user.name, email: user.email, contact: user.phone || '' },
      theme: { color: '#4f46e5' },
      handler: async (response) => {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: booking.id,
          });
          navigate('/dashboard', { state: { justBooked: true } });
        } catch (err) {
          setError('Payment succeeded but verification failed. Contact support with your payment ID.');
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: async () => {
          // User closed the checkout without paying — release the slot now
          await cancelBooking(booking.id).catch(() => {});
          setSubmitting(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
 } catch (err) {
  if (createdBookingId) {
    await cancelBooking(createdBookingId).catch(() => {});
  }
  setError(err.response?.data?.message || err.message || 'Booking failed. Please try again.');
  setSubmitting(false);
}
};

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!service || !slot) {
    return (
      <div className="p-8 text-gray-500">
        Missing booking details. Please go back to the service page and select a slot.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h1>
          <p className="text-gray-500 text-sm">
            {slot.date} at {slot.start_time.slice(0, 5)} · {service.duration} mins · ₹{Number(service.price).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Details</h2>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {fields.length > 0 ? (
              <DynamicForm
                fields={fields}
                values={values}
                onChange={setValues}
                fileValues={fileValues}
                onFileChange={setFileValues}
              />
            ) : (
              <p className="text-gray-400 text-sm mb-4">No additional details required for this service.</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition"
            >
              {submitting ? 'Processing...' : `Pay ₹${Number(service.price).toLocaleString('en-IN')} & Confirm`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}