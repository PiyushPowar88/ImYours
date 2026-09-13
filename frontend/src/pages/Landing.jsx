import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../api/services';
import { getSlotsByService } from '../api/slots';
import { formatSlotTime } from '../utils/timezone';

function buildImageUrl(path) {
  return path ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${path}` : null;
}

function HostCard({ service }) {
  const navigate = useNavigate();
  const [previewSlots, setPreviewSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await getSlotsByService(service.id);
        setPreviewSlots(data.slots.slice(0, 4));
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [service.id]);

  const hostPhotoUrl = buildImageUrl(service.host_photo);
  const displayName = service.host_name || service.title;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0 ring-2 ring-primary-100">
          {hostPhotoUrl ? (
            <img src={hostPhotoUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 leading-tight truncate">{displayName}</h3>
          <p className="text-gray-400 text-sm truncate">{service.title}</p>
        </div>
        {service.is_popular && (
          <span className="ml-auto flex-shrink-0 bg-amber-50 text-amber-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            ★ Popular
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span>{service.duration} mins</span>
        <span>•</span>
        <span>₹{Number(service.price).toLocaleString('en-IN')}</span>
      </div>

      <div className="mb-5 min-h-[40px]">
        {loadingSlots ? (
          <p className="text-gray-300 text-xs">Loading slots...</p>
        ) : previewSlots.length === 0 ? (
          <p className="text-gray-300 text-xs">No slots available right now.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {previewSlots.map((slot) => (
              <span
                key={slot.id}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600"
              >
                {formatSlotTime(slot.date, slot.start_time, 'Asia/Kolkata')}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/services/${service.id}`)}
        className="mt-auto w-full bg-primary-600 group-hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition text-sm"
      >
        Book with {displayName.split(' ')[0]}
      </button>
    </div>
  );
}

export default function Landing() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await getServices();
        setServices(data.services);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Available Sessions & Hosts</h1>
        <p className="text-primary-100 text-sm sm:text-base max-w-lg mx-auto">
          Pick a host, choose a slot that works for you, and connect over Google Meet.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 -mt-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-56 animate-pulse" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && services.length === 0 && (
          <p className="text-gray-500 text-center">No sessions available right now. Check back soon.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <HostCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}