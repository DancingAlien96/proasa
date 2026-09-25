import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useApi } from '../lib/api.js';

export default function Header() {
  const { data: brands } = useApi('/brands');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setBrandsOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
  }, [open]);

  const brandActive = brands?.some((b) => pathname === `/${b.slug}`);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a className="skip-link" href="#content">Ir al contenido</a>
      <div className="header-bar">
        <Link to="/" className="logo" aria-label="PROASA, inicio">
          <img src="/images/logo.png" alt="PROASA" width="105" height="44" />
        </Link>

        <nav id="main-nav" className="main-nav" aria-label="Principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/proyectos">Proyectos</NavLink>
          <NavLink to="/unete">Sé distribuidor</NavLink>
          <div
            className={`dropdown${brandsOpen ? ' is-open' : ''}`}
            onMouseEnter={() => setBrandsOpen(true)}
            onMouseLeave={() => setBrandsOpen(false)}
          >
            <button
              className={`dropdown-toggle${brandActive ? ' active' : ''}`}
              aria-expanded={brandsOpen}
              onClick={() => setBrandsOpen((o) => !o)}
            >
              Marcas
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <div className="dropdown-menu">
              {brands?.map((b) => (
                <NavLink key={b.slug} to={`/${b.slug}`} style={{ '--accent-brand': b.accent }}>
                  <span className="dropdown-dot" aria-hidden="true" />
                  <span>
                    <strong>{b.name}</strong>
                    <small>{b.tagline}</small>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
          <Link to="/#soluciones">Soluciones</Link>
        </nav>

        <Link to="/unete" className="btn btn-primary header-cta">
          Únete a la red
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menú</span>
          <span className="burger" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
