import { useState } from 'react';

// Escala logarítmica en micrómetros: 10^-4 … 10^2
const MIN = -4;
const MAX = 2;
const pos = (um) => ((Math.log10(um) - MIN) / (MAX - MIN)) * 100;

const TECHS = [
  {
    key: 'ro',
    name: 'Ósmosis inversa',
    range: [0.0001, 0.001],
    text: 'La barrera más fina: retiene sales disueltas, metales pesados, virus y bacterias. Ideal para agua potable, embotellada y agua de proceso de alta pureza.',
  },
  {
    key: 'nf',
    name: 'Nanofiltración',
    range: [0.001, 0.01],
    text: 'Separación molecular precisa: elimina dureza, color, materia orgánica e iones multivalentes, dejando pasar parte de las sales monovalentes.',
  },
  {
    key: 'uf',
    name: 'Ultrafiltración',
    range: [0.01, 0.1],
    text: 'Remueve partículas suspendidas, coloides, bacterias y la mayoría de virus. Excelente pretratamiento para ósmosis inversa.',
  },
  {
    key: 'media',
    name: 'Medios filtrantes',
    range: [1, 100],
    text: 'Arena, multimedia, carbón y resinas especializadas para sedimentos, turbidez, cloro, olores y — con resinas de intercambio iónico — ablandamiento.',
  },
];

const CONTAMINANTS = [
  { name: 'Sales disueltas', range: [0.0001, 0.001], row: 0 },
  { name: 'Metales pesados', range: [0.0002, 0.002], row: 1 },
  { name: 'Virus', range: [0.02, 0.3], row: 0 },
  { name: 'Coloides', range: [0.01, 1], row: 1 },
  { name: 'Bacterias', range: [0.3, 10], row: 0 },
  { name: 'Sedimentos y arena', range: [10, 100], row: 1 },
];

const TICKS = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100];

export default function FiltrationSpectrum() {
  const [active, setActive] = useState('ro');
  const tech = TECHS.find((t) => t.key === active);
  // Retiene todo lo que sea más grande que su límite inferior de poro
  const removes = (c) => c.range[1] > tech.range[0];

  return (
    <div className="spectrum">
      <div className="spectrum-tabs" role="tablist" aria-label="Tecnologías de filtración">
        {TECHS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === active}
            className={t.key === active ? 'is-active' : ''}
            onClick={() => setActive(t.key)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="spectrum-chart" role="tabpanel" aria-label={tech.name}>
        <div className="spectrum-track">
          {TECHS.map((t) => (
            <div
              key={t.key}
              className={`spectrum-band${t.key === active ? ' is-active' : ''}`}
              style={{ left: `${pos(t.range[0])}%`, width: `${pos(t.range[1]) - pos(t.range[0])}%` }}
              onClick={() => setActive(t.key)}
            >
              <span>{t.name}</span>
            </div>
          ))}
          <div className="spectrum-cutoff" style={{ left: `${pos(tech.range[0])}%` }} />
        </div>

        <div className="spectrum-items">
          {CONTAMINANTS.map((c) => (
            <div
              key={c.name}
              className={`spectrum-item${removes(c) ? ' is-removed' : ''}`}
              style={{
                left: `${pos(c.range[0])}%`,
                width: `${pos(c.range[1]) - pos(c.range[0])}%`,
                top: `${c.row * 44}px`,
              }}
            >
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        <div className="spectrum-axis" aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} style={{ left: `${pos(t)}%` }}>{t} µm</span>
          ))}
        </div>
      </div>

      <div className="spectrum-info" aria-live="polite">
        <div>
          <p className="spectrum-range">
            {tech.range[0]} – {tech.range[1]} µm
          </p>
          <h3>{tech.name}</h3>
          <p>{tech.text}</p>
        </div>
        <ul>
          {CONTAMINANTS.map((c) => (
            <li key={c.name} className={removes(c) ? 'ok' : 'no'}>
              <span aria-hidden="true">{removes(c) ? '✓' : '—'}</span>
              {c.name}
              <span className="sr-only">{removes(c) ? ' (retenido)' : ' (no retenido)'}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="spectrum-note">Escala aproximada con fines ilustrativos. El sistema adecuado depende del análisis de tu agua.</p>
    </div>
  );
}
