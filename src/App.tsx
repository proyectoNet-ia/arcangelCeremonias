import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FloatingActions } from './components/common/FloatingActions';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
          <ScrollToTop />
          <Routes>
            {/* SITIO PÚBLICO: Home completo con Slider y Productos */}
            <Route path="/" element={<CatalogPage />} />

            {/* MODO BLOQUEO: Mantener la pantalla de próximamente accesible si se requiere */}
            <Route path="/proximamente" element={<Home />} />

            {/* Rutas de navegación */}
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/contacto" element={<Contact />} />

            {/* Acceso Administrador */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingActions />
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;
