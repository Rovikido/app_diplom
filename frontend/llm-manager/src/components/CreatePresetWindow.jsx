import React, { useEffect, useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPreset } from '@/api/presets';
import { fetchModels } from '@/api/models';


const CreatePresetWindow = ({ onClose, onCreated }) => {
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({
    public_name: '',
    bot_name: 'bot',
    task: '',
    costraints: '',
    model_id: 1,
    temperature: '1.2',
    repetition_penalty: '1',
    top_p: '0.9',
    top_k: '20',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchModels()
      .then((data) => {
        setModels(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, model_id: data[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateNumeric = (name, value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return `${name} must be a non-negative number`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};

    ['temperature', 'repetition_penalty', 'top_p', 'top_k'].forEach((field) => {
      const msg = validateNumeric(field, form[field]);
      if (msg) fieldErrors[field] = msg;
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      const payload = {
        ...form,
        model_id: parseInt(form.model_id),
        temperature: parseFloat(form.temperature),
        repetition_penalty: parseFloat(form.repetition_penalty),
        top_p: parseFloat(form.top_p),
        top_k: parseFloat(form.top_k),
      };

      console.log('Submitting preset:', JSON.stringify(payload, null, 2));
      await createPreset(payload);
      onClose();
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      alert('Failed to create preset');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 [will-change:transform] [transform:translateZ(0)]">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            Create New Preset
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-left">
          {[
            { label: 'Name', name: 'public_name', type: 'text' },
            { label: 'Bot Name', name: 'bot_name', type: 'text' },
            { label: 'Task', name: 'task', type: 'textarea' },
            { label: 'Constraints', name: 'costraints', type: 'textarea' },
          ].map(({ label, name, type }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-600">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              ) : (
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              )}
            </div>
          ))}

          {/* Model selector */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Model</label>
            <select
              name="model_id"
              value={form.model_id}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.model_name}
                </option>
              ))}
            </select>
          </div>

          {/* Numeric fields */}
          {[
            { label: 'Temperature', name: 'temperature' },
            { label: 'Repetition Penalty', name: 'repetition_penalty' },
            { label: 'Top P', name: 'top_p' },
            { label: 'Top K', name: 'top_k' },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-600">{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 ${
                  errors[name] ? 'border-red-400 ring-red-300' : 'border-gray-300 focus:ring-gray-400'
                }`}
              />
              {errors[name] && (
                <span className="text-xs text-red-500 mt-1">{errors[name]}</span>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
              ✓ Create Preset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePresetWindow;
