import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Presets from '@/pages/PresetsMain';
import ModelsMain from '@/pages/ModelsMain';
import PresetChat from '@/pages/PresetChat'
import CommunityPresets from '@/pages/CommunityPresets';;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Presets />} />
      <Route path='/home' element={<Presets />} />
      <Route path="/models" element={<ModelsMain />} />
      <Route path="/community" element={<CommunityPresets />} />
      <Route path="/chat/:presetId" element={<PresetChat />} />
    </Routes>
  );
};

export default AppRoutes;
