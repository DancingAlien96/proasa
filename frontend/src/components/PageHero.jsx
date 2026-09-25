// Cabecera oscura para páginas internas, con ilustración opcional a la derecha
export default function PageHero({ eyebrow, title, lead, art, children, accent }) {
  return (
    <section className="page-hero" style={accent ? { '--accent-brand': accent } : undefined}>
      <div className="page-hero-glow" aria-hidden="true" />
      <div className={`container page-hero-grid${art ? '' : ' no-art'}`}>
        <div className="page-hero-copy">
          {eyebrow && (
            <p className="chip chip-dark">
              <span className="chip-dot" /> {eyebrow}
            </p>
          )}
          <h1>{title}</h1>
          {lead && <p className="page-hero-lead">{lead}</p>}
          {children}
        </div>
        {art && <div className="page-hero-art">{art}</div>}
      </div>
    </section>
  );
}
