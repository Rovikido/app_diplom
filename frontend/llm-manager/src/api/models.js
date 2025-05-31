const BASE_URL = 'http://127.0.0.1:8000';


export const fetchModelById = async (id) => {
  const res = await fetch(`${BASE_URL}/models/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch model with ID ${id}`);
  return res.json();
};


export const fetchModels = async () => {
  const res = await fetch(`${BASE_URL}/models/`);
  if (!res.ok) throw new Error('Failed to fetch model list');
  return res.json();
};


export const deleteModel = async (id) => {
  const res = await fetch(`http://127.0.0.1:8000/models/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete model');
};


export const createModel = async (data) => {
  const res = await fetch('http://127.0.0.1:8000/models/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create model');
  return res.json();
};
