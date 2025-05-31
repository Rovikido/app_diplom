import React, { useEffect, useState } from 'react';
import { X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePreset, deletePreset } from '@/api/presets';
import { fetchModels } from '@/api/models';

const EditPresetWindow = ({ preset, onClose, onUpdated }) => {
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({
    public_name: preset.public_name || '',
    bot_name: preset.bot_name || '',
    task: preset.task || '',
    costraints: preset.costraints || '',
    model_id: preset.model_id || 0,
    temperature: String(preset.temperature ?? '1.2'),
    repetition_penalty: String(preset.repetition_penalty ?? '1'),
    top_p: String(preset.top_p ?? '0.9'),
    top_k: String(preset.top_k ?? '20'),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchModels().then(setModels).catch(console.error);
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

    const payload = {
      ...form,
      model_id: parseInt(form.model_id),
      temperature: parseFloat(form.temperature),
      repetition_penalty: parseFloat(form.repetition_penalty),
      top_p: parseFloat(form.top_p),
      top_k: parseFloat(form.top_k),
    };

    try {
      await updatePreset(preset.id, payload);
      onClose();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert('Failed to update preset');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePreset(preset.id);
      onClose();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert('Failed to delete preset');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            Edit Preset
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                ✓ Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPresetWindow;
