import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { LearningMaterialPage } from './pages/LearningMaterialPage';
import { AlumniPage } from './pages/AlumniPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCompanyEditPage } from './pages/AdminCompanyEditPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoadingSpinner } from './components/LoadingSpinner';

// Protected Route Component for Admin pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Verifying administrative access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Student-facing public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route path="/learning-material" element={<LearningMaterialPage />} />
            <Route path="/alumni" element={<AlumniPage />} />

            {/* Admin authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/new"
              element={
                <ProtectedRoute>
                  <AdminCompanyEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminCompanyEditPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
