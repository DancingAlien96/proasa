import { Link } from 'react-router-dom';

export default function ProjectCard({ project: p }) {
  return (
    <Link to={`/proyectos/${p.slug}`} className="project-card">
      <div className="project-card-media">
        {p.cover ? (
          <img src={p.cover.thumb_url} alt="" loading="lazy" width="720" height="540" />
        ) : (
          <div className="project-card-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3c3 4 6 7.5 6 11a6 6 0 01-12 0c0-3.5 3-7 6-11z" />
            </svg>
          </div>
        )}
        {p.sector && <span className="project-card-tag">{p.sector}</span>}
        {p.image_count > 1 && (
          <span className="project-card-count" aria-label={`${p.image_count} fotos`}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {p.image_count}
          </span>
        )}
      </div>
      <div className="project-card-body">
        <p className="project-card-meta">{[p.location, p.year].filter(Boolean).join(' · ')}</p>
        <h3>{p.title}</h3>
        {p.summary && <p className="project-card-summary">{p.summary}</p>}
        <span className="link-arrow">Ver proyecto →</span>
      </div>
    </Link>
  );
}
