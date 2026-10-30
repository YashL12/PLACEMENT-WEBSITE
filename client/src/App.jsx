import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';

// ── Eagerly loaded admin/auth pages ──────────────────────────────────────────
import { AdminLoginPage }      from './pages/AdminLoginPage';
import { AdminDashboardPage }  from './pages/AdminDashboardPage';
import { AdminCompanyEditPage } from './pages/AdminCompanyEditPage';

// ── Lazily loaded student pages ───────────────────────────────────────────────
const PracticePage         = lazy(() => import('./pages/PracticePage').then(m => ({ default: m.PracticePage })));
const DSAPracticePage      = lazy(() => import('./pages/DSAPracticePage').then(m => ({ default: m.DSAPracticePage })));
const SQLPracticePage      = lazy(() => import('./pages/SQLPracticePage').then(m => ({ default: m.SQLPracticePage })));
const CodingWorkspacePage  = lazy(() => import('./pages/CodingWorkspacePage').then(m => ({ default: m.CodingWorkspacePage })));
const CompaniesPage        = lazy(() => import('./pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })));
const CompanyDetailPage    = lazy(() => import('./pages/CompanyDetailPage').then(m => ({ default: m.CompanyDetailPage })));
const LearningMaterialPage = lazy(() => import('./pages/LearningMaterialPage').then(m => ({ default: m.LearningMaterialPage })));
const AlumniPage           = lazy(() => import('./pages/AlumniPage').then(m => ({ default: m.AlumniPage })));
const HomePage             = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// ── Protected admin route ─────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageFallback />;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

// ── Page loading fallback ─────────────────────────────────────────────────────
const PageFallback = () => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
    <LoadingSpinner message="Loading..." />
  </div>
);

// ── Legacy coding-practice slug redirect ──────────────────────────────────────
const LegacySlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/practice/${slug}`} replace />;
};

// ── App shell ─────────────────────────────────────────────────────────────────
const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }} className="page-fade-in" key={location.pathname}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/admin/login"               element={<AdminLoginPage />} />
            <Route path="/admin/dashboard"           element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/companies/new"       element={<ProtectedRoute><AdminCompanyEditPage /></ProtectedRoute>} />
            <Route path="/admin/companies/:id/edit"  element={<ProtectedRoute><AdminCompanyEditPage /></ProtectedRoute>} />
            <Route path="*"                          element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main style={{ flex: 1 }} className="page-fade-in" key={location.pathname}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ── Home ── */}
            <Route path="/"               element={<HomePage />} />
            <Route path="/home"           element={<Navigate to="/" replace />} />

            {/* ── Practice Hub ── */}
            <Route path="/practice"       element={<PracticePage />} />

            {/* ── DSA Practice (dedicated route) ── */}
            <Route path="/practice/dsa"   element={<DSAPracticePage />} />

            {/* ── SQL Practice (dedicated route) ── */}
            <Route path="/practice/sql"   element={<SQLPracticePage />} />

            {/* ── Individual Question (must come after /dsa and /sql) ── */}
            <Route path="/practice/:slug" element={<CodingWorkspacePage />} />

            {/* ── Legacy redirects ── */}
            <Route path="/coding-practice"        element={<Navigate to="/practice" replace />} />
            <Route path="/coding-practice/:slug"  element={<LegacySlugRedirect />} />
            <Route path="/sql-practice"           element={<Navigate to="/practice/sql" replace />} />
            <Route path="/sql-practice/:slug"     element={<LegacySlugRedirect />} />

            {/* ── Explore ── */}
            <Route path="/companies"             element={<CompaniesPage />} />
            <Route path="/companies/:id"         element={<CompanyDetailPage />} />
            <Route path="/learning-material"     element={<LearningMaterialPage />} />
            <Route path="/alumni"                element={<AlumniPage />} />

            {/* ── Removed features → redirect ── */}
            <Route path="/dashboard"     element={<Navigate to="/" replace />} />
            <Route path="/question-bank" element={<Navigate to="/practice" replace />} />
            <Route path="/bookmarks"     element={<Navigate to="/" replace />} />
            <Route path="/progress"      element={<Navigate to="/" replace />} />
            <Route path="/study-plan"    element={<Navigate to="/" replace />} />
            <Route path="/settings"      element={<Navigate to="/" replace />} />

            {/* ── 404 ── */}
            <Route path="*"              element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

// ── Root app ──────────────────────────────────────────────────────────────────
export const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;