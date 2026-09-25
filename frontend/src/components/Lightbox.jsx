import { useEffect, useRef } from 'react';

// Visor de fotos a pantalla completa: Esc cierra, ← → navegan
export default function Lightbox({ images, index, onClose, onChange }) {
  const closeRef = useRef(null);
  const touch = useRef(null);
  const img = images[index];
  const prev = () => onChange((index - 1 + images.length) % images.length);
  const next = () => onChange((index + 1) % images.length);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${images.length}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touch.current ?? 0);
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
      }}
    >
      <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="Cerrar">✕</button>
      {images.length > 1 && (
        <>
          <button className="lightbox-nav is-prev" onClick={prev} aria-label="Foto anterior">‹</button>
          <button className="lightbox-nav is-next" onClick={next} aria-label="Foto siguiente">›</button>
        </>
      )}
      <figure className="lightbox-figure">
        <img key={img.url} src={img.url} alt={img.caption ?? ''} width={img.width} height={img.height} />
        <figcaption>
          <span>{img.caption}</span>
          <span className="lightbox-count">{index + 1} / {images.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}
