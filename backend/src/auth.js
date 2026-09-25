import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from './db.js';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET no está definido o es muy corto (mínimo 32 caracteres)');
  return s;
}

// ---- Contraseñas (scrypt) ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  const [alg, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Hash de relleno para que "usuario no existe" tarde lo mismo que "contraseña incorrecta"
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

// ---- Tokens de sesión firmados con HMAC ----
const b64url = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

export function signToken(payload) {
  const body = b64url(JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS }));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  // Confirmar que el usuario sigue existiendo (por si fue eliminado)
  const { rows } = await query('SELECT id, email, name FROM admin_users WHERE id = $1', [payload.sub]);
  if (!rows.length) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  req.admin = rows[0];
  next();
}

// ---- Rutas ----
const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' },
});

router.post('/admin/login', loginLimiter, async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!email || !password) return res.status(422).json({ error: 'Ingresa tu correo y contraseña' });

  const { rows } = await query('SELECT id, email, name, password_hash FROM admin_users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  await query('UPDATE admin_users SET last_login_at = NOW() WHERE id = $1', [user.id]);
  res.json({
    token: signToken({ sub: user.id }),
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.get('/admin/me', requireAdmin, (req, res) => res.json(req.admin));

export default router;
