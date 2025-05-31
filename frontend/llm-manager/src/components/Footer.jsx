import React, { useEffect, useState } from 'react';


const Footer = () => {
  const [modelName, setModelName] = useState(null);

  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/inference/current_model');
        const data = await res.json();
        if (data?.model_name) {
          setModelName(data.model_name);
        } else {
          setModelName(null);
        }
      } catch {
        setModelName(null);
      }
    };

    fetchCurrentModel();
  }, []);

  return (
    <div className="w-full px-4 py-2 text-sm text-right text-gray-500 bg-blue-50 border-t">
      Loaded model:{' '}
      <span className="text-blue-600">
        {modelName ? modelName : 'None'}
      </span>
    </div>
  );
};

export default Footer;
