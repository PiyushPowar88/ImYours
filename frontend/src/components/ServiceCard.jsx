import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const imageUrl = service.image
    ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${service.image}`
    : null;

  return (
    <Link
      to={`/services/${service.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-44 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{service.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary-600 font-bold">₹{Number(service.price).toLocaleString('en-IN')}</span>
          <span className="text-gray-400 text-sm">{service.duration} mins</span>
        </div>
      </div>
    </Link>
  );
}