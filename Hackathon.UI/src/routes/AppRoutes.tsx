import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';
import Diagnostics from '../pages/Diagnostics/Diagnostics';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/diagnostics" element={<Diagnostics />} />

    </Routes>
  );
};