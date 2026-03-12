import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FloatingActions } from './components/common/FloatingActions';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { statsService } from './services/statsService';

// Lazy loading of pages for performance optimization
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Home = React.lazy(() => import('./pages/Home'));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));

// Component to handle scroll to top on route change and track page views
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Track internal page views (for the custom admin dashboard)
    statsService.trackPageView(pathname);
  }, [pathname]);

  return null;
};

// Separate routes to consume context safely
const AppRoutes = () => {
  const { config, loading } = useConfig();

  // El modo mantenimiento es true por defecto solo si NO tenemos config cargada aún
  // Si ya tenemos config, respetamos el valor de la base de datos
  const isMaintenance = config ? config.maintenance_mode : true;

  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScrollToTop />
      <Routes>
        {/* 1. Acceso Administrador: SIEMPRE DISPONIBLE (Nunca se bloquea) */}
        <Route path="/admin/login" element={
          <React.Suspense fallback={<div className="h-screen bg-white" />}>
            <AdminLogin />
          </React.Suspense>
        } />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={
                <div className="h-screen flex items-center justify-center bg-slate-50">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <Admin />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        {/* 2. Ruta de Previsualización: Siempre accesible para que el cliente capture productos */}
        <Route path="/inicio" element={<CatalogPage />} />

        {/* 3. Ruta Principal (Dominio base) */}
        <Route
          path="/"
          element={
            (loading && !config) || isMaintenance
              ? <Home />
              : <CatalogPage />
          }
        />

        {/* 4. Rutas Públicas: Se redirigen al Home (Under Construction) si el mantenimiento está ON */}
        <Route
          path="/catalogo"
          element={!loading && isMaintenance ? <Navigate to="/" replace /> : <Catalog />}
        />
        <Route
          path="/producto/:slug"
          element={!loading && isMaintenance ? <Navigate to="/" replace /> : <ProductDetail />}
        />
        <Route
          path="/nosotros"
          element={!loading && isMaintenance ? <Navigate to="/" replace /> : <About />}
        />
        <Route
          path="/contacto"
          element={!loading && isMaintenance ? <Navigate to="/" replace /> : <Contact />}
        />

        {/* Fallback general */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingActions />
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#3E2723',
                borderRadius: '0px',
                border: '1px solid #C5A05920',
                boxShadow: '0 10px 30px -10px rgba(62, 39, 35, 0.15)',
                padding: '16px 24px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                maxWidth: '400px'
              },
              success: {
                iconTheme: {
                  primary: '#C5A059',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid #ef444420',
                }
              }
            }}
          />
          <AppRoutes />
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;
