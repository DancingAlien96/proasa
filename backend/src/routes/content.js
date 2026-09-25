import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/settings', async (_req, res) => {
  const { rows } = await query('SELECT key, value FROM settings');
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.get('/faqs', async (_req, res) => {
  const { rows } = await query(
    'SELECT id, question, answer FROM faqs WHERE active ORDER BY sort_order, id'
  );
  res.json(rows);
});

router.get('/brands', async (_req, res) => {
  const { rows } = await query(
    'SELECT slug, name, tagline, accent, stats FROM brands WHERE active ORDER BY sort_order, id'
  );
  res.json(rows);
});

router.get('/brands/:slug', async (req, res) => {
  const { rows } = await query(
    `SELECT b.slug, b.name, b.company_name, b.hero_image, b.intro_lead, b.intro_body,
            b.pillars, b.quote, b.mission, b.mission_image, b.tagline, b.accent, b.stats,
            COALESCE(
              json_agg(json_build_object('title', d.title, 'url', d.url) ORDER BY d.sort_order)
                FILTER (WHERE d.id IS NOT NULL),
              '[]'
            ) AS documents
       FROM brands b
       LEFT JOIN brand_documents d ON d.brand_id = b.id
      WHERE b.slug = $1 AND b.active
      GROUP BY b.id`,
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: 'Marca no encontrada' });
  res.json(rows[0]);
});

export default router;
