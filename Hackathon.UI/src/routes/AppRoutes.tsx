import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';
import FacePage from '../pages/FacePage/FacePage';
import Authorization from '../pages/Authorization/Authorization';
import Coupons from '../pages/Coupons/Coupons';
import Questionnaire from '../pages/Questionnaire/Questionnaire';


const handleAuthSuccess = () => {
  console.log("Авторизация прошла успешно!");
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/main" element={<FacePage />} />
      <Route path="/Authorization" element={<Authorization onAuthSuccess={handleAuthSuccess} />} />
      <Route path="/Coupons" element={<Coupons />} />
      <Route path="/Questionnaire" element={<Questionnaire />} />
      
    </Routes>
  );
};