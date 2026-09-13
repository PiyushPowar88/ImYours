import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getAllServices, createService, updateService, deleteService } from '../../api/admin';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await getAllServices();
      setServices(data.services);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

 const openCreateModal = () => {
  setEditingService(null);
  reset({ title: '', hostName: '', description: '', duration: '', price: '', meetingType: 'google_meet', status: 'active', isPopular: false });
  setServerError('');
  setShowModal(true);
};

const openEditModal = (service) => {
  setEditingService(service);
  reset({
    title: service.title,
    hostName: service.host_name || '',
    description: service.description,
    duration: service.duration,
    price: service.price,
    meetingType: service.meeting_type,
    status: service.status,
    isPopular: service.is_popular || false,
  });
  setServerError('');
  setShowModal(true);
};

const onSubmit = async (formValues) => {
  setSaving(true);
  setServerError('');
  try {
    const formData = new FormData();
    formData.append('title', formValues.title);
    formData.append('hostName', formValues.hostName || '');
    formData.append('description', formValues.description || '');
    formData.append('duration', formValues.duration);
    formData.append('price', formValues.price);
    formData.append('meetingType', formValues.meetingType);
    formData.append('status', formValues.status);
    formData.append('isPopular', formValues.isPopular || false);
    if (formValues.hostPhoto?.[0]) formData.append('hostPhoto', formValues.hostPhoto[0]);

    if (editingService) {
      await updateService(editingService.id, formData);
    } else {
      await createService(formData);
    }

    setShowModal(false);
    fetchServices();
  } catch (err) {
    setServerError(err.response?.data?.message || 'Failed to save service');
  } finally {
    setSaving(false);
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    await deleteService(id);
    fetchServices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          + Add Service
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500">No services yet. Click "Add Service" to create your first one.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.title}</td>
                  <td className="px-5 py-3 text-gray-600">{s.duration} mins</td>
                  <td className="px-5 py-3 text-gray-600">₹{Number(s.price).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 space-x-3">
                    <button onClick={() => openEditModal(s)} className="text-primary-600 font-medium">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>

            {serverError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{serverError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Host / Organizer Name</label>
  <input
    {...register('hostName')}
    placeholder="e.g. Shradha Jain"
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Host Photo {editingService && '(leave blank to keep current)'}
  </label>
  <input type="file" accept="image/*" {...register('hostPhoto')} className="w-full text-sm text-gray-600" />
</div>

<label className="flex items-center gap-2 text-sm text-gray-700">
  <input type="checkbox" {...register('isPopular')} />
  Mark as "Most Popular"
</label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    {...register('duration', { required: 'Required' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { required: 'Required' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                  <select
                    {...register('meetingType')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="in_person">In Person</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image {editingService && '(leave blank to keep current)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  className="w-full text-sm text-gray-600"
                />
              </div> */}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium"
                >
                  {saving ? 'Saving...' : editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}