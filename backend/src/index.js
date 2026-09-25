import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './db.js';
import contentRoutes from './routes/content.js';
import distributorRoutes from './routes/distributors.js';
import projectRoutes, { UPLOAD_DIR } from './routes/projects.js';
import authRoutes from './auth.js';

const app = express();
// API_PORT tiene prioridad: algunas herramientas inyectan PORT para el frontend
const PORT = process.env.API_PORT || process.env.PORT || 4000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '100kb' }));

// Fotos subidas por los administradores (nombres aleatorios e inmutables)
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true, fallthrough: false }));

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.use('/api', contentRoutes);
app.use('/api', distributorRoutes);
app.use('/api', authRoutes);
app.use('/api', projectRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Express 5 envía aquí los errores de handlers async
app.use((err, _req, res, _next) => {
  if (err.status === 404) return res.status(404).end();
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`API PROASA escuchando en http://localhost:${PORT}`));
