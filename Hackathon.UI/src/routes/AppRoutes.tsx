import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

    </Routes>
  );
};