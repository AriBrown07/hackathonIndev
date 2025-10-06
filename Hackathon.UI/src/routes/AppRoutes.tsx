import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';
import FacePage from '../pages/FacePage/FacePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/main" element={<FacePage />} />

    </Routes>
  );
};