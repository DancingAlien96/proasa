import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { BrandArt } from '../components/Illustrations.jsx';
import { Reveal, CountUp } from '../components/Reveal.jsx';
import NotFound from './NotFound.jsx';
import { useApi } from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const PILLAR_ICONS = [
  // Experiencia
  <path key="a" d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />,
  // Estrategias comprobadas
  <path key="b" d="M4 12.5l5 5L20 6.5" />,
  // Soporte
  <path key="c" d="M4 14v-2a8 8 0 0116 0v2M4 14a2 2 0 002 2h1v-5H6a2 2 0 00-2 2zm16 0a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2zM17 16v1a3 3 0 01-3 3h-2" />,
];

export default function BrandPage() {
  const { slug } = useParams();
  const { data: brand, error, loading } = useApi(`/brands/${encodeURIComponent(slug)}`);
  const { data: brands } = useApi('/brands');
  usePageTitle(brand?.name);

  if (error?.status === 404) return <NotFound />;
  if (loading) return <div className="page-loading" aria-busy="true" />;
  if (error) {
    return (
      <div className="container section">
        <p className="muted">No se pudo cargar la información. Intenta de nuevo más tarde.</p>
      </div>
    );
  }

  const other = brands?.find((b) => b.slug !== brand.slug);

  return (
    <div className="brand-page" style={{ '--accent-brand': brand.accent }}>
      <PageHero
        eyebrow={brand.tagline}
        title={brand.name}
        lead={brand.company_name}
        accent={brand.accent}
        art={<BrandArt slug={brand.slug} className="page-hero-svg" />}
      >
        {brand.documents.length > 0 && (
          <div className="hero-actions">
            <a href="#fichas" className="btn btn-primary">Ver fichas técnicas</a>
            <Link to="/unete" className="btn btn-ghost">Distribuir {brand.name} →</Link>
          </div>
        )}
      </PageHero>

      {brand.stats.length > 0 && (
        <div className="container">
          <dl className="stat-strip">
            {brand.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <dt><CountUp value={s.value} /></dt>
                <dd>{s.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      )}

      <section className="section">
        <div className="container brand-intro">
          <Reveal>
            <p className="eyebrow">Conoce más sobre {brand.name}</p>
            <p className="brand-lead">{brand.intro_lead}</p>
          </Reveal>
          <Reveal className="brand-body" delay={100}>
            {brand.intro_body.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="pillars">
            {brand.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} className="pillar-card" delay={i * 100}>
                <span className="pillar-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {PILLAR_ICONS[i % PILLAR_ICONS.length]}
                  </svg>
                </span>
                <h3>{pillar.title}</h3>
                {pillar.list ? (
                  <ul className="dash-list">
                    {pillar.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                ) : (
                  pillar.items.map((item, j) => <p key={j}>{item}</p>)
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {brand.quote && (
        <section className="quote-band">
          <div className="container">
            <Reveal as="blockquote">
              <span className="quote-mark" aria-hidden="true">“</span>
              <p>{brand.quote}</p>
              <footer>— {brand.company_name}</footer>
            </Reveal>
          </div>
        </section>
      )}

      {brand.mission && (
        <section className="section">
          <div className="container mission">
            <Reveal>
              <p className="eyebrow">Misión de {brand.name}</p>
              <p className="mission-text">{brand.mission}</p>
            </Reveal>
          </div>
        </section>
      )}

      {brand.documents.length > 0 && (
        <section className="section section-soft" id="fichas">
          <div className="container">
            <Reveal className="section-head section-head-left">
              <p className="eyebrow">Descargas</p>
              <h2 className="h2">Fichas técnicas</h2>
            </Reveal>
            <div className="doc-list">
              {brand.documents.map((d, i) => (
                <Reveal key={d.url} delay={i * 80}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="doc-card">
                    <span className="doc-icon" aria-hidden="true">PDF</span>
                    <span className="doc-title">
                      {d.title}
                      <small>{brand.name} · abre en Google Drive</small>
                    </span>
                    <span className="doc-arrow" aria-hidden="true">↗</span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {other && (
        <section className="section">
          <div className="container">
            <Link to={`/${other.slug}`} className="next-brand" style={{ '--accent-brand': other.accent }}>
              <span className="eyebrow">Siguiente marca</span>
              <span className="next-brand-name">{other.name} →</span>
              <span className="muted">{other.tagline}</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
