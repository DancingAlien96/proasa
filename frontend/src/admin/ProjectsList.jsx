import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from './session.jsx';
import { Icon } from './AdminApp.jsx';

const FILTERS = [
  ['all', 'Todos'],
  ['published', 'Publicados'],
  ['draft', 'Borradores'],
];

export default function ProjectsList() {
  const { request } = useSession();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    request('/admin/projects').then(setProjects).catch((e) => setError(e.message));
  }, [request]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (projects ?? []).filter(
      (p) =>
        (filter === 'all' || (filter === 'published' ? p.published : !p.published)) &&
        (!term || [p.title, p.client, p.sector].some((v) => v?.toLowerCase().includes(term)))
    );
  }, [projects, q, filter]);

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Proyectos</h1>
          <p className="muted">
            {projects ? `${projects.length} proyecto${projects.length === 1 ? '' : 's'} · ${projects.filter((p) => p.published).length} publicados` : 'Cargando…'}
          </p>
        </div>
        <Link to="/admin/proyectos/nuevo" className="btn btn-primary">
          <Icon d="M12 5v14M5 12h14" /> Nuevo proyecto
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {projects?.length > 0 && (
        <div className="adm-toolbar">
          <input type="search" placeholder="Buscar por título, cliente o sector…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar proyectos" />
          <div className="adm-segment" role="group" aria-label="Filtrar">
            {FILTERS.map(([key, label]) => (
              <button key={key} className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)} aria-pressed={filter === key}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {projects?.length === 0 && (
        <div className="adm-empty">
          <div className="adm-empty-icon"><Icon d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01" size={30} /></div>
          <h2>Aún no hay proyectos</h2>
          <p className="muted">Crea el primero, agrega sus fotos y publícalo en el sitio.</p>
          <Link to="/admin/proyectos/nuevo" className="btn btn-primary">Crear proyecto</Link>
        </div>
      )}

      <div className="adm-project-grid">
        {visible.map((p) => (
          <Link key={p.id} to={`/admin/proyectos/${p.id}`} className="adm-project-card">
            <div className="adm-project-thumb">
              {p.cover ? <img src={p.cover.thumb_url} alt="" loading="lazy" /> : <span>Sin fotos</span>}
              <span className={`adm-badge ${p.published ? 'is-live' : 'is-draft'}`}>{p.published ? 'Publicado' : 'Borrador'}</span>
              {p.featured && <span className="adm-badge is-featured">★ Destacado</span>}
            </div>
            <div className="adm-project-body">
              <strong>{p.title}</strong>
              <small>{[p.sector, p.client, p.year].filter(Boolean).join(' · ') || 'Sin detalles'}</small>
              <small className="muted">
                {p.image_count} foto{p.image_count === 1 ? '' : 's'} · editado {new Date(p.updated_at).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })}
              </small>
            </div>
          </Link>
        ))}
      </div>

      {projects?.length > 0 && visible.length === 0 && <p className="muted">Ningún proyecto coincide con la búsqueda.</p>}
    </div>
  );
}
