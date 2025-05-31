import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createModel } from '@/api/models';

const CreateModelWindow = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    model_name: '',
    huggin_face_refference: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createModel(form);
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create model');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-md max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            Add New Model
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-left">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Model Name</label>
            <input
              type="text"
              name="model_name"
              placeholder="Model Name"
              value={form.model_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">HuggingFace Link</label>
            <input
              type="text"
              name="huggin_face_refference"
              placeholder="e.g. meta-llama/Llama-2-7b"
              value={form.huggin_face_refference}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
              ✓ Create Model
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModelWindow;
