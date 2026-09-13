export default function DynamicForm({ fields, values, onChange, fileValues, onFileChange }) {
  const handleTextChange = (fieldId, value) => {
    onChange({ ...values, [`field_${fieldId}`]: value });
  };

  const handleFileChange = (fieldId, file) => {
    onFileChange({ ...fileValues, [`field_${fieldId}`]: file });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const key = `field_${field.id}`;

        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.field_name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.field_type === 'textarea' && (
              <textarea
                required={field.required}
                placeholder={field.placeholder || ''}
                value={values[key] || ''}
                onChange={(e) => handleTextChange(field.id, e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            )}

            {['text', 'number', 'email', 'phone', 'date'].includes(field.field_type) && (
              <input
                type={field.field_type === 'phone' ? 'tel' : field.field_type}
                required={field.required}
                placeholder={field.placeholder || ''}
                value={values[key] || ''}
                onChange={(e) => handleTextChange(field.id, e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            )}

            {field.field_type === 'dropdown' && (
              <select
                required={field.required}
                value={values[key] || ''}
                onChange={(e) => handleTextChange(field.id, e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}

            {field.field_type === 'radio' && (
              <div className="flex gap-4">
                {field.options?.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name={key}
                      required={field.required}
                      checked={values[key] === opt}
                      onChange={() => handleTextChange(field.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.field_type === 'checkbox' && (
              <div className="flex flex-wrap gap-4">
                {field.options?.map((opt) => {
                  const selected = (values[key] || '').split(',').filter(Boolean);
                  const isChecked = selected.includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const next = isChecked ? selected.filter((o) => o !== opt) : [...selected, opt];
                          handleTextChange(field.id, next.join(','));
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {field.field_type === 'file' && (
              <input
                type="file"
                required={field.required}
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                className="w-full text-sm text-gray-600"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}