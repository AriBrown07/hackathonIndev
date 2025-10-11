import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage/HomePage';
import FacePage from '../pages/FacePage/FacePage';
import Authorization from '../pages/Authorization/Authorization';
import Coupons from '../pages/Coupons/Coupons';
import Questionnaire from '../pages/Questionnaire/Questionnaire';
import Profile from '../pages/Profile/Profile';
import ProtectedRoute from '../pages/Authorization/components/ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import Ticket from '../pages/Ticket/Ticket';
import MedicalExamination from '../pages/medicalExamination/MedicalExamination';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/main" element={<FacePage />} />
      <Route path="/authorization" element={<Authorization onAuthSuccess={() => {}} />} />

      <Route 
        path="/coupons" 
        element={
          <ProtectedRoute>
            <Coupons />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/questionnaire" 
        element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/ticket" 
        element={
          <ProtectedRoute>
            <Ticket />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/medicalExamination" 
        element={
          <ProtectedRoute>
            <MedicalExamination />
          </ProtectedRoute>
        } 
      />
      {/* Перенаправление с корня на главную страницу */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};