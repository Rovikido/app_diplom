const BASE_URL = 'http://127.0.0.1:8000';


export const fetchPresets = async () => {
  const res = await fetch(`${BASE_URL}/presets/`);
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
};


export const createPreset = async (presetData) => {
  const res = await fetch(`${BASE_URL}/presets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presetData),
  });
  if (!res.ok) throw new Error('Failed to create preset');
  return res.json();
};


export const updatePreset = async (id, data) => {
  const res = await fetch(`${BASE_URL}/presets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update preset');
  return res.json();
};


export const deletePreset = async (id) => {
  const res = await fetch(`${BASE_URL}/presets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete preset');
  return true;
};
