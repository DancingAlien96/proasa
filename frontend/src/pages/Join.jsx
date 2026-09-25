import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { NetworkMap } from '../components/Illustrations.jsx';
import { api } from '../lib/api.js';
import { COUNTRIES } from '../lib/countries.js';
import { useSettings } from '../lib/settings.jsx';
import { usePageTitle } from '../lib/usePageTitle.js';

const YEARS = ['0-2 años', '3-5 años', '6-10 años', 'Más de 10 años'];
const COVERAGE = ['Local', 'Regional', 'Nacional', 'Internacional'];
const INTERESTS = [
  'Sistemas de bombeo',
  'Filtración de agua',
  'Piscinas y accesorios',
  'Energías renovables',
  'Otros',
];

const EMPTY = {
  company_legal_name: '',
  trade_name: '',
  nit: '',
  office_phone: '',
  company_email: '',
  website: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Guatemala',
  contact_name: '',
  contact_position: '',
  contact_phone: '',
  contact_email: '',
  years_experience: YEARS[0],
  current_products: '',
  coverage: '',
  interests: [],
  website_confirm: '', // honeypot
};

const STEPS = [
  {
    title: 'Empresa',
    hint: 'Datos legales y comerciales',
    fields: ['company_legal_name', 'trade_name', 'nit', 'office_phone', 'company_email', 'website'],
  },
  {
    title: 'Ubicación',
    hint: 'Dónde opera tu empresa',
    fields: ['address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country'],
  },
  {
    title: 'Contacto',
    hint: 'Representante legal o contacto principal',
    fields: ['contact_name', 'contact_position', 'contact_phone', 'contact_email'],
  },
  {
    title: 'Experiencia',
    hint: 'Capacidad de distribución e intereses',
    fields: ['years_experience', 'current_products', 'coverage', 'interests'],
  },
];

const REQUIRED = ['company_legal_name', 'trade_name', 'nit', 'contact_name', 'contact_position'];
const EMAILS = ['company_email', 'contact_email'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep(step, form) {
  const errors = {};
  for (const name of STEPS[step].fields) {
    const value = typeof form[name] === 'string' ? form[name].trim() : form[name];
    if (REQUIRED.includes(name) && !value) errors[name] = 'Este campo es obligatorio';
    if (EMAILS.includes(name) && value && !EMAIL_RE.test(value)) errors[name] = 'Correo electrónico inválido';
  }
  return errors;
}

function Field({ label, name, type = 'text', form, errors, onChange, autoComplete, full, placeholder }) {
  const id = `f-${name}`;
  const required = REQUIRED.includes(name);
  return (
    <div className={`field${full ? ' field-full' : ''}${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {required ? <span className="req" aria-hidden="true">*</span> : <span className="opt">opcional</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={form[name]}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${id}-err` : undefined}
      />
      {errors[name] && <small id={`${id}-err`} className="field-error">{errors[name]}</small>}
    </div>
  );
}

export default function Join() {
  usePageTitle('Sé distribuidor');
  const { phone, email, address, whatsapp } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');
  const cardRef = useRef(null);

  const focusFirstError = () =>
    requestAnimationFrame(() => cardRef.current?.querySelector('[aria-invalid="true"]')?.focus());

  const goTo = (n) => {
    setStep(n);
    setMessage('');
    requestAnimationFrame(() => {
      const top = cardRef.current.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      cardRef.current.querySelector('input, select, textarea')?.focus({ preventScroll: true });
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  };

  const toggleInterest = (value) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(value)
        ? f.interests.filter((i) => i !== value)
        : [...f.interests, value],
    }));

  const next = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();
    goTo(step + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();

    // Validar todos los pasos antes de enviar
    for (let s = 0; s < STEPS.length; s++) {
      const errs = validateStep(s, form);
      if (Object.keys(errs).length) {
        setErrors(errs);
        setStep(s);
        return focusFirstError();
      }
    }

    setStatus('sending');
    setMessage('');
    try {
      await api('/distributors', { method: 'POST', body: form });
      setStatus('sent');
      setForm(EMPTY);
      setErrors({});
      setStep(0);
    } catch (err) {
      setStatus('error');
      const details = err.details ?? {};
      setErrors(details);
      setMessage(err.message);
      const bad = STEPS.findIndex((s) => s.fields.some((f) => details[f]));
      if (bad >= 0) setStep(bad);
      focusFirstError();
    }
  };

  const fieldProps = { form, errors, onChange };
  const progress = status === 'sent' ? 100 : (step / STEPS.length) * 100;

  return (
    <>
      <PageHero
        eyebrow="Red de distribuidores"
        title={
          <>
            Crece con <em>PROASA</em>
          </>
        }
        lead="Buscamos socios estratégicos que lleven soluciones de filtración de agua a más regiones de Guatemala y Centroamérica."
        art={<NetworkMap className="page-hero-svg" />}
      >
        <ul className="hero-checks">
          <li>Capacitación técnica continua</li>
          <li>Soporte de marketing</li>
          <li>Precios preferenciales</li>
          <li>Respaldo completo de marca</li>
        </ul>
      </PageHero>

      <section className="section">
        <div className="container join-grid">
          <aside className="join-side">
            <ol className="stepper" aria-label="Pasos del formulario">
              {STEPS.map((s, i) => {
                const state = status === 'sent' || i < step ? 'done' : i === step ? 'current' : 'todo';
                return (
                  <li key={s.title} className={`stepper-item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                    <span className="stepper-dot">{state === 'done' ? '✓' : i + 1}</span>
                    <span>
                      <strong>{s.title}</strong>
                      <small>{s.hint}</small>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="contact-card">
              <h2>¿Prefieres hablar primero?</h2>
              <dl>
                <dt>Teléfono</dt>
                <dd><a href={`tel:+502${phone.replace(/\s/g, '')}`}>+502 {phone}</a></dd>
                <dt>Correo</dt>
                <dd><a href={`mailto:${email}`}>{email}</a></dd>
                <dt>Oficina</dt>
                <dd>{address}</dd>
              </dl>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
                Escribir por WhatsApp
              </a>
            </div>
          </aside>

          <div className="form-card" ref={cardRef}>
            <div className="form-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>

            {status === 'sent' ? (
              <div className="form-success" role="status">
                <div className="success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <h2>¡Solicitud enviada!</h2>
                <p>Gracias por tu interés en formar parte de la red PROASA. Nuestro equipo revisará tu información y se pondrá en contacto contigo pronto.</p>
                <div className="hero-actions">
                  <Link to="/" className="btn btn-dark">Volver al inicio</Link>
                  <button className="btn btn-outline" onClick={() => setStatus('idle')}>Enviar otra solicitud</button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="form-step-label">Paso {step + 1} de {STEPS.length}</p>
                <h2>{STEPS[step].title}</h2>
                <p className="muted">{STEPS[step].hint}</p>

                {step === 0 && (
                  <div className="form-grid">
                    <Field label="Nombre de la empresa / razón social" name="company_legal_name" full autoComplete="organization" {...fieldProps} />
                    <Field label="Nombre comercial" name="trade_name" {...fieldProps} />
                    <Field label="NIT" name="nit" placeholder="1234567-8" {...fieldProps} />
                    <Field label="Teléfono de oficina" name="office_phone" type="tel" {...fieldProps} />
                    <Field label="Correo electrónico principal" name="company_email" type="email" {...fieldProps} />
                    <Field label="Página web" name="website" type="url" full placeholder="https://" {...fieldProps} />
                  </div>
                )}

                {step === 1 && (
                  <div className="form-grid">
                    <Field label="Dirección" name="address_line1" full autoComplete="address-line1" {...fieldProps} />
                    <Field label="Apartamento, oficina, etc." name="address_line2" full autoComplete="address-line2" {...fieldProps} />
                    <Field label="Ciudad" name="city" autoComplete="address-level2" {...fieldProps} />
                    <Field label="Departamento / Estado" name="state" autoComplete="address-level1" {...fieldProps} />
                    <Field label="Código postal" name="postal_code" autoComplete="postal-code" {...fieldProps} />
                    <div className="field">
                      <label htmlFor="f-country">País</label>
                      <select id="f-country" name="country" value={form.country} onChange={onChange} autoComplete="country-name">
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-grid">
                    <Field label="Nombre completo" name="contact_name" autoComplete="name" {...fieldProps} />
                    <Field label="Cargo" name="contact_position" autoComplete="organization-title" {...fieldProps} />
                    <Field label="Teléfono personal / WhatsApp" name="contact_phone" type="tel" autoComplete="tel" {...fieldProps} />
                    <Field label="Correo electrónico" name="contact_email" type="email" autoComplete="email" {...fieldProps} />
                  </div>
                )}

                {step === 3 && (
                  <>
                    <div className="field field-full">
                      <span className="label" id="years-label">Años de experiencia en el rubro</span>
                      <div className="choices" role="radiogroup" aria-labelledby="years-label">
                        {YEARS.map((y) => (
                          <label key={y} className="choice">
                            <input type="radio" name="years_experience" value={y} checked={form.years_experience === y} onChange={onChange} />
                            {y}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field field-full">
                      <span className="label" id="coverage-label">Cobertura geográfica actual</span>
                      <div className="choices" role="radiogroup" aria-labelledby="coverage-label">
                        {COVERAGE.map((c) => (
                          <label key={c} className="choice">
                            <input type="radio" name="coverage" value={c} checked={form.coverage === c} onChange={onChange} />
                            {c}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field field-full">
                      <span className="label" id="interests-label">Interés en distribuir productos PROASA</span>
                      <div className="choices" role="group" aria-labelledby="interests-label">
                        {INTERESTS.map((i) => (
                          <label key={i} className="choice">
                            <input type="checkbox" checked={form.interests.includes(i)} onChange={() => toggleInterest(i)} />
                            {i}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field field-full">
                      <label htmlFor="f-current_products">
                        Productos que actualmente distribuye <span className="opt">opcional</span>
                      </label>
                      <textarea id="f-current_products" name="current_products" rows="4" value={form.current_products} onChange={onChange} />
                    </div>
                  </>
                )}

                {/* Honeypot anti-spam, oculto para personas */}
                <div className="hp" aria-hidden="true">
                  <label>
                    No llenar
                    <input name="website_confirm" tabIndex={-1} autoComplete="off" value={form.website_confirm} onChange={onChange} />
                  </label>
                </div>

                {message && <div className="alert alert-error" role="alert">{message}</div>}

                <div className="form-nav">
                  {step > 0 ? (
                    <button type="button" className="btn btn-outline" onClick={() => goTo(step - 1)}>
                      ← Atrás
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="submit" className="btn btn-dark" disabled={status === 'sending'}>
                    {step < STEPS.length - 1 ? 'Continuar →' : status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
