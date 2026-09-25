import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lightbox from '../components/Lightbox.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import NotFound from './NotFound.jsx';
import { useApi } from '../lib/api.js';
import { useSettings } from '../lib/settings.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, error, loading } = useApi(`/projects/${encodeURIComponent(slug)}`);
  const { data: all } = useApi('/projects');
  const { whatsapp } = useSettings();
  const [open, setOpen] = useState(null);
  usePageTitle(p?.title);

  if (error?.status === 404) return <NotFound />;
  if (loading) return <div className="page-loading" aria-busy="true" />;
  if (error) {
    return (
      <div className="container section">
        <p className="muted">No se pudo cargar el proyecto. Intenta de nuevo más tarde.</p>
      </div>
    );
  }

  const facts = [
    ['Cliente', p.client],
    ['Ubicación', p.location],
    ['Sector', p.sector],
    ['Año', p.year],
  ].filter(([, v]) => v);
  const paragraphs = (p.description ?? '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  const others = (all ?? []).filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <section className="project-hero">
        {p.cover && <img className="project-hero-img" src={p.cover.url} alt="" />}
        <div className="project-hero-shade" aria-hidden="true" />
        <div className="container project-hero-content">
          <Link to="/proyectos" className="project-back">← Todos los proyectos</Link>
          {p.sector && <p className="chip chip-dark"><span className="chip-dot" /> {p.sector}</p>}
          <h1>{p.title}</h1>
          {p.summary && <p className="page-hero-lead">{p.summary}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container project-layout">
          <Reveal className="project-body">
            {paragraphs.length > 0 ? (
              paragraphs.map((t, i) => <p key={i}>{t}</p>)
            ) : (
              <p className="muted">Pronto agregaremos más detalles de este proyecto.</p>
            )}
          </Reveal>
          <Reveal as="aside" className="project-facts" delay={100}>
            {facts.length > 0 && (
              <dl>
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {p.technologies.length > 0 && (
              <>
                <h2>Tecnologías</h2>
                <ul className="pill-list">
                  {p.technologies.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </>
            )}
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
              Quiero un proyecto así
            </a>
          </Reveal>
        </div>
      </section>

      {p.images.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <Reveal className="section-head section-head-left">
              <p className="eyebrow">Galería</p>
              <h2 className="h2">
                El proyecto en <em>fotos</em>
              </h2>
            </Reveal>
            <div className="gallery">
              {p.images.map((img, i) => (
                <button key={img.url} className={`gallery-item${i % 5 === 0 ? ' is-wide' : ''}`} onClick={() => setOpen(i)} aria-label={`Ampliar foto ${i + 1}${img.caption ? `: ${img.caption}` : ''}`}>
                  <img src={i % 5 === 0 ? img.url : img.thumb_url} alt={img.caption ?? ''} loading="lazy" />
                  {img.caption && <span className="gallery-caption">{img.caption}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head section-head-left">
              <p className="eyebrow">Más proyectos</p>
              <h2 className="h2">Sigue explorando</h2>
            </div>
            <div className="project-grid">
              {others.map((o) => <ProjectCard key={o.slug} project={o} />)}
            </div>
          </div>
        </section>
      )}

      {open !== null && <Lightbox images={p.images} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
