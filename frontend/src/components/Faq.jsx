import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api.js';
import { useSettings } from '../lib/settings.jsx';
import { Reveal } from './Reveal.jsx';

export default function Faq() {
  const { data: faqs, error } = useApi('/faqs');
  const { whatsapp } = useSettings();
  const [openId, setOpenId] = useState(null);

  const current = openId ?? faqs?.[0]?.id;

  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <Reveal className="faq-side">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 className="h2">
            Resolvemos tus <em>dudas</em>
          </h2>
          <p>¿No encuentras lo que buscas? Nuestro equipo técnico te responde directamente.</p>
          <div className="faq-contact">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Preguntar por WhatsApp
            </a>
            <Link to="/unete" className="link-arrow">Ser distribuidor →</Link>
          </div>
        </Reveal>

        <div className="faq-list">
          {error && <p className="muted">No se pudieron cargar las preguntas frecuentes.</p>}
          {faqs?.map((f, i) => {
            const isOpen = current === f.id;
            return (
              <Reveal key={f.id} delay={i * 60} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    aria-expanded={isOpen}
                    aria-controls={`faq-${f.id}`}
                    onClick={() => setOpenId(isOpen ? -1 : f.id)}
                  >
                    <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-q">{f.question}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${f.id}`} className="faq-answer" role="region" aria-hidden={!isOpen}>
                  <div>
                    <p>{f.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
