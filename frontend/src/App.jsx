import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import ScrollTopButton from './components/ScrollTopButton.jsx';
import Home from './pages/Home.jsx';
import BrandPage from './pages/BrandPage.jsx';
import Join from './pages/Join.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';

// El panel se descarga solo cuando un administrador lo abre
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Esperar a que la página pinte antes de ir a la sección
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main id="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unete" element={<Join />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="page-loading" />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="/:slug" element={<BrandPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <WhatsAppButton />
          <ScrollTopButton />
        </>
      )}
    </>
  );
}
