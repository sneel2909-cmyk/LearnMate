/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Assessment = lazy(() => import('./pages/Assessment'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Lesson = lazy(() => import('./pages/Lesson'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center font-sans">Loading LearnMate...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/role-selection" replace />} />
          <Route path="/auth/role-selection" element={<RoleSelection />} />
          <Route path="/auth/register/*" element={<Onboarding />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/assessment/*" element={<Assessment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
