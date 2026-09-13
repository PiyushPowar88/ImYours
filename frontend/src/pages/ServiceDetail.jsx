import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../api/services';
import { getSlotsByService } from '../api/slots';
import { useAuth } from '../context/AuthContext';
import { TIMEZONES, formatSlotTime } from '../utils/timezone';

const DATES_PER_PAGE = 4;

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [datePage, setDatePage] = useState(0);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await getServiceById(id);
        setService(data.service);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      const { data } = await getSlotsByService(id);
      setSlots(data.slots);
    };
    fetchSlots();
  }, [id]);

  const uniqueDates = [...new Set(slots.map((s) => s.date))].sort();
  const activeDate = selectedDate || uniqueDates[0];
  const slotsForSelectedDate = slots.filter((s) => s.date === activeDate);

  const visibleDates = uniqueDates.slice(datePage * DATES_PER_PAGE, datePage * DATES_PER_PAGE + DATES_PER_PAGE);
  const canGoPrev = datePage > 0;
  const canGoNext = (datePage + 1) * DATES_PER_PAGE < uniqueDates.length;

  const handlePrimaryAction = () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/services/${id}` } });
      return;
    }
    if (!selectedSlot) return;
    navigate(`/book/${id}`, { state: { slot: selectedSlot, service } });
  };

  const handleSignupAction = () => {
    navigate('/signup', { state: { redirectTo: `/services/${id}` } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-500 to-indigo-300 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  if (!service) {
    return (
<div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <p className="text-white">Service not found.</p>
      </div>
    );
  }

  const descriptionParagraphs = (service.description || '').split('\n').filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
<div className="bg-primary-700/60 backdrop-blur-sm px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-xl">←</button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
            {service.title.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">{service.title}</p>
            <p className="text-white/70 text-xs leading-tight">Service Booking</p>
          </div>
        </div>
        <p className="text-white/60 text-xs hidden sm:block">Built with ♥ · Booking Platform</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left: service info */}
          <div className="p-8 border-r border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span>🕐 {service.duration} mins</span>
              <span className="text-gray-300">|</span>
              <span>📹 {service.meeting_type.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-semibold text-gray-900">
                ₹{Number(service.price).toLocaleString('en-IN')}
              </span>
              {service.is_popular && (
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  ★ Most Popular
                </span>
              )}
            </div>

            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              {descriptionParagraphs.length > 0 ? (
                descriptionParagraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-gray-400">No description provided.</p>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
              This is a professional service booking and does not constitute medical, legal, or financial advice unless explicitly stated by the provider.
            </p>
          </div>

          {/* Right: booking widget */}
          <div className="p-8 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">When should we connect?</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setDatePage((p) => Math.max(0, p - 1))}
                  disabled={!canGoPrev}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:border-gray-300"
                >
                  ←
                </button>
                <button
                  onClick={() => setDatePage((p) => p + 1)}
                  disabled={!canGoNext}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:border-gray-300"
                >
                  →
                </button>
              </div>
            </div>

            {uniqueDates.length === 0 ? (
              <p className="text-gray-500 text-sm">No slots available right now. Check back soon.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {visibleDates.map((date) => {
                    const count = slots.filter((s) => s.date === date).length;
                    const isActive = date === activeDate;
                    const d = new Date(date);
                    return (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`px-2 py-3 rounded-xl border text-center transition
                          ${isActive ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className="text-[10px] font-medium text-gray-400 tracking-wide">
                          {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                          {d.getDate()} {d.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                          {count} slot{count !== 1 ? 's' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select your preferred time slot</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {slotsForSelectedDate.length === 0 ? (
                    <p className="col-span-3 text-gray-400 text-sm">No slots for this date.</p>
                  ) : (
                    slotsForSelectedDate.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition
                          ${selectedSlot?.id === slot.id
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}
                      >
                        {formatSlotTime(slot.date, slot.start_time, timezone)}
                      </button>
                    ))
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Select your preferred time zone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {user ? (
                  <button
                    onClick={handlePrimaryAction}
                    disabled={!selectedSlot}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
                  >
                    Confirm your booking
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handlePrimaryAction}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition"
                    >
                      Login to Book
                    </button>
                    <button
                      onClick={handleSignupAction}
                      className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition text-sm"
                    >
                      New here? Create an account
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}