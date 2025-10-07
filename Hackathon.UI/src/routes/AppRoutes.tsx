import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';
import FacePage from '../pages/FacePage/FacePage';
import Diagnostics from '../pages/Diagnostics/Diagnostics';
import Authorization from '../pages/Authorization/Authorization';

const handleAuthSuccess = () => {
    console.log("Авторизация прошла успешно!");
    // например, редирект на другую страницу:
    // navigate("/dashboard");
  };

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/main" element={<FacePage />} />
        <Route path="/Diagnostics" element={<Diagnostics />} />
        <Route path="/Authorization" element={<Authorization onAuthSuccess={handleAuthSuccess}  />} />

    </Routes>
  );
};