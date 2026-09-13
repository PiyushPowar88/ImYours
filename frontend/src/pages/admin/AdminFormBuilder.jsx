import { useEffect, useState } from 'react';
import { getAllServices } from '../../api/admin';
import { getFormFields, addField, updateField, deleteField, reorderFields } from '../../api/forms';

const FIELD_TYPES = ['text', 'number', 'email', 'phone', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'file'];
const NEEDS_OPTIONS = ['dropdown', 'checkbox', 'radio'];

export default function AdminFormBuilder() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fieldName: '', fieldType: 'text', options: '', placeholder: '', required: false,
  });

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await getAllServices();
      setServices(data.services);
      if (data.services.length > 0) setSelectedServiceId(data.services[0].id);
    };
    fetchServices();
  }, []);

  const fetchFields = async (serviceId) => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const { data } = await getFormFields(serviceId);
      setFields(data.fields);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFields(selectedServiceId); }, [selectedServiceId]);

  const resetForm = () => setForm({ fieldName: '', fieldType: 'text', options: '', placeholder: '', required: false });

  const handleAddField = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        serviceId: selectedServiceId,
        fieldName: form.fieldName,
        fieldType: form.fieldType,
        placeholder: form.placeholder || null,
        required: form.required,
        sortOrder: fields.length,
      };
      if (NEEDS_OPTIONS.includes(form.fieldType)) {
        payload.options = form.options.split(',').map((o) => o.trim()).filter(Boolean);
      }
      await addField(payload);
      resetForm();
      fetchFields(selectedServiceId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add field');
    } finally {
      setSaving(false);
    }
  };

  const toggleRequired = async (field) => {
    await updateField(field.id, { required: !field.required });
    fetchFields(selectedServiceId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field? Existing responses stay, but new bookings won\'t collect it.')) return;
    await deleteField(id);
    fetchFields(selectedServiceId);
  };

  const moveField = async (index, direction) => {
    const newFields = [...fields];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
    await reorderFields(selectedServiceId, newFields.map((f) => f.id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Builder</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      {selectedServiceId && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add Field</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleAddField} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Field Label</label>
                  <input required value={form.fieldName}
                    onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                    placeholder="e.g. Full Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Field Type</label>
                  <select value={form.fieldType}
                    onChange={(e) => setForm({ ...form, fieldType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {NEEDS_OPTIONS.includes(form.fieldType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma separated)</label>
                  <input value={form.options}
                    onChange={(e) => setForm({ ...form, options: e.target.value })}
                    placeholder="Male, Female"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              )}

              {form.fieldType !== 'file' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder (optional)</label>
                  <input value={form.placeholder}
                    onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.required}
                  onChange={(e) => setForm({ ...form, required: e.target.checked })} />
                Required field
              </label>

              <button type="submit" disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {saving ? 'Adding...' : '+ Add Field'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <p className="p-6 text-gray-400">Loading...</p>
            ) : fields.length === 0 ? (
              <p className="p-6 text-gray-400">No fields yet — this service will show no form during booking.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {fields.map((field, index) => (
                  <li key={field.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {field.field_name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {field.field_type}{field.options ? ` — ${field.options.join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => moveField(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↑</button>
                      <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↓</button>
                      <button onClick={() => toggleRequired(field)} className="text-primary-600 text-sm font-medium">
                        {field.required ? 'Make optional' : 'Make required'}
                      </button>
                      <button onClick={() => handleDelete(field.id)} className="text-red-500 text-sm font-medium">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}