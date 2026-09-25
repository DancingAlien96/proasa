import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Página no encontrada');
  return (
    <PageHero
      eyebrow="Error 404"
      title="Esta página se filtró"
      lead="La página que buscas no existe o fue movida."
    >
      <div className="hero-actions">
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    </PageHero>
  );
}
