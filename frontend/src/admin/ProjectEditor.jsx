import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSession } from './session.jsx';
import { Icon } from './AdminApp.jsx';
import { SECTORS, TECHNOLOGIES } from '../lib/projectOptions.js';

const EMPTY = {
  title: '',
  client: '',
  location: '',
  sector: '',
  technologies: [],
  year: '',
  summary: '',
  description: '',
  published: false,
  featured: false,
};

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_MB = 12;
const BATCH = 5; // fotos por petición, para mostrar progreso fluido

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const { request, upload } = useSession();

  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState({ slug: '', cover_image_id: null });
  const [images, setImages] = useState([]);
  const [pending, setPending] = useState([]); // fotos elegidas antes de guardar un proyecto nuevo
  const [loading, setLoading] = useState(!isNew);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(location.state?.notice ?? null); // { type, text }
  const [uploads, setUploads] = useState(null); // { done, total, progress }
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState(null);
  const fileInput = useRef(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    clearTimeout(flash.t);
    flash.t = setTimeout(() => setNotice(null), 4000);
  };

  // Cargar proyecto existente
  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setImages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    request(`/admin/projects/${id}`)
      .then((p) => {
        setForm({
          title: p.title ?? '',
          client: p.client ?? '',
          location: p.location ?? '',
          sector: p.sector ?? '',
          technologies: p.technologies ?? [],
          year: p.year ?? '',
          summary: p.summary ?? '',
          description: p.description ?? '',
          published: p.published,
          featured: p.featured,
        });
        setMeta({ slug: p.slug, cover_image_id: p.cover_image_id });
        setImages(p.images);
        setDirty(false);
      })
      .catch((e) => flash('error', e.message))
      .finally(() => setLoading(false));
  }, [id, isNew, request]);

  // Avisar si se sale con cambios sin guardar
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // Liberar vistas previas locales al salir
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setDirty(true);
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  };

  const toggleTech = (t) =>
    set('technologies', form.technologies.includes(t) ? form.technologies.filter((x) => x !== t) : [...form.technologies, t]);

  /* ---------------- Fotos ---------------- */
  const uploadFiles = useCallback(
    async (projectId, files) => {
      const valid = [];
      const rejected = [];
      for (const f of files) {
        if (!ACCEPT.split(',').includes(f.type)) rejected.push(`${f.name} (formato no permitido)`);
        else if (f.size > MAX_MB * 1024 * 1024) rejected.push(`${f.name} (pesa más de ${MAX_MB} MB)`);
        else valid.push(f);
      }
      if (!valid.length) {
        const result = { type: 'error', text: `No se subieron: ${rejected.join(', ')}` };
        flash(result.type, result.text);
        return result;
      }

      const failed = [...rejected];
      setUploads({ done: 0, total: valid.length, progress: 0 });
      for (let i = 0; i < valid.length; i += BATCH) {
        const batch = valid.slice(i, i + BATCH);
        const fd = new FormData();
        batch.forEach((f) => fd.append('images', f));
        try {
          const res = await upload(`/admin/projects/${projectId}/images`, fd, (p) =>
            setUploads({ done: i, total: valid.length, progress: (i + p * batch.length) / valid.length })
          );
          setImages((imgs) => [...imgs, ...res.images]);
          failed.push(...(res.failed ?? []));
        } catch (err) {
          failed.push(...(err.data?.failed ?? batch.map((f) => f.name)));
          if (!err.data?.failed) flash('error', err.message);
        }
      }
      setUploads(null);
      const result = failed.length
        ? { type: 'error', text: `No se pudieron subir: ${failed.join(', ')}` }
        : { type: 'ok', text: `${valid.length} foto${valid.length === 1 ? '' : 's'} subida${valid.length === 1 ? '' : 's'}` };
      flash(result.type, result.text);
      return result;
    },
    [upload]
  );

  function onFiles(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    if (isNew) {
      setPending((p) => [...p, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
      setDirty(true);
    } else {
      uploadFiles(id, files);
    }
  }

  async function saveOrder(next) {
    setImages(next);
    try {
      await request(`/admin/projects/${id}/images-order`, { method: 'PUT', body: { ids: next.map((i) => i.id) } });
    } catch (e) {
      flash('error', e.message);
    }
  }

  const move = (index, delta) => {
    const to = index + delta;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[index], next[to]] = [next[to], next[index]];
    saveOrder(next);
  };

  function onDropOnImage(targetId) {
    if (dragId == null || dragId === targetId) return;
    const next = [...images];
    const from = next.findIndex((i) => i.id === dragId);
    const [item] = next.splice(from, 1);
    next.splice(next.findIndex((i) => i.id === targetId), 0, item);
    setDragId(null);
    saveOrder(next);
  }

  async function setCover(imageId) {
    try {
      await request(`/admin/projects/${id}/cover`, { method: 'PUT', body: { imageId } });
      setMeta((m) => ({ ...m, cover_image_id: imageId }));
      flash('ok', 'Portada actualizada');
    } catch (e) {
      flash('error', e.message);
    }
  }

  async function saveCaption(image, caption) {
    if ((image.caption ?? '') === caption) return;
    try {
      await request(`/admin/projects/${id}/images/${image.id}`, { method: 'PATCH', body: { caption } });
      setImages((imgs) => imgs.map((i) => (i.id === image.id ? { ...i, caption } : i)));
      flash('ok', 'Descripción guardada');
    } catch (e) {
      flash('error', e.message);
    }
  }

  async function removeImage(image) {
    if (!window.confirm('¿Eliminar esta foto? Esta acción no se puede deshacer.')) return;
    try {
      await request(`/admin/projects/${id}/images/${image.id}`, { method: 'DELETE' });
      setImages((imgs) => imgs.filter((i) => i.id !== image.id));
      if (meta.cover_image_id === image.id) setMeta((m) => ({ ...m, cover_image_id: null }));
    } catch (e) {
      flash('error', e.message);
    }
  }

  /* ---------------- Guardar / eliminar ---------------- */
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: 'El título es obligatorio' });
      document.getElementById('p-title')?.focus();
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, year: form.year === '' ? null : Number(form.year) };
      if (isNew) {
        const created = await request('/admin/projects', { method: 'POST', body });
        setDirty(false);
        // Subir las fotos elegidas antes de pasar a la pantalla de edición
        const files = pending.map((p) => p.file);
        const result = files.length ? await uploadFiles(created.id, files) : null;
        navigate(`/admin/proyectos/${created.id}`, {
          replace: true,
          state: { notice: result?.type === 'error' ? result : { type: 'ok', text: 'Proyecto creado' } },
        });
      } else {
        const updated = await request(`/admin/projects/${id}`, { method: 'PUT', body });
        setMeta((m) => ({ ...m, slug: updated.slug }));
        setDirty(false);
        flash('ok', form.published ? 'Cambios guardados y publicados' : 'Cambios guardados (borrador)');
      }
    } catch (err) {
      setErrors(err.details ?? {});
      flash('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`¿Eliminar el proyecto "${form.title}" y todas sus fotos? Esta acción no se puede deshacer.`)) return;
    try {
      await request(`/admin/projects/${id}`, { method: 'DELETE' });
      setDirty(false);
      navigate('/admin/proyectos', { replace: true });
    } catch (e) {
      flash('error', e.message);
    }
  }

  if (loading) return <div className="adm-page"><p className="muted">Cargando proyecto…</p></div>;

  const coverId = meta.cover_image_id ?? images[0]?.id;

  return (
    <form className="adm-page" onSubmit={onSubmit} noValidate>
      <div className="adm-head">
        <div>
          <Link to="/admin/proyectos" className="adm-back">← Proyectos</Link>
          <h1>{isNew ? 'Nuevo proyecto' : form.title || 'Proyecto sin título'}</h1>
        </div>
        <div className="adm-head-actions">
          {!isNew && form.published && !dirty && (
            <a href={`/proyectos/${meta.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Ver en el sitio ↗
            </a>
          )}
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isNew ? 'Crear proyecto' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {notice && (
        <div className={`adm-toast is-${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="adm-editor">
        <div className="adm-editor-main">
          <section className="adm-card">
            <h2>Información</h2>
            <div className="adm-fields">
              <div className={`field field-full${errors.title ? ' has-error' : ''}`}>
                <label htmlFor="p-title">Título <span className="req">*</span></label>
                <input id="p-title" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={150} placeholder="Ej. Planta de ósmosis inversa para embotelladora" aria-invalid={!!errors.title} />
                {errors.title && <small className="field-error">{errors.title}</small>}
              </div>
              <div className="field">
                <label htmlFor="p-client">Cliente <span className="opt">opcional</span></label>
                <input id="p-client" value={form.client} onChange={(e) => set('client', e.target.value)} maxLength={150} />
              </div>
              <div className="field">
                <label htmlFor="p-location">Ubicación <span className="opt">opcional</span></label>
                <input id="p-location" value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={150} placeholder="Ej. Zacapa, Guatemala" />
              </div>
              <div className="field">
                <label htmlFor="p-sector">Sector</label>
                <input id="p-sector" list="sectors" value={form.sector} onChange={(e) => set('sector', e.target.value)} maxLength={80} placeholder="Elige o escribe" />
                <datalist id="sectors">
                  {SECTORS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className={`field${errors.year ? ' has-error' : ''}`}>
                <label htmlFor="p-year">Año</label>
                <input id="p-year" type="number" min="1950" max="2100" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder={String(new Date().getFullYear())} />
                {errors.year && <small className="field-error">{errors.year}</small>}
              </div>
              <div className="field field-full">
                <span className="label">Tecnologías utilizadas</span>
                <div className="choices">
                  {TECHNOLOGIES.map((t) => (
                    <label key={t} className="choice">
                      <input type="checkbox" checked={form.technologies.includes(t)} onChange={() => toggleTech(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <label htmlFor="p-summary">
                  Resumen <span className="opt">se muestra en las tarjetas · {form.summary.length}/300</span>
                </label>
                <textarea id="p-summary" rows="2" maxLength={300} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
              </div>
              <div className="field field-full">
                <label htmlFor="p-description">
                  Descripción completa <span className="opt">deja una línea en blanco para separar párrafos</span>
                </label>
                <textarea id="p-description" rows="9" maxLength={10000} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Reto del cliente, solución implementada, resultados…" />
              </div>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Fotos del proyecto</h2>
              <span className="muted small">
                {isNew ? pending.length : images.length} foto{(isNew ? pending.length : images.length) === 1 ? '' : 's'}
              </span>
            </div>

            <div
              className={`adm-drop${dragOver ? ' is-over' : ''}`}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('Files')) {
                  e.preventDefault();
                  setDragOver(true);
                }
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (!e.dataTransfer.files.length) return;
                e.preventDefault();
                setDragOver(false);
                onFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileInput.current?.click())}
            >
              <Icon d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" size={28} />
              <strong>Arrastra fotos aquí o haz clic para elegirlas</strong>
              <span className="muted small">JPG, PNG o WebP · hasta {MAX_MB} MB cada una · se optimizan automáticamente</span>
              <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
            </div>

            {uploads && (
              <div className="adm-progress" role="status" aria-live="polite">
                <span>Subiendo {uploads.total} foto{uploads.total === 1 ? '' : 's'}… {Math.round(uploads.progress * 100)}%</span>
                <div className="adm-progress-bar"><span style={{ width: `${uploads.progress * 100}%` }} /></div>
              </div>
            )}

            {isNew && pending.length > 0 && (
              <>
                <p className="adm-hint">Estas fotos se subirán al crear el proyecto.</p>
                <div className="adm-gallery">
                  {pending.map((p, i) => (
                    <div key={p.preview} className="adm-photo">
                      <img src={p.preview} alt="" />
                      <div className="adm-photo-actions">
                        <button type="button" onClick={() => { URL.revokeObjectURL(p.preview); setPending((list) => list.filter((_, j) => j !== i)); }} className="danger" aria-label="Quitar foto">
                          <Icon d="M6 6l12 12M18 6L6 18" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!isNew && images.length > 0 && (
              <>
                <p className="adm-hint">Arrastra las fotos para ordenarlas. La portada es la imagen principal del proyecto.</p>
                <div className="adm-gallery">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      className={`adm-photo${dragId === img.id ? ' is-dragging' : ''}${coverId === img.id ? ' is-cover' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        setDragId(img.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => setDragId(null)}
                      onDragOver={(e) => dragId != null && e.preventDefault()}
                      onDrop={(e) => {
                        if (dragId == null) return;
                        e.preventDefault();
                        onDropOnImage(img.id);
                      }}
                    >
                      <img src={img.thumb_url} alt={img.caption ?? ''} loading="lazy" />
                      {coverId === img.id && <span className="adm-cover-badge">★ Portada</span>}
                      <div className="adm-photo-actions">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda">
                          <Icon d="M15 6l-6 6 6 6" size={16} />
                        </button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Mover a la derecha">
                          <Icon d="M9 6l6 6-6 6" size={16} />
                        </button>
                        {coverId !== img.id && (
                          <button type="button" onClick={() => setCover(img.id)} aria-label="Usar como portada" title="Usar como portada">
                            <Icon d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" size={16} />
                          </button>
                        )}
                        <button type="button" className="danger" onClick={() => removeImage(img)} aria-label="Eliminar foto" title="Eliminar foto">
                          <Icon d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" size={16} />
                        </button>
                      </div>
                      <input
                        className="adm-caption"
                        defaultValue={img.caption ?? ''}
                        placeholder="Descripción de la foto…"
                        maxLength={200}
                        aria-label={`Descripción de la foto ${i + 1}`}
                        onBlur={(e) => saveCaption(img, e.target.value.trim())}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="adm-editor-side">
          <section className="adm-card">
            <h2>Publicación</h2>
            <label className="adm-switch">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
              <span className="adm-switch-ui" aria-hidden="true" />
              <span>
                <strong>{form.published ? 'Publicado' : 'Borrador'}</strong>
                <small>{form.published ? 'Visible en el sitio' : 'Solo lo ven los administradores'}</small>
              </span>
            </label>
            <label className="adm-switch">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              <span className="adm-switch-ui" aria-hidden="true" />
              <span>
                <strong>Destacado</strong>
                <small>Aparece primero y en la página de inicio</small>
              </span>
            </label>
            {dirty && <p className="adm-unsaved">● Hay cambios sin guardar</p>}
            <button className="btn btn-primary btn-block" disabled={saving}>
              {saving ? 'Guardando…' : isNew ? 'Crear proyecto' : 'Guardar cambios'}
            </button>
          </section>

          {!isNew && (
            <section className="adm-card adm-danger-zone">
              <h2>Zona de peligro</h2>
              <p className="muted small">Elimina el proyecto y todas sus fotos de forma permanente.</p>
              <button type="button" className="btn btn-outline btn-block danger" onClick={onDelete}>
                Eliminar proyecto
              </button>
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}
