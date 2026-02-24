import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { Toaster } from 'react-hot-toast';
import { FloatingActions } from './components/common/FloatingActions';
import { ConfigProvider } from './context/ConfigContext';

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:slug" element={<ProductDetail />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <FloatingActions />
      </Router>
    </ConfigProvider>
  );
};

export default App;
