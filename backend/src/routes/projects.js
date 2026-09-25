import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { pool, query } from '../db.js';
import { requireAdmin } from '../auth.js';

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');
const MAX_FILE_MB = 12;
const MAX_FILES = 20;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: MAX_FILES },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.includes(file.mimetype)),
});

const router = Router();

/* ------------------------------------------------------------------ */
/* Utilidades                                                         */
/* ------------------------------------------------------------------ */
function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'proyecto';
}

async function uniqueSlug(base, excludeId = 0) {
  let slug = base;
  for (let i = 2; ; i++) {
    const { rowCount } = await query('SELECT 1 FROM projects WHERE slug = $1 AND id <> $2', [slug, excludeId]);
    if (!rowCount) return slug;
    slug = `${base}-${i}`;
  }
}

const str = (v, max) => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, max) : null;
};

function validateProject(body = {}) {
  const errors = {};
  const data = {
    title: str(body.title, 150),
    client: str(body.client, 150),
    location: str(body.location, 150),
    sector: str(body.sector, 80),
    summary: str(body.summary, 300),
    description: str(body.description, 10000),
    technologies: Array.isArray(body.technologies)
      ? [...new Set(body.technologies.map((t) => str(t, 60)).filter(Boolean))].slice(0, 12)
      : [],
    year: body.year === '' || body.year == null ? null : Number(body.year),
    published: Boolean(body.published),
    featured: Boolean(body.featured),
  };
  if (!data.title) errors.title = 'El título es obligatorio';
  if (data.year !== null && (!Number.isInteger(data.year) || data.year < 1950 || data.year > 2100)) {
    errors.year = 'Año inválido';
  }
  return { errors, data };
}

// Portada: la elegida o, si no hay, la primera foto
const COVER_SQL = `
  COALESCE(
    (SELECT json_build_object('url', i.url, 'thumb_url', i.thumb_url, 'width', i.width, 'height', i.height)
       FROM project_images i WHERE i.id = p.cover_image_id),
    (SELECT json_build_object('url', i.url, 'thumb_url', i.thumb_url, 'width', i.width, 'height', i.height)
       FROM project_images i WHERE i.project_id = p.id ORDER BY i.sort_order, i.id LIMIT 1)
  ) AS cover`;

const IMAGES_SQL = `
  COALESCE((SELECT json_agg(json_build_object(
      'id', i.id, 'url', i.url, 'thumb_url', i.thumb_url, 'width', i.width, 'height', i.height, 'caption', i.caption
    ) ORDER BY i.sort_order, i.id) FROM project_images i WHERE i.project_id = p.id), '[]') AS images`;

const projectDir = (id) => path.join(UPLOAD_DIR, 'projects', String(id));

/* ------------------------------------------------------------------ */
/* Público                                                            */
/* ------------------------------------------------------------------ */
router.get('/projects', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 60, 60);
  const params = [limit];
  let where = 'p.published';
  if (req.query.featured === '1') where += ' AND p.featured';
  const { rows } = await query(
    `SELECT p.slug, p.title, p.client, p.location, p.sector, p.technologies, p.year, p.summary, p.featured,
            (SELECT COUNT(*)::int FROM project_images i WHERE i.project_id = p.id) AS image_count,
            ${COVER_SQL}
       FROM projects p
      WHERE ${where}
      ORDER BY p.featured DESC, p.year DESC NULLS LAST, p.created_at DESC
      LIMIT $1`,
    params
  );
  res.json(rows);
});

router.get('/projects/:slug', async (req, res) => {
  const { rows } = await query(
    `SELECT p.slug, p.title, p.client, p.location, p.sector, p.technologies, p.year, p.summary, p.description,
            ${COVER_SQL}, ${IMAGES_SQL}
       FROM projects p
      WHERE p.slug = $1 AND p.published`,
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(rows[0]);
});

/* ------------------------------------------------------------------ */
/* Administración                                                     */
/* ------------------------------------------------------------------ */
router.get('/admin/projects', requireAdmin, async (_req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.slug, p.title, p.client, p.sector, p.year, p.published, p.featured, p.updated_at,
            (SELECT COUNT(*)::int FROM project_images i WHERE i.project_id = p.id) AS image_count,
            ${COVER_SQL}
       FROM projects p
      ORDER BY p.updated_at DESC`
  );
  res.json(rows);
});

router.get('/admin/projects/:id', requireAdmin, async (req, res) => {
  const { rows } = await query(`SELECT p.*, ${IMAGES_SQL} FROM projects p WHERE p.id = $1`, [Number(req.params.id)]);
  if (!rows.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(rows[0]);
});

router.post('/admin/projects', requireAdmin, async (req, res) => {
  const { errors, data } = validateProject(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Revisa el formulario', errors });
  const slug = await uniqueSlug(slugify(data.title));
  const cols = Object.keys(data);
  const { rows } = await query(
    `INSERT INTO projects (slug, ${cols.join(', ')})
     VALUES ($1, ${cols.map((_, i) => `$${i + 2}`).join(', ')})
     RETURNING id, slug`,
    [slug, ...Object.values(data)]
  );
  res.status(201).json(rows[0]);
});

router.put('/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { errors, data } = validateProject(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Revisa el formulario', errors });
  const slug = await uniqueSlug(slugify(req.body.slug || data.title), id);
  const cols = Object.keys(data);
  const { rows } = await query(
    `UPDATE projects SET slug = $1, ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')}, updated_at = NOW()
      WHERE id = $${cols.length + 2}
      RETURNING id, slug`,
    [slug, ...Object.values(data), id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(rows[0]);
});

router.delete('/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Proyecto no encontrado' });
  await fs.rm(projectDir(id), { recursive: true, force: true });
  res.json({ ok: true });
});

// Subir fotos (campo "images", varias a la vez)
router.post('/admin/projects/:id/images', requireAdmin, upload.array('images', MAX_FILES), async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await query('SELECT 1 FROM projects WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Proyecto no encontrado' });
  if (!req.files?.length) return res.status(422).json({ error: 'Selecciona al menos una imagen JPG, PNG o WebP' });

  const dir = projectDir(id);
  await fs.mkdir(dir, { recursive: true });
  const { rows: [{ next }] } = await query(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM project_images WHERE project_id = $1',
    [id]
  );

  const saved = [];
  const failed = [];
  for (const [i, file] of req.files.entries()) {
    const name = crypto.randomBytes(10).toString('hex');
    try {
      // sharp valida que sea realmente una imagen; rotate() respeta la orientación EXIF y quita metadatos
      const full = await sharp(file.buffer)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(dir, `${name}.webp`));
      await sharp(file.buffer)
        .rotate()
        .resize({ width: 720, height: 540, fit: 'cover' })
        .webp({ quality: 74 })
        .toFile(path.join(dir, `${name}-thumb.webp`));

      const base = `/uploads/projects/${id}/${name}`;
      const { rows } = await query(
        `INSERT INTO project_images (project_id, url, thumb_url, width, height, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, url, thumb_url, width, height, caption`,
        [id, `${base}.webp`, `${base}-thumb.webp`, full.width, full.height, next + i]
      );
      saved.push(rows[0]);
    } catch {
      failed.push(file.originalname);
      await fs.rm(path.join(dir, `${name}.webp`), { force: true });
      await fs.rm(path.join(dir, `${name}-thumb.webp`), { force: true });
    }
  }
  await query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [id]);
  res.status(saved.length ? 201 : 422).json({ images: saved, failed });
});

router.patch('/admin/projects/:id/images/:imageId', requireAdmin, async (req, res) => {
  const { rowCount } = await query(
    'UPDATE project_images SET caption = $1 WHERE id = $2 AND project_id = $3',
    [str(req.body?.caption, 200), Number(req.params.imageId), Number(req.params.id)]
  );
  if (!rowCount) return res.status(404).json({ error: 'Imagen no encontrada' });
  res.json({ ok: true });
});

router.put('/admin/projects/:id/images-order', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [i, imageId] of ids.entries()) {
      await client.query('UPDATE project_images SET sort_order = $1 WHERE id = $2 AND project_id = $3', [i, imageId, id]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  res.json({ ok: true });
});

router.put('/admin/projects/:id/cover', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const imageId = Number(req.body?.imageId);
  const { rowCount } = await query('SELECT 1 FROM project_images WHERE id = $1 AND project_id = $2', [imageId, id]);
  if (!rowCount) return res.status(404).json({ error: 'Imagen no encontrada' });
  await query('UPDATE projects SET cover_image_id = $1, updated_at = NOW() WHERE id = $2', [imageId, id]);
  res.json({ ok: true });
});

router.delete('/admin/projects/:id/images/:imageId', requireAdmin, async (req, res) => {
  const { rows } = await query(
    'DELETE FROM project_images WHERE id = $1 AND project_id = $2 RETURNING url, thumb_url',
    [Number(req.params.imageId), Number(req.params.id)]
  );
  if (!rows.length) return res.status(404).json({ error: 'Imagen no encontrada' });
  for (const u of [rows[0].url, rows[0].thumb_url]) {
    await fs.rm(path.join(UPLOAD_DIR, u.replace(/^\/uploads\//, '')), { force: true });
  }
  res.json({ ok: true });
});

// Errores de subida (tamaño, cantidad) con mensaje claro
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Cada imagen debe pesar menos de ${MAX_FILE_MB} MB`
        : err.code === 'LIMIT_FILE_COUNT'
          ? `Máximo ${MAX_FILES} imágenes por subida`
          : 'Error al subir las imágenes';
    return res.status(413).json({ error: msg });
  }
  next(err);
});

export default router;
