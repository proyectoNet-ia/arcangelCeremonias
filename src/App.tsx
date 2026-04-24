import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FloatingActions } from './components/common/FloatingActions';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { statsService } from './services/statsService';

// Resilient lazy loading to handle ChunkLoadError (common after redeploys)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

// Lazy loading of pages for performance optimization
const AdminLogin = lazyWithRetry(() => import('./pages/AdminLogin'));
const Admin = lazyWithRetry(() => import('./pages/Admin'));
const Home = lazyWithRetry(() => import('./pages/Home'));
const CatalogPage = lazyWithRetry(() => import('./pages/CatalogPage'));
const Catalog = lazyWithRetry(() => import('./pages/Catalog'));
const ProductDetail = lazyWithRetry(() => import('./pages/ProductDetail'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));

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

  // Si estamos cargando la configuración inicial, mostramos un preloader limpio
  // de esta forma evitamos el "pantallazo" del modo mantenimiento por defecto
  if (loading && !config) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // El modo mantenimiento solo es true si viene explícitamente así de la base de datos
  const isMaintenance = !!config?.maintenance_mode;

  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
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
                  <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
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
            isMaintenance
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
