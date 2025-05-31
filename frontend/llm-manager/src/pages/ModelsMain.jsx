import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { fetchModels, deleteModel } from '@/api/models';
import CreateModelWindow from '@/components/CreateModelWindow';

const ModelsMain = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModel, setShowCreateModel] = useState(false);

  const loadModels = async () => {
    try {
      const data = await fetchModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteModel(id);
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete model', err);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-blue-100">
      <Sidebar />

      <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-blue-100 pr-4">
        <div className="flex justify-between items-center px-4 py-4">
          <h1 className="text-lg font-semibold text-blue-800">Models</h1>
          <Button
            onClick={() => setShowCreateModel(true)}
            className="rounded-full bg-blue-500 text-white hover:bg-blue-600 mr-6"
          >
            + Add New Model
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? (
            <p className="text-center text-gray-500">Loading models...</p>
          ) : models.length === 0 ? (
            <p className="text-center text-gray-500">No models available.</p>
          ) : (
            models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-800 font-medium">{model.model_name}</span>
                  <span className="text-gray-500 text-xs">({model.size})</span>
                </div>
                <Button
                  onClick={() => handleDelete(model.id)}
                  variant="ghost"
                  className="hover:bg-red-100 text-red-500 hover:text-red-700 p-2 rounded-full"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Footer />
      </div>

      {showCreateModel && (
        <CreateModelWindow
          onClose={() => setShowCreateModel(false)}
          onCreated={loadModels}
        />
      )}
    </div>
  );
};

export default ModelsMain;
