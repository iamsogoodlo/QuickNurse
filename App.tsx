
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import NurseDashboardPage from './pages/NurseDashboardPage';
import NurseSettingsPage from './pages/NurseSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { userType } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        <Route 
          path="/patient/dashboard" 
          element={
            <ProtectedRoute userType="patient">
              <PatientDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRoute userType="nurse">
              <NurseDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/settings"
          element={
            <ProtectedRoute userType="nurse">
              <NurseSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users from landing/auth to their dashboards */}
        {userType === 'patient' && <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />}
        {userType === 'patient' && <Route path="/auth" element={<Navigate to="/patient/dashboard" replace />} />}
        {userType === 'nurse' && <Route path="/" element={<Navigate to="/nurse/dashboard" replace />} />}
        {userType === 'nurse' && <Route path="/auth" element={<Navigate to="/nurse/dashboard" replace />} />}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
