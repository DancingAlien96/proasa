// Ilustraciones vectoriales propias de PROASA (sin fotos de stock)
import { useId } from 'react';

// Generador pseudoaleatorio determinista: mismas ilustraciones en cada render
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spiralPath(cx, cy, rx, ry, turns = 7) {
  const pts = [];
  const steps = turns * 48;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = 0.1 + (0.9 * i) / steps;
    pts.push(`${(cx + Math.cos(t) * r * rx).toFixed(1)},${(cy + Math.sin(t) * r * ry).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

/* ------------------------------------------------------------------ */
/* Cartucho de membrana de ósmosis inversa en corte (hero)             */
/* ------------------------------------------------------------------ */
export function MembraneHero({ className }) {
  const id = useId().replace(/:/g, '');
  const rand = rng(7);
  const feed = Array.from({ length: 16 }, (_, i) => ({
    y: 200 + rand() * 120,
    r: 3 + rand() * 5,
    c: ['#c98a4b', '#8f7a5a', '#a3b1a0', '#d4a373', '#7c8b99'][i % 5],
    d: (i * 0.37) % 4,
  }));
  const drops = Array.from({ length: 7 }, (_, i) => ({ d: i * 0.55, y: 252 + (i % 3) * 6 }));

  return (
    <svg className={className} viewBox="0 56 600 400" role="img" aria-label="Membrana de ósmosis inversa en corte, con agua contaminada entrando y agua pura saliendo">
      <defs>
        <radialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#19c3d6" stopOpacity=".45" />
          <stop offset="1" stopColor="#19c3d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff6ff" />
          <stop offset=".22" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#b9dcf0" />
          <stop offset="1" stopColor="#5d8fb3" />
        </linearGradient>
        <linearGradient id={`${id}band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3aa7ff" />
          <stop offset=".3" stopColor="#8fd3ff" />
          <stop offset="1" stopColor="#0d4f9e" />
        </linearGradient>
        <linearGradient id={`${id}cap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1463ff" />
          <stop offset="1" stopColor="#0a2f6b" />
        </linearGradient>
        <linearGradient id={`${id}tube`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9f4fb" />
          <stop offset=".4" stopColor="#ffffff" />
          <stop offset="1" stopColor="#7aa4c4" />
        </linearGradient>
        <linearGradient id={`${id}sheet`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#19c3d6" />
          <stop offset="1" stopColor="#1463ff" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <path d="M160 182 H470 A46 78 0 0 1 470 338 H160 Z" />
        </clipPath>
      </defs>

      <circle cx="320" cy="260" r="250" fill={`url(#${id}glow)`} />
      <g className="ring-spin" style={{ transformOrigin: '320px 260px' }}>
        <circle cx="320" cy="260" r="210" fill="none" stroke="#7ef0d8" strokeOpacity=".25" strokeDasharray="2 10" />
      </g>
      <circle cx="320" cy="260" r="170" fill="none" stroke="#fff" strokeOpacity=".08" />

      {/* Agua de alimentación (contaminada) */}
      <g>
        {feed.map((p, i) => (
          <circle key={i} className="feed-particle" cx="40" cy={p.y} r={p.r} fill={p.c} style={{ animationDelay: `${p.d}s` }} />
        ))}
      </g>

      {/* Cuerpo del cartucho */}
      <path d="M160 182 H470 A46 78 0 0 1 470 338 H160 Z" fill={`url(#${id}body)`} />
      <g clipPath={`url(#${id}clip)`}>
        {/* Ventana en corte: láminas de membrana enrolladas */}
        <rect x="270" y="170" width="140" height="180" fill="#0b2a47" />
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M270 ${186 + i * 13} C 310 ${178 + i * 13}, 360 ${196 + i * 13}, 410 ${186 + i * 13}`}
            stroke={`url(#${id}sheet)`}
            strokeOpacity={0.35 + (i % 3) * 0.2}
            strokeWidth="5"
            fill="none"
          />
        ))}
        <rect x="270" y="170" width="140" height="180" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
        <rect x="160" y="170" width="34" height="180" fill={`url(#${id}band)`} />
        <rect x="436" y="170" width="40" height="180" fill={`url(#${id}band)`} />
        <rect x="160" y="196" width="340" height="3" fill="#fff" opacity=".7" />
      </g>

      {/* Tubo de permeado (agua pura) */}
      <rect x="500" y="246" width="64" height="28" rx="4" fill={`url(#${id}tube)`} />
      <ellipse cx="564" cy="260" rx="6" ry="14" fill="#0d4f9e" />
      {drops.map((d, i) => (
        <path
          key={i}
          className="clean-drop"
          d="M0 -9 C 5 -2, 7 3, 0 8 C -7 3, -5 -2, 0 -9 Z"
          transform={`translate(572 ${d.y})`}
          fill="#7ef0d8"
          style={{ animationDelay: `${d.d}s` }}
        />
      ))}

      {/* Tapa frontal con la espiral de membrana */}
      <ellipse cx="160" cy="260" rx="46" ry="78" fill={`url(#${id}cap)`} />
      <ellipse cx="160" cy="260" rx="40" ry="70" fill="#0b2a47" />
      <path d={spiralPath(160, 260, 38, 67)} fill="none" stroke="#19c3d6" strokeWidth="1.6" strokeOpacity=".9" />
      <ellipse cx="160" cy="260" rx="6" ry="10" fill="#dff6ff" />
      <ellipse cx="160" cy="260" rx="46" ry="78" fill="none" stroke="#8fd3ff" strokeWidth="2" />

      {/* Etiquetas */}
      <g className="float-a">
        <rect x="300" y="84" width="176" height="52" rx="14" fill="#ffffff" fillOpacity=".1" stroke="#ffffff" strokeOpacity=".25" />
        <circle cx="324" cy="110" r="8" fill="#7ef0d8" />
        <text x="342" y="106" fill="#fff" fontFamily="Sora, sans-serif" fontSize="14" fontWeight="600">Ósmosis inversa</text>
        <text x="342" y="124" fill="#a9c3d9" fontFamily="Inter, sans-serif" fontSize="12">Poros ~0.0001 µm</text>
      </g>
      <g className="float-b">
        <rect x="390" y="378" width="176" height="52" rx="14" fill="#ffffff" fillOpacity=".1" stroke="#ffffff" strokeOpacity=".25" />
        <path d="M414 394 c5 7 8 11 0 18 c-8 -7 -5 -11 0 -18z" fill="#19c3d6" />
        <text x="432" y="400" fill="#fff" fontFamily="Sora, sans-serif" fontSize="14" fontWeight="600">Agua purificada</text>
        <text x="432" y="418" fill="#a9c3d9" fontFamily="Inter, sans-serif" fontSize="12">Salida de permeado</text>
      </g>
      <g className="float-c">
        <rect x="16" y="360" width="160" height="52" rx="14" fill="#ffffff" fillOpacity=".1" stroke="#ffffff" strokeOpacity=".25" />
        <circle cx="38" cy="380" r="4" fill="#c98a4b" />
        <circle cx="47" cy="390" r="3" fill="#a3b1a0" />
        <circle cx="36" cy="392" r="3" fill="#8f7a5a" />
        <text x="58" y="382" fill="#fff" fontFamily="Sora, sans-serif" fontSize="14" fontWeight="600">Agua cruda</text>
        <text x="58" y="400" fill="#a9c3d9" fontFamily="Inter, sans-serif" fontSize="12">Sales y metales</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Perlas de resina de intercambio iónico (Sunresin)                  */
/* ------------------------------------------------------------------ */
export function ResinBeads({ className }) {
  const id = useId().replace(/:/g, '');
  const rand = rng(21);
  const beads = [];
  let tries = 0;
  while (beads.length < 60 && tries < 4000) {
    tries++;
    const r = 10 + rand() * 30;
    const x = 40 + rand() * 480;
    const y = 40 + rand() * 360;
    // Mantener las perlas dentro de un óvalo y sin solaparse demasiado
    const ox = (x - 280) / 250;
    const oy = (y - 220) / 190;
    if (ox * ox + oy * oy > 1) continue;
    if (beads.some((b) => Math.hypot(b.x - x, b.y - y) < (b.r + r) * 0.92)) continue;
    beads.push({ x, y, r, v: Math.floor(rand() * 3) });
  }
  beads.sort((a, b) => a.r - b.r);

  return (
    <svg className={className} viewBox="0 0 560 440" role="img" aria-label="Perlas de resina de intercambio iónico">
      <defs>
        {[
          ['#fff3cf', '#f5b43c', '#b8650d'],
          ['#fffaf0', '#f3cf82', '#c9892e'],
          ['#ffe7c2', '#e98f2e', '#8a4309'],
        ].map(([a, b, c], i) => (
          <radialGradient key={i} id={`${id}b${i}`} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor={a} />
            <stop offset=".45" stopColor={b} />
            <stop offset="1" stopColor={c} />
          </radialGradient>
        ))}
        <radialGradient id={`${id}bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f5b43c" stopOpacity=".35" />
          <stop offset="1" stopColor="#f5b43c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="280" cy="220" rx="280" ry="220" fill={`url(#${id}bg)`} />
      {beads.map((b, i) => (
        <g key={i} className={i % 5 === 0 ? 'bead-bob' : undefined} style={{ animationDelay: `${(i % 7) * 0.4}s` }}>
          <circle cx={b.x} cy={b.y + b.r * 0.15} r={b.r} fill="#000" opacity=".12" />
          <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#${id}b${b.v})`} />
          <ellipse cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.4} rx={b.r * 0.28} ry={b.r * 0.16} fill="#fff" opacity=".85" transform={`rotate(-30 ${b.x - b.r * 0.35} ${b.y - b.r * 0.4})`} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Rack de vasos de presión con membranas (Vontron)                   */
/* ------------------------------------------------------------------ */
export function MembraneRack({ className }) {
  const id = useId().replace(/:/g, '');
  const rows = [110, 190, 270];
  return (
    <svg className={className} viewBox="0 0 560 420" role="img" aria-label="Rack de membranas de ósmosis inversa">
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7f5ff" />
          <stop offset=".25" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#9cc6e6" />
          <stop offset="1" stopColor="#4f7fa6" />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d4f9e" />
          <stop offset=".5" stopColor="#3aa7ff" />
          <stop offset="1" stopColor="#0d4f9e" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#1463ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#1463ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="280" cy="210" rx="280" ry="200" fill={`url(#${id}g)`} />
      {/* Estructura */}
      <rect x="70" y="70" width="12" height="290" rx="3" fill="#0b2a47" />
      <rect x="478" y="70" width="12" height="290" rx="3" fill="#0b2a47" />
      <rect x="60" y="354" width="440" height="14" rx="4" fill="#0b2a47" />
      {/* Colectores verticales */}
      <rect x="100" y="90" width="22" height="220" rx="6" fill={`url(#${id}p)`} />
      <rect x="438" y="90" width="22" height="220" rx="6" fill={`url(#${id}p)`} />
      {rows.map((y, i) => (
        <g key={y}>
          <rect x="122" y={y - 26} width="316" height="52" rx="26" fill={`url(#${id}v)`} />
          <rect x="150" y={y - 26} width="10" height="52" fill="#1463ff" opacity=".85" />
          <rect x="400" y={y - 26} width="10" height="52" fill="#1463ff" opacity=".85" />
          <rect x="230" y={y - 12} width="100" height="24" rx="5" fill="#0b2a47" opacity=".85" />
          <text x="280" y={y + 5} textAnchor="middle" fill="#7ef0d8" fontFamily="Sora, sans-serif" fontSize="12" fontWeight="600">
            RO · {String(i + 1).padStart(2, '0')}
          </text>
          <path className="flow-line" d={`M170 ${y + 16} H390`} stroke="#19c3d6" strokeWidth="2" strokeDasharray="4 10" />
        </g>
      ))}
      {/* Manómetro */}
      <circle cx="111" cy="60" r="22" fill="#fff" stroke="#0b2a47" strokeWidth="5" />
      <path d="M111 60 L124 50" stroke="#e5484d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="111" cy="60" r="3" fill="#0b2a47" />
      {/* Salida */}
      <path d="M460 300 H520 V390" fill="none" stroke={`url(#${id}p)`} strokeWidth="14" strokeLinecap="round" />
      <path className="flow-line" d="M466 300 H520 V390" fill="none" stroke="#7ef0d8" strokeWidth="2" strokeDasharray="4 10" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Escena industrial                                                  */
/* ------------------------------------------------------------------ */
export function IndustryScene({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 560 340" role="img" aria-label="Planta industrial con tanques de agua tratada" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2a47" />
          <stop offset="1" stopColor="#12406b" />
        </linearGradient>
        <linearGradient id={`${id}tank`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d8fb3" />
          <stop offset=".35" stopColor="#e7f5ff" />
          <stop offset="1" stopColor="#4f7fa6" />
        </linearGradient>
      </defs>
      <rect width="560" height="340" fill={`url(#${id}sky)`} />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 560} cy={20 + ((i * 53) % 120)} r="1.2" fill="#fff" opacity=".35" />
      ))}
      {/* Nave industrial con techo de sierra */}
      <path d="M20 300 V180 L70 150 V180 L120 150 V180 L170 150 V180 L220 150 V300 Z" fill="#0f3558" />
      {[40, 90, 140, 190].map((x) => (
        <rect key={x} x={x - 8} y="205" width="16" height="30" rx="2" fill="#19c3d6" opacity=".55" />
      ))}
      <rect x="92" y="250" width="40" height="50" fill="#092440" />
      {/* Tanques */}
      {[
        [290, 120, 60],
        [370, 150, 50],
      ].map(([x, top, w]) => (
        <g key={x}>
          <rect x={x - w / 2} y={top} width={w} height={300 - top} fill={`url(#${id}tank)`} />
          <ellipse cx={x} cy={top} rx={w / 2} ry="10" fill="#e7f5ff" />
          <rect x={x - w / 2} y={top + 40} width={w} height="6" fill="#1463ff" opacity=".7" />
          <rect x={x - w / 2} y={top + 100} width={w} height="6" fill="#1463ff" opacity=".7" />
        </g>
      ))}
      {/* Tubería con flujo */}
      <path d="M220 270 H250 V230 H440 V300" fill="none" stroke="#3aa7ff" strokeWidth="10" strokeLinejoin="round" />
      <path className="flow-line" d="M220 270 H250 V230 H440 V300" fill="none" stroke="#7ef0d8" strokeWidth="2.5" strokeDasharray="4 10" />
      {/* Unidad de filtración */}
      <rect x="420" y="190" width="110" height="110" rx="10" fill="#0f3558" stroke="#19c3d6" strokeOpacity=".5" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={432 + i * 32} y="202" width="22" height="86" rx="11" fill={`url(#${id}tank)`} />
      ))}
      <rect x="0" y="300" width="560" height="40" fill="#071d33" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Escena agrícola con pivote de riego                                */
/* ------------------------------------------------------------------ */
export function AgroScene({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 560 340" role="img" aria-label="Campo agrícola con sistema de riego" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfeaf2" />
          <stop offset="1" stopColor="#eaf8f4" />
        </linearGradient>
      </defs>
      <rect width="560" height="340" fill={`url(#${id}sky)`} />
      <circle cx="450" cy="80" r="38" fill="#ffd166" />
      <circle cx="450" cy="80" r="56" fill="#ffd166" opacity=".25" />
      {/* Volcanes al fondo */}
      <path d="M0 200 L90 120 L140 160 L210 90 L300 190 Z" fill="#8cc7b8" />
      <path d="M200 200 L330 110 L420 180 L560 150 V200 Z" fill="#a5d6c8" />
      {/* Parcelas */}
      <path d="M0 190 Q280 160 560 190 V340 H0 Z" fill="#3fa36b" />
      <path d="M0 230 Q280 200 560 232 V340 H0 Z" fill="#2f8d5a" />
      <path d="M0 275 Q280 250 560 276 V340 H0 Z" fill="#23774b" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0 ${238 + i * 11} Q280 ${210 + i * 12} 560 ${240 + i * 11}`} stroke="#1c6b41" strokeWidth="2" fill="none" opacity=".45" />
      ))}
      {/* Pivote de riego */}
      <g>
        <path d="M70 196 L500 206" stroke="#e9f4fb" strokeWidth="4" />
        {Array.from({ length: 10 }, (_, i) => {
          const x = 80 + i * 43;
          const y = 196 + (i * 10) / 43;
          return (
            <g key={i}>
              <path d={`M${x} ${y} L${x + 21} ${y + 16} L${x + 43} ${y}`} stroke="#e9f4fb" strokeWidth="2" fill="none" />
              <circle className="spray" cx={x + 21} cy={y + 24} r="2.5" fill="#19c3d6" style={{ animationDelay: `${(i % 4) * 0.3}s` }} />
              <circle className="spray" cx={x + 14} cy={y + 30} r="2" fill="#19c3d6" style={{ animationDelay: `${(i % 3) * 0.45}s` }} />
            </g>
          );
        })}
        {[70, 285, 500].map((x) => (
          <g key={x}>
            <path d={`M${x} 200 L${x - 12} 250 M${x} 200 L${x + 12} 250`} stroke="#cfe3f0" strokeWidth="3" />
            <circle cx={x - 12} cy="254" r="6" fill="#0b2a47" />
            <circle cx={x + 12} cy="254" r="6" fill="#0b2a47" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Red de distribuidores                                               */
/* ------------------------------------------------------------------ */
export function NetworkMap({ className }) {
  const rand = rng(11);
  const hub = { x: 280, y: 210 };
  const nodes = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + rand() * 0.4;
    const d = 110 + rand() * 90;
    return { x: hub.x + Math.cos(a) * d * 1.25, y: hub.y + Math.sin(a) * d * 0.85, r: 4 + rand() * 4 };
  });
  return (
    <svg className={className} viewBox="0 0 560 420" role="img" aria-label="Red de distribuidores conectados a PROASA">
      <defs>
        <pattern id="net-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#fff" opacity=".12" />
        </pattern>
      </defs>
      <rect width="560" height="420" fill="url(#net-dots)" />
      {nodes.map((n, i) => (
        <path key={i} className="flow-line" d={`M${hub.x} ${hub.y} Q${(hub.x + n.x) / 2} ${(hub.y + n.y) / 2 - 40} ${n.x} ${n.y}`} stroke="#19c3d6" strokeOpacity=".6" strokeWidth="1.5" strokeDasharray="3 7" fill="none" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle className="pulse" cx={n.x} cy={n.y} r={n.r * 2.4} fill="#7ef0d8" opacity=".2" style={{ animationDelay: `${(i % 5) * 0.5}s`, transformOrigin: `${n.x}px ${n.y}px` }} />
          <circle cx={n.x} cy={n.y} r={n.r} fill="#7ef0d8" />
        </g>
      ))}
      <circle className="pulse" cx={hub.x} cy={hub.y} r="46" fill="#1463ff" opacity=".25" style={{ transformOrigin: `${hub.x}px ${hub.y}px` }} />
      <circle cx={hub.x} cy={hub.y} r="30" fill="#1463ff" />
      <path d={`M${hub.x} ${hub.y - 14} c8 10 12 15 0 26 c-12 -11 -8 -16 0 -26z`} fill="#fff" />
      <rect x={hub.x - 78} y={hub.y + 42} width="156" height="30" rx="15" fill="#fff" />
      <text x={hub.x} y={hub.y + 62} textAnchor="middle" fill="#051a2e" fontFamily="Sora, sans-serif" fontSize="13" fontWeight="600">
        PROASA · Chiquimula
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Gota con capas (sección nosotros)                                   */
/* ------------------------------------------------------------------ */
export function DropletLayers({ className }) {
  const id = useId().replace(/:/g, '');
  const drop = 'M240 30 C 300 120, 410 230, 410 330 C 410 430, 330 500, 240 500 C 150 500, 70 430, 70 330 C 70 230, 180 120, 240 30 Z';
  return (
    <svg className={className} viewBox="0 0 480 530" role="img" aria-label="Gota de agua con capas de filtración">
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ef0d8" />
          <stop offset="1" stopColor="#1463ff" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={drop} />
        </clipPath>
      </defs>
      <path d={drop} fill={`url(#${id}d)`} />
      <g clipPath={`url(#${id}c)`}>
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            className={`wave wave-${i}`}
            d={`M-200 ${250 + i * 60} q 60 -24 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 V 600 H -200 Z`}
            fill="#051a2e"
            opacity={0.12 + i * 0.1}
          />
        ))}
        {[
          [170, 150, 1],
          [300, 210, 0.8],
          [210, 300, 0.9],
          [320, 380, 0.7],
          [150, 400, 0.75],
        ].map(([x, y, s], i) => (
          <g key={i} className="bead-bob" transform={`translate(${x} ${y}) scale(${s})`} style={{ animationDelay: `${i * 0.6}s` }}>
            <circle r="16" fill="#fff" opacity=".9" />
            <circle cx="-17" cy="12" r="9" fill="#fff" opacity=".7" />
            <circle cx="17" cy="12" r="9" fill="#fff" opacity=".7" />
          </g>
        ))}
      </g>
      <path d="M170 150 C 150 190, 130 230, 128 280" stroke="#fff" strokeWidth="10" strokeLinecap="round" fill="none" opacity=".45" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Glifos de tecnologías                                               */
/* ------------------------------------------------------------------ */
export function TechGlyph({ type, className }) {
  const pores = { uf: 6, nf: 10, ro: 16 }[type];
  if (pores) {
    return (
      <svg className={className} viewBox="0 0 120 80" aria-hidden="true">
        <rect x="56" y="4" width="8" height="72" rx="4" fill="currentColor" opacity=".25" />
        {Array.from({ length: pores }, (_, i) => (
          <rect key={i} x="56" y={6 + (i * 68) / pores} width="8" height={Math.max(1, 20 / pores)} fill="#fff" />
        ))}
        {[14, 30, 46, 22, 38].map((y, i) => (
          <circle key={i} cx={20 + (i % 3) * 10} cy={y + 6} r={3 + (i % 3)} fill="currentColor" opacity=".7" />
        ))}
        {[18, 40, 60].map((y, i) => (
          <path key={i} d={`M${86 + i * 8} ${y} c3 4 4 6 0 9 c-4 -3 -3 -5 0 -9z`} fill="#7ef0d8" />
        ))}
      </svg>
    );
  }
  if (type === 'media') {
    return (
      <svg className={className} viewBox="0 0 120 80" aria-hidden="true">
        <rect x="36" y="4" width="48" height="72" rx="10" fill="currentColor" opacity=".2" />
        {[
          [18, 3, '#f5b43c'],
          [36, 2.6, '#0b2a47'],
          [54, 2, '#fff'],
        ].map(([y, r, c], row) =>
          Array.from({ length: 7 }, (_, i) => (
            <circle key={`${row}-${i}`} cx={44 + i * 5.5} cy={y + (i % 2) * 5} r={r} fill={c} opacity=".9" />
          ))
        )}
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 120 80" aria-hidden="true">
      <path d="M10 30 H70 a20 20 0 0 1 20 20 V76" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="18" />
      <path d="M10 30 H70 a20 20 0 0 1 20 20 V76" fill="none" stroke="#7ef0d8" strokeWidth="2" strokeDasharray="4 8" className="flow-line" />
      <rect x="40" y="16" width="10" height="28" rx="2" fill="currentColor" />
      <circle cx="100" cy="16" r="10" fill="none" stroke="#7ef0d8" strokeWidth="3" />
      <path d="M95 16 l4 4 l7 -8" stroke="#7ef0d8" strokeWidth="3" fill="none" />
    </svg>
  );
}

/* Elige la ilustración de cada marca */
export function BrandArt({ slug, className }) {
  if (slug === 'sunresin') return <ResinBeads className={className} />;
  return <MembraneRack className={className} />;
}
