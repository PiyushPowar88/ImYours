import { useEffect, useState } from 'react';
import { getAllServices } from '../../api/admin';
import { getAllSlotsAdmin, createSlot, bulkCreateSlots, deleteSlot } from '../../api/slots';

export default function AdminSlots() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'

  // single slot form
  const [singleForm, setSingleForm] = useState({ date: '', startTime: '', endTime: '', maxBookings: 1 });

  // bulk form
  const [bulkForm, setBulkForm] = useState({ startDate: '', endDate: '', times: '09:00-10:00, 10:00-11:00', maxBookings: 1 });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await getAllServices();
      setServices(data.services);
      if (data.services.length > 0) setSelectedServiceId(data.services[0].id);
    };
    fetchServices();
  }, []);

  const fetchSlots = async (serviceId) => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const { data } = await getAllSlotsAdmin(serviceId);
      setSlots(data.slots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(selectedServiceId); }, [selectedServiceId]);

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createSlot({ serviceId: selectedServiceId, ...singleForm });
      setSingleForm({ date: '', startTime: '', endTime: '', maxBookings: 1 });
      fetchSlots(selectedServiceId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  // Generates every date between startDate and endDate (inclusive)
  const buildDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const dates = buildDateRange(bulkForm.startDate, bulkForm.endDate);
      const times = bulkForm.times.split(',').map((t) => {
        const [start, end] = t.trim().split('-');
        return { start: start.trim(), end: end.trim() };
      });

      await bulkCreateSlots({
        serviceId: selectedServiceId,
        dates,
        times,
        maxBookings: bulkForm.maxBookings,
      });
      fetchSlots(selectedServiceId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bulk create slots');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    await deleteSlot(id);
    fetchSlots(selectedServiceId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Slots</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {selectedServiceId && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('single')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'single' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Single Slot
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'bulk' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Bulk Generate
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            {mode === 'single' ? (
              <form onSubmit={handleCreateSingle} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" required value={singleForm.date}
                    onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                  <input type="time" required value={singleForm.startTime}
                    onChange={(e) => setSingleForm({ ...singleForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                  <input type="time" required value={singleForm.endTime}
                    onChange={(e) => setSingleForm({ ...singleForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <button type="submit" disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium">
                  {saving ? 'Adding...' : 'Add Slot'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBulkCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input type="date" required value={bulkForm.startDate}
                      onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input type="date" required value={bulkForm.endDate}
                      onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Time Slots (comma separated, format HH:MM-HH:MM)
                  </label>
                  <input value={bulkForm.times}
                    onChange={(e) => setBulkForm({ ...bulkForm, times: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="09:00-10:00, 10:00-11:00, 14:00-15:00" />
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Bookings / Slot</label>
                    <input type="number" min="1" value={bulkForm.maxBookings}
                      onChange={(e) => setBulkForm({ ...bulkForm, maxBookings: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <button type="submit" disabled={saving}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    {saving ? 'Generating...' : 'Generate Slots'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  This creates a slot for every day in the range × every time listed. Weekends/holidays aren't skipped automatically — pick your date range accordingly.
                </p>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Booked / Max</th>
                  <th className="px-5 py-3 font-medium">Available</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-gray-400 text-center">Loading...</td></tr>
                ) : slots.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-gray-400 text-center">No slots yet for this service.</td></tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 text-gray-900">{slot.date}</td>
                      <td className="px-5 py-3 text-gray-600">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</td>
                      <td className="px-5 py-3 text-gray-600">{slot.booked_count} / {slot.max_bookings}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {slot.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(slot.id)} className="text-red-500 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}