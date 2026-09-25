import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider, useSession } from './session.jsx';
import ProjectsList from './ProjectsList.jsx';
import ProjectEditor from './ProjectEditor.jsx';
import Applications from './Applications.jsx';
import './admin.css';

export default function AdminApp() {
  return (
    <SessionProvider>
      <Gate />
    </SessionProvider>
  );
}

function Gate() {
  const { isLoggedIn } = useSession();
  useEffect(() => {
    document.title = 'Panel de administración - PROASA';
  }, []);
  return isLoggedIn ? <Layout /> : <Login />;
}

function Login() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={onSubmit}>
        <img src="/images/logo.png" alt="PROASA" width="105" height="44" className="admin-logo" />
        <div>
          <h1>Panel de administración</h1>
          <p className="muted">Ingresa con tu cuenta de administrador.</p>
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-dark" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="link-arrow small">← Volver al sitio</Link>
      </form>
    </div>
  );
}

function Layout() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className={`adm${open ? ' is-open' : ''}`}>
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt="PROASA" width="90" height="38" />
          <span>Admin</span>
        </Link>
        <nav className="adm-nav" onClick={() => setOpen(false)}>
          <NavLink to="/admin/proyectos">
            <Icon d="M3 7h18M3 12h18M3 17h12" /> Proyectos
          </NavLink>
          <NavLink to="/admin/solicitudes">
            <Icon d="M4 4h16v16H4zM4 9h16M9 4v16" /> Solicitudes
          </NavLink>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Icon d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /> Ver sitio
          </a>
        </nav>
        <div className="adm-user">
          <span className="adm-avatar" aria-hidden="true">{user?.name?.[0]?.toUpperCase() ?? 'A'}</span>
          <span className="adm-user-info">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </span>
          <button className="adm-logout" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-menu" onClick={() => setOpen((o) => !o)} aria-label="Menú">
            <Icon d="M4 7h16M4 12h16M4 17h16" />
          </button>
          <span>PROASA · Admin</span>
        </header>
        <Routes>
          <Route index element={<Navigate to="proyectos" replace />} />
          <Route path="proyectos" element={<ProjectsList />} />
          <Route path="proyectos/nuevo" element={<ProjectEditor />} />
          <Route path="proyectos/:id" element={<ProjectEditor />} />
          <Route path="solicitudes" element={<Applications />} />
          <Route path="*" element={<Navigate to="proyectos" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
