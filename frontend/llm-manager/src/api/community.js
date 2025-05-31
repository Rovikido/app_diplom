const BASE_URL = 'http://127.0.0.1:8001';


export const fetchPresets = async () => {
  const res = await fetch(`${BASE_URL}/presets/`);
  if (!res.ok) throw new Error('Failed to fetch community presets');
  return res.json();
};


export const fetchModelById = async (id) => {
  const res = await fetch(`${BASE_URL}/models/${id}`);
  if (!res.ok) throw new Error('Failed to fetch model');
  return res.json();
};


export const checkModelExists = async (id) => {
  const res = await fetch(`${BASE_URL}/models/${id}`);
  return res.ok;
};


export const uploadModel = async (model) => {
  const res = await fetch(`${BASE_URL}/models/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_name: model.model_name,
      huggin_face_refference: model.huggin_face_refference,
      size: model.size,
    }),
  });

  if (!res.ok) {
    throw new Error('Model upload failed');
  }

  return res.json();
};


export const uploadPreset = async (preset) => {
  const res = await fetch(`${BASE_URL}/presets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  });

  if (!res.ok) {
    throw new Error('Preset upload failed');
  }

  return res.json();
};


export const uploadPresetWithModel = async (preset, model) => {
  let targetModelId = model.id;

  const modelExists = await checkModelExists(model.id);
  if (!modelExists) {
    const createdModel = await uploadModel(model);
    targetModelId = createdModel.id;
  }

  const updatedPreset = {
    ...preset,
    model_id: targetModelId,
  };

  await uploadPreset(updatedPreset);
};

