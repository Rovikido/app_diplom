import React, { useEffect, useState, useMemo } from 'react';
import { Box, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { fetchPresets as fetchRemotePresets, fetchModelById as fetchRemoteModelById } from '@/api/community';
import { createPreset } from '@/api/presets';
import { createModel, fetchModels } from '@/api/models';


const Card = ({ preset, modelName, onDownload }) => (
  <div className="relative rounded-xl max-w-xs bg-white p-4 shadow border border-gray-200 w-full h-full flex flex-col justify-between hover:bg-gray-200 transition">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDownload(preset);
      }}
      title="Download"
      className="absolute top-2 right-2 p-1 text-blue-600 hover:text-black hover:bg-blue-100 rounded"
    >
      <Download className="w-4 h-4" />
    </button>

    <div className="text-blue-600 font-semibold text-base">{preset.public_name}</div>
    <p className="text-sm text-gray-700 mt-2">
      {preset.task.length > 120 ? `${preset.task.slice(0, 120)}...` : preset.task}
    </p>
      <p className="text-sm text-blue-500 mt-4">
        <span className="inline-flex items-center gap-1">
          <Box className="w-3 h-3" /> Model: {modelName}
        </span>
      </p>
  </div>
);

const CommunityPresets = () => {
  const [presets, setPresets] = useState([]);
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);

  const loadPresets = async () => {
    try {
      const data = await fetchRemotePresets();
      const modelMap = {};

      await Promise.all(
        data.map(async (preset) => {
          if (!modelMap[preset.model_id]) {
            const model = await fetchRemoteModelById(preset.model_id);
            modelMap[preset.model_id] = model.model_name;
          }
        })
      );

      setPresets(data);
      setModels(modelMap);
    } catch (err) {
      console.error('Failed to load community presets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);


const handleDownload = async (preset) => {
  try {
    const remoteModel = await fetchRemoteModelById(preset.model_id);

    const localModels = await fetchModels();

    const alreadyExists = localModels.some(
      (m) =>
        m.model_name === remoteModel.model_name &&
        m.huggin_face_refference === remoteModel.huggin_face_refference
    );

    let targetModelId;

    if (alreadyExists) {
      const existing = localModels.find(
        (m) =>
          m.model_name === remoteModel.model_name &&
          m.huggin_face_refference === remoteModel.huggin_face_refference
      );
      targetModelId = existing.id;
    } else {
      const createdModel = await createModel(remoteModel);
      targetModelId = createdModel.id;
    }

    await createPreset({ ...preset, model_id: targetModelId });

    alert(`Preset "${preset.public_name}" downloaded.`);
  } catch (err) {
    console.error('Failed to download preset:', err);
    alert('Failed to download preset.');
  }
};


  const extendedPresets = useMemo(() => {
    return presets.map((p) => ({
      ...p,
      modelName: models[p.model_id] || 'Unknown',
    }));
  }, [presets, models]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-blue-100">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-blue-100 pr-4">
        <div className="px-4 py-4 text-lg font-semibold text-blue-700">
          🌐 Community Presets
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
           <div className="grid auto-rows-max grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(250px,300px))] justify-start gap-4">
              {extendedPresets.map((preset) => (
                <Card
                  key={preset.id}
                  preset={preset}
                  modelName={preset.modelName}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CommunityPresets;
