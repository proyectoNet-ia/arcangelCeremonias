import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FloatingActions } from './components/common/FloatingActions';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import { statsService } from './services/statsService';

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

  // Si loading es true, o maintenance_mode no es estrictamente false, estamos en mantenimiento
  const isMaintenance = config?.maintenance_mode !== false;

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 1. Acceso Administrador: SIEMPRE DISPONIBLE (Nunca se bloquea) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* 2. Ruta de Previsualización: Siempre accesible para que el cliente capture productos */}
        <Route path="/inicio" element={<CatalogPage />} />

        {/* 3. Ruta Principal (Dominio base) */}
        <Route
          path="/"
          element={
            loading || isMaintenance
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
    </>
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
