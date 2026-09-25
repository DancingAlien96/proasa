# PROASA — sitio web

Migración de [proasa.com.gt](https://proasa.com.gt) (WordPress) a:

- **Frontend:** React 19 + Vite + React Router (`frontend/`)
- **Backend:** Node.js + Express 5 (`backend/`)
- **Base de datos:** PostgreSQL 16 (Docker, puerto **5435**)

## Arranque rápido

```bash
npm run install:all      # instala dependencias de raíz, backend y frontend
npm run db:up            # levanta Postgres en Docker
cp backend/.env.example backend/.env
npm run db:seed          # crea tablas y carga el contenido del sitio
npm --prefix backend run admin:create   # crea tu usuario administrador (pide correo, nombre y contraseña)
npm run dev              # API en :4000 + web en :5173
```

Abrir http://localhost:5173

## Páginas

| Ruta         | Contenido                                                      |
|--------------|----------------------------------------------------------------|
| `/`          | Hero con video, Quiénes somos, especialidad, CTA, FAQ          |
| `/unete`     | Datos de contacto + formulario de registro de distribuidores   |
| `/vontron`   | Página de marca (desde la BD)                                  |
| `/sunresin`  | Página de marca (desde la BD)                                  |
| `/proyectos` | Proyectos publicados, con filtro por sector                    |
| `/proyectos/:slug` | Detalle del proyecto con galería y visor de fotos       |
| `/admin`     | Panel privado: proyectos (con fotos) y solicitudes              |

Agregar una marca nueva = insertar una fila en `brands` (+ sus `brand_documents`); aparece sola en el menú, el footer y en `/<slug>`. Su color (`accent`) y cifras (`stats`) también vienen de la BD.

## Panel de administración

- Entra en `/admin` con correo y contraseña. Los usuarios se crean o se les cambia la contraseña con:
  ```bash
  npm --prefix backend run admin:create
  ```
  (también acepta `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD` como variables de entorno, útil en el servidor).
- Contraseñas cifradas con scrypt; sesiones firmadas con `AUTH_SECRET` que duran 12 h; login limitado a 10 intentos / 15 min.
- **Proyectos:** título, cliente, ubicación, sector, año, tecnologías, resumen, descripción, publicado/borrador y destacado.
- **Fotos:** arrastrar y soltar (hasta 20 por subida, 12 MB c/u, JPG/PNG/WebP). El servidor las convierte a WebP (máx. 2000 px) y genera miniaturas; quita metadatos EXIF (ubicación GPS, etc.). Se pueden ordenar, poner descripción, elegir portada y borrar.
- Las fotos se guardan en `backend/uploads/` (fuera de git): **respáldala** junto con la base de datos.

## Diseño

- **Paleta:** azul marino `#051a2e`, aqua `#19c3d6`, menta `#7ef0d8`, azul `#1463ff` (tokens en `frontend/src/styles.css`).
- **Tipografía:** Sora (títulos), Inter (texto), Instrument Serif itálica (acentos en `<em>`).
- **Ilustraciones:** todas son SVG propias en `frontend/src/components/Illustrations.jsx` (cartucho de ósmosis inversa, perlas de resina, rack de membranas, escenas de industria/agro, red de distribuidores). Sin fotos de stock; son livianas y animadas con CSS.
- **Espectro de filtración interactivo:** `FiltrationSpectrum.jsx` (escala ilustrativa aproximada).
- Respeta `prefers-reduced-motion`.

## API

| Método | Ruta                              | Descripción                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/settings`                   | Teléfono, WhatsApp, correo, dirección |
| GET    | `/api/faqs`                       | Preguntas frecuentes                 |
| GET    | `/api/brands`                     | Lista de marcas (menú)               |
| GET    | `/api/brands/:slug`               | Detalle de marca + fichas técnicas   |
| POST   | `/api/distributors`               | Enviar solicitud de distribuidor     |
| GET    | `/api/admin/distributors`         | Listar solicitudes (Bearer token)    |
| PATCH  | `/api/admin/distributors/:id`     | Cambiar estado (Bearer token)        |
| GET    | `/api/projects`                   | Proyectos publicados                 |
| GET    | `/api/projects/:slug`             | Proyecto publicado + fotos           |
| POST   | `/api/admin/login`                | Iniciar sesión → token               |
| GET/POST/PUT/DELETE | `/api/admin/projects[/:id]` | CRUD de proyectos (Bearer token) |
| POST   | `/api/admin/projects/:id/images`  | Subir fotos (multipart `images`)     |
| PUT    | `/api/admin/projects/:id/images-order` | Reordenar fotos                 |
| PUT    | `/api/admin/projects/:id/cover`   | Elegir portada                       |
| PATCH/DELETE | `/api/admin/projects/:id/images/:imageId` | Descripción / borrar foto |

El formulario tiene validación en servidor, límite de 10 envíos / 15 min por IP y un honeypot anti-spam.

## Base de datos

- `settings` — datos de contacto editables
- `faqs` — preguntas frecuentes
- `brands`, `brand_documents` — marcas y fichas técnicas
- `distributor_applications` — solicitudes del formulario
- `admin_users` — administradores
- `projects`, `project_images` — proyectos y sus fotos

Esquema en `backend/db/schema.sql`, contenido inicial en `backend/db/seed.sql`.

## Producción

1. `npm run build` → sirve `frontend/dist/` como sitio estático (Nginx, Netlify, etc.) con fallback a `index.html`.
2. Corre `backend` con `npm start` y define `DATABASE_URL`, `CORS_ORIGIN`, `AUTH_SECRET` (cadena larga aleatoria), `UPLOAD_DIR` (carpeta persistente) y `API_PORT`/`PORT`.
3. Si la API vive en otro dominio, define `VITE_API_URL` antes del build; si no, haz proxy de `/api` y `/uploads` al backend.
