import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { IndustryScene } from '../components/Illustrations.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { useApi } from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

export default function Projects() {
  usePageTitle('Proyectos');
  const { data: projects, error, loading } = useApi('/projects');
  const [sector, setSector] = useState('Todos');

  const sectors = useMemo(
    () => ['Todos', ...new Set((projects ?? []).map((p) => p.sector).filter(Boolean))],
    [projects]
  );
  const visible = (projects ?? []).filter((p) => sector === 'Todos' || p.sector === sector);

  return (
    <>
      <PageHero
        eyebrow="Casos reales"
        title={
          <>
            Nuestros <em>proyectos</em>
          </>
        }
        lead="Soluciones de filtración que ya están funcionando en industrias y campos de Guatemala."
        art={<IndustryScene className="page-hero-svg page-hero-scene" />}
      />

      <section className="section">
        <div className="container">
          {sectors.length > 2 && (
            <div className="filter-chips" role="group" aria-label="Filtrar por sector">
              {sectors.map((s) => (
                <button key={s} className={s === sector ? 'is-active' : ''} aria-pressed={s === sector} onClick={() => setSector(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="project-grid">{[0, 1, 2].map((i) => <div key={i} className="project-card is-skeleton" />)}</div>}
          {error && <p className="muted">No se pudieron cargar los proyectos. Intenta de nuevo más tarde.</p>}

          {projects?.length === 0 && (
            <div className="empty-state">
              <h2>Muy pronto</h2>
              <p className="muted">Estamos documentando nuestros proyectos más recientes. Mientras tanto, conversemos sobre el tuyo.</p>
              <Link to="/unete" className="btn btn-dark">Contáctanos</Link>
            </div>
          )}

          <div className="project-grid">
            {visible.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
