import { useEffect, useState } from 'react';

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`scroll-top${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
    >
      <svg width="14" height="14" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M1 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
