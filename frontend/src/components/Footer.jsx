import { Link } from 'react-router-dom';
import { useApi } from '../lib/api.js';
import { useSettings } from '../lib/settings.jsx';

export default function Footer() {
  const { data: brands } = useApi('/brands');
  const { phone, email, address, whatsapp } = useSettings();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cta">
          <h2>
            ¿Hablamos de tu <em>proyecto</em>?
          </h2>
          <p>Consultoría técnica gratuita para elegir el sistema ideal para tu industria o cultivo.</p>
          <div className="footer-cta-actions">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Escríbenos por WhatsApp
            </a>
            <a href={`mailto:${email}`} className="btn btn-ghost">{email}</a>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <img src="/images/logo.png" alt="PROASA" width="105" height="44" className="footer-logo" />
            <p className="footer-tagline">
              Empresa guatemalteca especializada en soluciones de filtración de agua para la industria y la
              agricultura.
            </p>
          </div>
          <nav aria-label="Pie de página">
            <h3 className="footer-title">Explora</h3>
            <Link to="/">Inicio</Link>
            <Link to="/#soluciones">Soluciones</Link>
            <Link to="/#industrias">Industrias</Link>
            <Link to="/proyectos">Proyectos</Link>
            <Link to="/unete">Sé distribuidor</Link>
          </nav>
          <nav aria-label="Marcas">
            <h3 className="footer-title">Marcas</h3>
            {brands?.map((b) => (
              <Link key={b.slug} to={`/${b.slug}`}>{b.name}</Link>
            ))}
          </nav>
          <address>
            <h3 className="footer-title">Contacto</h3>
            <a href={`tel:+502${phone.replace(/\s/g, '')}`}>+502 {phone}</a>
            <a href={`mailto:${email}`}>{email}</a>
            <span>{address}</span>
          </address>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PROASA · proasa.com.gt</span>
          <span>Hecho con orgullo en Guatemala</span>
        </div>
      </div>
    </footer>
  );
}
