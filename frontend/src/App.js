import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './i18n';
import './App.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import AuthPage from './components/pages/AuthPage';
import DashboardPage from './components/pages/DashboardPage';
import StrategyPage from './components/pages/StrategyPage';
import ChartsPage from './components/pages/ChartsPage';
import PsychologyPage from './components/pages/PsychologyPage';
import JournalPage from './components/pages/JournalPage';
import CommunityPage from './components/pages/CommunityPage';
import AIPage from './components/pages/AIPage';
import MonteCarloPage from './components/pages/MonteCarloPage';
import StatisticsPage from './components/pages/StatisticsPage';
import AscensionPage from './components/pages/AscensionPage';
import SettingsPage from './components/pages/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="strategy" element={<StrategyPage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="psychology" element={<PsychologyPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="montecarlo" element={<MonteCarloPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="ascension" element={<AscensionPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right" 
            richColors 
            theme="dark"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
