import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ChevronUp, Settings, CloudUpload, Text } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import CreatePresetWindow from '@/components/CreatePresetWindow';
import EditPresetWindow from '@/components/EditPresetWindow';
import { fetchPresets } from '@/api/presets';
import { fetchModelById } from '@/api/models';
import { uploadPresetWithModel } from '@/api/community';




const Card = ({ id, name, task, modelName, onEdit, onUpload }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative cursor-pointer max-w-xs rounded-xl bg-white p-4 shadow border border-gray-200 w-full h-full flex flex-col justify-between hover:shadow-md hover:bg-gray-200 transition"
      onClick={() => navigate(`/chat/${id}`)}
    >
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(id);
          }}
          className="text-blue-600 hover:text-black p-1 hover:bg-blue-100 rounded"
          title="Edit"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpload(id);
          }}
          className="text-blue-600 hover:text-black p-1 hover:bg-blue-100 rounded"
          title="Upload"
        >
          <CloudUpload className="w-4 h-4" />
        </button>
      </div>

      <div className="text-blue-600 font-semibold text-base">{name}</div>
      <p className="text-sm text-gray-700 mt-2">
        {task.length > 120 ? `${task.slice(0, 120)}...` : task}
      </p>
      <p className="text-sm text-blue-500 mt-4">
        <span className="inline-flex items-center gap-1">
          <Box className="w-3 h-3" /> Model: {modelName}
        </span>
      </p>
    </div>
  );
};

const PresetsMain = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [editPreset, setEditPreset] = useState(null);
  const [presets, setPresets] = useState([]);
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const loadData = async () => {
    try {
      const presetsData = await fetchPresets();
      const modelsMap = {};
      await Promise.all(
        presetsData.map(async (preset) => {
          if (!modelsMap[preset.model_id]) {
            const model = await fetchModelById(preset.model_id);
            modelsMap[preset.model_id] = model.model_name;
          }
        })
      );
      setPresets(presetsData);
      setModels(modelsMap);
    } catch (err) {
      console.error('Failed to fetch presets or models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleUpload = async (id) => {
  const preset = presets.find((p) => p.id === id);
  const model = models[preset.model_id]; // We only stored model name, not full object

  if (!preset || !model) {
    alert('Missing preset or model data');
    return;
  }

  try {
    const fullModel = await fetchModelById(preset.model_id);
    await uploadPresetWithModel(preset, fullModel);
    alert(`Uploaded "${preset.public_name}" and model.`);
  } catch (err) {
    console.error(err);
    alert('Upload failed.');
  }
};



  const sortedPresets = useMemo(() => {
    const extended = presets.map((p) => ({
      ...p,
      modelName: models[p.model_id] || 'Unknown',
    }));

    const key = sortKey === 'name' ? 'public_name' : 'modelName';

    return [...extended].sort((a, b) => {
      const valA = a[key]?.toLowerCase() ?? '';
      const valB = b[key]?.toLowerCase() ?? '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [presets, models, sortKey, sortAsc]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-blue-100">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-blue-100 pr-4">
        <div className="flex justify-between items-center px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSortAsc((prev) => !prev)}
              variant="outline"
              className="rounded-full"
              title={sortAsc ? 'Ascending' : 'Descending'}
            >
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-200 ${
                  sortAsc ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </Button>

            <div className="relative">
              <Button
                onClick={() => setShowSortMenu((prev) => !prev)}
                variant="outline"
                className="rounded-full text-blue-600 border border-blue-300"
              >
                <Text className="w-4 h-4 mr-1" />
                  Sort by: {sortKey === 'name' ? 'Name' : 'Model'}
              </Button>
              {showSortMenu && (
                <div className="absolute mt-1 bg-white border border-gray-300 rounded shadow text-sm w-32 z-10">
                  <div
                    onClick={() => {
                      setSortKey('name');
                      setShowSortMenu(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-200 cursor-pointer"
                  >
                    Name
                  </div>
                  <div
                    onClick={() => {
                      setSortKey('model');
                      setShowSortMenu(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-200 cursor-pointer"
                  >
                    Model
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-blue-500 text-white hover:bg-blue-600 mr-6"
          >
            + Add New Preset
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading presets...</p>
          ) : (
           <div className="grid auto-rows-max grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(250px,300px))] justify-start gap-4">
              {sortedPresets.map((preset) => (
                <Card
                  key={preset.id}
                  id={preset.id}
                  name={preset.public_name}
                  task={preset.task}
                  modelName={preset.modelName}
                  onEdit={(id) => {
                    const full = presets.find(p => p.id === id);
                    setEditPreset(full);
                  }}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {showCreate && (
        <CreatePresetWindow
          onClose={() => setShowCreate(false)}
          onCreated={loadData}
        />
      )}
      {editPreset && (
        <EditPresetWindow
          preset={editPreset}
          onClose={() => setEditPreset(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
};

export default PresetsMain;
