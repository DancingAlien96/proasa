import { useCallback, useEffect, useState } from 'react';
import { useSession } from './session.jsx';

const STATUSES = ['nuevo', 'contactado', 'aprobado', 'rechazado'];

export default function Applications() {
  const { request } = useSession();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await request('/admin/distributors'));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id, status) {
    try {
      await request(`/admin/distributors/${id}`, { method: 'PATCH', body: { status } });
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="adm-page">
      <div className="adm-head">
        <div>
          <h1>Solicitudes de distribuidores</h1>
          <p className="muted">
            {rows ? `${rows.length} solicitud${rows.length === 1 ? '' : 'es'} · ${rows.filter((r) => r.status === 'nuevo').length} nuevas` : 'Cargando…'}
          </p>
        </div>
        <button className="btn btn-outline" onClick={load}>Actualizar</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {rows?.length === 0 && (
        <div className="adm-empty">
          <h2>Todavía no hay solicitudes</h2>
          <p className="muted">Aparecerán aquí cuando alguien llene el formulario de "Sé distribuidor".</p>
        </div>
      )}

      {rows?.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>País</th>
                <th>Intereses</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Row
                  key={r.id}
                  r={r}
                  open={expanded === r.id}
                  onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                  onStatus={(s) => changeStatus(r.id, s)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ r, open, onToggle, onStatus }) {
  const details = [
    ['Razón social', r.company_legal_name],
    ['NIT', r.nit],
    ['Dirección', [r.address_line1, r.address_line2, r.city, r.state, r.postal_code].filter(Boolean).join(', ')],
    ['Tel. oficina', r.office_phone],
    ['Correo empresa', r.company_email],
    ['Web', r.website],
    ['Cargo', r.contact_position],
    ['Tel. contacto', r.contact_phone],
    ['Correo contacto', r.contact_email],
    ['Experiencia', r.years_experience],
    ['Cobertura', r.coverage],
    ['Productos actuales', r.current_products],
  ].filter(([, v]) => v);

  return (
    <>
      <tr className="admin-row" onClick={onToggle} aria-expanded={open}>
        <td>{new Date(r.created_at).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}</td>
        <td><strong>{r.trade_name}</strong></td>
        <td>{r.contact_name}</td>
        <td>{r.country}</td>
        <td>{r.interests.join(', ')}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <select value={r.status} onChange={(e) => onStatus(e.target.value)} className={`status status-${r.status}`} aria-label="Estado">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </td>
      </tr>
      {open && (
        <tr className="admin-details">
          <td colSpan="6">
            <dl>
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
