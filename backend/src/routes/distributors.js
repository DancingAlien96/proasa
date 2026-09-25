import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

export const YEARS = ['0-2 años', '3-5 años', '6-10 años', 'Más de 10 años'];
export const COVERAGE = ['Local', 'Regional', 'Nacional', 'Internacional'];
export const INTERESTS = [
  'Sistemas de bombeo',
  'Filtración de agua',
  'Piscinas y accesorios',
  'Energías renovables',
  'Otros',
];
const STATUSES = ['nuevo', 'contactado', 'aprobado', 'rechazado'];

// Campos de texto: [nombre, requerido, longitud máxima]
const FIELDS = [
  ['company_legal_name', true, 200],
  ['trade_name', true, 200],
  ['nit', true, 30],
  ['address_line1', false, 200],
  ['address_line2', false, 200],
  ['city', false, 100],
  ['state', false, 100],
  ['postal_code', false, 20],
  ['country', false, 100],
  ['office_phone', false, 30],
  ['company_email', false, 150],
  ['website', false, 200],
  ['contact_name', true, 150],
  ['contact_position', true, 100],
  ['contact_phone', false, 30],
  ['contact_email', false, 150],
  ['current_products', false, 2000],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = {};
  const data = {};

  for (const [name, required, max] of FIELDS) {
    const value = typeof body[name] === 'string' ? body[name].trim() : '';
    if (required && !value) errors[name] = 'Este campo es obligatorio';
    else if (value.length > max) errors[name] = `Máximo ${max} caracteres`;
    data[name] = value || null;
  }

  for (const name of ['company_email', 'contact_email']) {
    if (data[name] && !EMAIL_RE.test(data[name])) errors[name] = 'Correo electrónico inválido';
  }

  data.years_experience = YEARS.includes(body.years_experience) ? body.years_experience : null;
  data.coverage = COVERAGE.includes(body.coverage) ? body.coverage : null;
  data.interests = Array.isArray(body.interests)
    ? [...new Set(body.interests.filter((i) => INTERESTS.includes(i)))]
    : [];

  return { errors, data };
}

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});

router.post('/distributors', submitLimiter, async (req, res) => {
  // Honeypot anti-spam: los humanos no ven este campo
  if (req.body?.website_confirm) return res.status(201).json({ ok: true });

  const { errors, data } = validate(req.body ?? {});
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Revisa el formulario', errors });

  const columns = Object.keys(data);
  const values = Object.values(data);
  const { rows } = await query(
    `INSERT INTO distributor_applications (${columns.join(', ')})
     VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
     RETURNING id`,
    values
  );
  res.status(201).json({ ok: true, id: rows[0].id });
});

// ---- Administración ----
router.get('/admin/distributors', requireAdmin, async (_req, res) => {
  const { rows } = await query(
    'SELECT * FROM distributor_applications ORDER BY created_at DESC LIMIT 500'
  );
  res.json(rows);
});

router.patch('/admin/distributors/:id', requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!STATUSES.includes(status)) return res.status(422).json({ error: 'Estado inválido' });
  const { rowCount } = await query(
    'UPDATE distributor_applications SET status = $1 WHERE id = $2',
    [status, Number(req.params.id)]
  );
  if (!rowCount) return res.status(404).json({ error: 'Solicitud no encontrada' });
  res.json({ ok: true });
});

export default router;
