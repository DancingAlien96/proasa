import { Link } from 'react-router-dom';
import Faq from '../components/Faq.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import FiltrationSpectrum from '../components/FiltrationSpectrum.jsx';
import { Reveal, CountUp } from '../components/Reveal.jsx';
import {
  MembraneHero,
  DropletLayers,
  TechGlyph,
  IndustryScene,
  AgroScene,
  NetworkMap,
  BrandArt,
} from '../components/Illustrations.jsx';
import { useApi } from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const SOLUTIONS = [
  {
    key: 'ro',
    title: 'Ósmosis inversa',
    text: 'Equipos para purificación total del agua: retienen sales, metales pesados y microorganismos.',
    tag: 'Purificación total',
  },
  {
    key: 'nf',
    title: 'Nanofiltración',
    text: 'Membranas para separación molecular precisa: dureza, color y materia orgánica.',
    tag: 'Separación molecular',
  },
  {
    key: 'uf',
    title: 'Ultrafiltración',
    text: 'Sistemas para remoción de partículas suspendidas, coloides y bacterias.',
    tag: 'Partículas suspendidas',
  },
  {
    key: 'media',
    title: 'Medios filtrantes',
    text: 'Medios y resinas especializadas para cada aplicación: sedimentos, cloro, dureza.',
    tag: 'Resinas y medios',
  },
  {
    key: 'pipe',
    title: 'Tuberías certificadas',
    text: 'Conducción que garantiza la integridad de todo el sistema, de la toma al punto de uso.',
    tag: 'Integridad del sistema',
  },
];

const APPLICATIONS = [
  'Alimentos y bebidas',
  'Textil',
  'Farmacéutica',
  'Química',
  'Manufactura',
  'Irrigación',
  'Agua para ganado',
  'Procesamiento agrícola',
  'Agua embotellada',
  'Agua potable',
];

const STEPS = [
  ['Análisis del agua', 'Evaluamos la calidad actual del agua y los contaminantes presentes.'],
  ['Diagnóstico', 'Definimos el volumen a tratar y tus objetivos de purificación.'],
  ['Propuesta', 'Recomendamos la solución más eficiente y costo-efectiva, con marcas reconocidas.'],
  ['Acompañamiento', 'Te respaldamos en la implementación y el mantenimiento del sistema.'],
];

const BENEFITS = [
  ['Capacitación técnica continua', 'Tu equipo domina cada tecnología que vende.'],
  ['Soporte de marketing', 'Material y apoyo comercial para crecer en tu región.'],
  ['Precios preferenciales', 'Condiciones competitivas para distribuidores.'],
  ['Respaldo completo', 'Productos de marcas con reconocimiento internacional.'],
];

export default function Home() {
  usePageTitle('Soluciones de filtración de agua');
  const { data: brands } = useApi('/brands');
  const { data: projects } = useApi('/projects?limit=3');

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                className={`hero-wave hero-wave-${i}`}
                d={`M0 ${220 + i * 50} C 240 ${160 + i * 50}, 480 ${280 + i * 50}, 720 ${220 + i * 50} S 1200 ${160 + i * 50}, 1440 ${220 + i * 50}`}
              />
            ))}
          </svg>
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="chip chip-dark">
              <span className="chip-dot" /> Filtración de agua · Industria y agricultura
            </p>
            <h1>
              Agua <em>pura</em> para los procesos que mueven a Guatemala
            </h1>
            <p className="hero-lead">
              Distribuimos membranas, equipos y medios filtrantes de marcas internacionales para resolver
              la contaminación y los minerales pesados en tus procesos.
            </p>
            <div className="hero-actions">
              <a href="#soluciones" className="btn btn-primary btn-lg">Explorar soluciones</a>
              <Link to="/unete" className="btn btn-ghost btn-lg">Quiero ser distribuidor →</Link>
            </div>
            <dl className="hero-stats">
              <div>
                <dt>5</dt>
                <dd>tecnologías de filtración</dd>
              </div>
              <div>
                <dt>130+</dt>
                <dd>países usan membranas Vontron</dd>
              </div>
              <div>
                <dt>Gratis</dt>
                <dd>consultoría técnica</dd>
              </div>
            </dl>
          </div>
          <div className="hero-art">
            <MembraneHero className="hero-svg" />
          </div>
        </div>
      </section>

      {/* ---------- Aplicaciones (marquesina) ---------- */}
      <div className="marquee" aria-label="Sectores que atendemos">
        <div className="marquee-track">
          {[...APPLICATIONS, ...APPLICATIONS].map((a, i) => (
            <span key={i} aria-hidden={i >= APPLICATIONS.length}>
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- El reto ---------- */}
      <section className="section">
        <div className="container split">
          <Reveal className="split-text">
            <p className="eyebrow">El reto</p>
            <h2 className="h2">
              El agua que llega a tus procesos no siempre es la que <em>necesitas</em>
            </h2>
            <p>
              La contaminación y la presencia de minerales pesados afectan tanto a procesos industriales
              como a sistemas agrícolas: equipos que se incrustan, productos fuera de especificación y
              cultivos que rinden menos.
            </p>
            <p>
              En <strong>PROASA</strong> nos enfocamos en resolver esos desafíos con tecnologías avanzadas
              que garantizan agua de la más alta calidad.
            </p>
            <ul className="check-list">
              <li>Contaminación de fuentes de agua</li>
              <li>Minerales pesados y dureza</li>
              <li>Sólidos suspendidos y turbidez</li>
            </ul>
          </Reveal>
          <Reveal className="video-card" delay={120}>
            <video src="/images/hero.mp4" poster="/images/hero-poster.jpg" autoPlay muted loop playsInline aria-hidden="true" />
            <div className="video-badge">
              <span className="pulse-dot" /> Agua sin tratar
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Soluciones ---------- */}
      <section className="section section-soft" id="soluciones">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Nuestra especialidad</p>
            <h2 className="h2">
              Cinco tecnologías, <em>una</em> misma meta: agua de calidad
            </h2>
            <p>Trabajamos con marcas especializadas de reconocimiento internacional.</p>
          </Reveal>
          <div className="bento">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.key} className={`bento-card bento-${i}`} delay={i * 80}>
                <TechGlyph type={s.key} className="bento-glyph" />
                <span className="tag">{s.tag}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Espectro interactivo ---------- */}
      <section className="section section-dark">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow eyebrow-light">Espectro de filtración</p>
            <h2 className="h2">
              ¿Qué retiene <em>cada</em> tecnología?
            </h2>
            <p>Selecciona una tecnología y mira qué contaminantes quedan fuera de tu agua.</p>
          </Reveal>
          <Reveal>
            <FiltrationSpectrum />
          </Reveal>
        </div>
      </section>

      {/* ---------- Industrias ---------- */}
      <section className="section" id="industrias">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Industrias</p>
            <h2 className="h2">
              Del campo a la <em>planta</em>
            </h2>
            <p>Cada sector tiene requerimientos únicos que abordamos con tecnología especializada.</p>
          </Reveal>
          <div className="industries">
            <Reveal className="industry-card">
              <IndustryScene className="industry-art" />
              <div className="industry-body">
                <h3>Industria</h3>
                <p>Agua de proceso confiable para producir con calidad constante.</p>
                <ul className="pill-list">
                  {['Alimentos y bebidas', 'Textil', 'Farmacéutica', 'Química', 'Manufactura general'].map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="industry-card" delay={120}>
              <AgroScene className="industry-art" />
              <div className="industry-body">
                <h3>Agricultura</h3>
                <p>Agua limpia para cultivos más sanos y ganado mejor atendido.</p>
                <ul className="pill-list">
                  {['Irrigación', 'Agua para ganado', 'Procesamiento de productos agrícolas'].map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Nosotros + proceso ---------- */}
      <section className="section section-soft">
        <div className="container split split-reverse">
          <Reveal className="split-art">
            <DropletLayers className="droplet-svg" />
          </Reveal>
          <Reveal className="split-text" delay={100}>
            <p className="eyebrow">Quiénes somos</p>
            <h2 className="h2">
              No solo distribuimos productos, <em>creamos soluciones</em>
            </h2>
            <p>
              Somos una empresa guatemalteca especializada en la distribución de productos de alta calidad
              para filtración de agua. Día a día buscamos soluciones efectivas a los problemas de calidad
              de agua en Guatemala y sus alrededores, usando la tecnología más avanzada y siguiendo las
              tendencias de la industria.
            </p>
            <ol className="steps">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ---------- Marcas ---------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Marcas que representamos</p>
            <h2 className="h2">
              Tecnología <em>probada</em> en todo el mundo
            </h2>
          </Reveal>
          <div className="brand-cards">
            {brands?.map((b, i) => (
              <Reveal key={b.slug} delay={i * 120}>
                <Link to={`/${b.slug}`} className="brand-card" style={{ '--accent-brand': b.accent }}>
                  <div className="brand-card-art">
                    <BrandArt slug={b.slug} className="brand-card-svg" />
                  </div>
                  <div className="brand-card-body">
                    <h3>{b.name}</h3>
                    <p>{b.tagline}</p>
                    <dl className="mini-stats">
                      {b.stats.slice(0, 3).map((s) => (
                        <div key={s.label}>
                          <dt><CountUp value={s.value} /></dt>
                          <dd>{s.label}</dd>
                        </div>
                      ))}
                    </dl>
                    <span className="link-arrow">Conocer {b.name} →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Proyectos recientes ---------- */}
      {projects?.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <Reveal className="section-head-row">
              <div>
                <p className="eyebrow">Proyectos</p>
                <h2 className="h2">
                  Resultados que <em>fluyen</em>
                </h2>
              </div>
              <Link to="/proyectos" className="btn btn-outline">Ver todos los proyectos</Link>
            </Reveal>
            <div className="project-grid">
              {projects.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Distribuidores ---------- */}
      <section className="section section-dark distributor">
        <div className="container split">
          <Reveal className="split-text">
            <p className="eyebrow eyebrow-light">Expansión y crecimiento</p>
            <h2 className="h2">
              Lleva agua de calidad a <em>tu</em> región
            </h2>
            <p>
              Buscamos distribuidores estratégicos que nos ayuden a expandir nuestra marca y consolidar una
              red de socios comprometidos con la excelencia en tratamiento de agua.
            </p>
            <ul className="benefits">
              {BENEFITS.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/unete" className="btn btn-primary btn-lg">Aplicar como distribuidor</Link>
          </Reveal>
          <Reveal className="split-art" delay={120}>
            <NetworkMap className="network-svg" />
          </Reveal>
        </div>
      </section>

      <Faq />
    </>
  );
}
