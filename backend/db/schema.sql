-- Esquema de PROASA

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  hero_image    TEXT,
  intro_lead    TEXT NOT NULL,
  intro_body    TEXT[] NOT NULL DEFAULT '{}',
  -- [{ "title": "...", "items": ["párrafo o viñeta", ...], "list": true|false }]
  pillars       JSONB NOT NULL DEFAULT '[]',
  quote         TEXT,
  mission       TEXT,
  mission_image TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS brand_documents (
  id         SERIAL PRIMARY KEY,
  brand_id   INT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id         SERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS distributor_applications (
  id                   SERIAL PRIMARY KEY,
  company_legal_name   TEXT NOT NULL,
  trade_name           TEXT NOT NULL,
  nit                  TEXT NOT NULL,
  address_line1        TEXT,
  address_line2        TEXT,
  city                 TEXT,
  state                TEXT,
  postal_code          TEXT,
  country              TEXT,
  office_phone         TEXT,
  company_email        TEXT,
  website              TEXT,
  contact_name         TEXT NOT NULL,
  contact_position     TEXT NOT NULL,
  contact_phone        TEXT,
  contact_email        TEXT,
  years_experience     TEXT,
  current_products     TEXT,
  coverage             TEXT,
  interests            TEXT[] NOT NULL DEFAULT '{}',
  status               TEXT NOT NULL DEFAULT 'nuevo'
                         CHECK (status IN ('nuevo', 'contactado', 'aprobado', 'rechazado')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_created ON distributor_applications (created_at DESC);

-- v2: rediseño — cifras destacadas y color por marca
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS accent  TEXT NOT NULL DEFAULT '#1463ff';
-- [{ "value": "130+", "label": "países" }]
ALTER TABLE brands ADD COLUMN IF NOT EXISTS stats   JSONB NOT NULL DEFAULT '[]';

-- v3: administradores y proyectos
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS projects (
  id             SERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  client         TEXT,
  location       TEXT,
  sector         TEXT,
  technologies   TEXT[] NOT NULL DEFAULT '{}',
  year           INT,
  summary        TEXT,
  description    TEXT,
  published      BOOLEAN NOT NULL DEFAULT FALSE,
  featured       BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_id INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_images (
  id         SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  thumb_url  TEXT NOT NULL,
  width      INT,
  height     INT,
  caption    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images (project_id, sort_order);

DO $$ BEGIN
  ALTER TABLE projects ADD CONSTRAINT projects_cover_fk
    FOREIGN KEY (cover_image_id) REFERENCES project_images(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
