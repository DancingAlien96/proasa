import { useEffect, useRef, useState } from 'react';

function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView];
}

// Aparece con un leve desplazamiento cuando entra en pantalla
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal${inView ? ' is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Anima la parte numérica de valores como "130+", "70M+" o "2001"
export function CountUp({ value }) {
  const [ref, inView] = useInView();
  const match = String(value).match(/^(\D*)(\d+)(.*)$/);
  const target = match ? Number(match[2]) : 0;
  const isYear = target > 1900 && target < 2100;
  // El valor real se muestra de entrada (SEO, capturas); solo se anima al entrar en pantalla
  const [n, setN] = useState(target);

  useEffect(() => {
    if (!inView || !match || isYear) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1400);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {match[1]}
      {n}
      {match[3]}
    </span>
  );
}
