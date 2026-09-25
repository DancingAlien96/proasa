-- Contenido inicial tomado de proasa.com.gt
-- Idempotente: se puede correr varias veces.

INSERT INTO settings (key, value) VALUES
  ('phone', '3627 7208'),
  ('whatsapp', '50236277208'),
  ('email', 'info@proasa.com.gt'),
  ('address', '8va. Avenida Calzada Dos Hector Zona 2 Chiquimula Guatemala')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- FAQs
DELETE FROM faqs;
INSERT INTO faqs (question, answer, sort_order) VALUES
('¿Qué tipos de sistemas de filtración ofrecen?',
 'En PROASA distribuimos una amplia gama de sistemas especializados para diferentes necesidades: membranas de nanofiltración para separación molecular precisa, sistemas de ultrafiltración para remoción de partículas suspendidas, equipos de osmosis inversa para purificación total, medios filtrantes especializados y tuberías certificadas. Trabajamos con marcas reconocidas internacionalmente que garantizan la más alta calidad y eficiencia en cada aplicación.', 1),
('¿Cómo saber qué sistema de filtración necesito para mi proyecto?',
 'Nuestro equipo técnico realiza un análisis completo de sus necesidades específicas, evaluando la calidad del agua actual, el volumen a tratar, los contaminantes presentes y los objetivos de purificación. Basándose en estos factores, recomendamos la solución más eficiente y costo-efectiva. Ofrecemos consultoría técnica gratuita para garantizar que seleccione el sistema ideal para su industria o aplicación agrícola.', 2),
('¿Trabajan con industrias específicas?',
 'Sí, nos especializamos en brindar soluciones tanto para el sector industrial como agrícola. En la industria atendemos sectores como alimentos y bebidas, textil, farmacéutica, química y manufactura general. En agricultura, ofrecemos sistemas para irrigación, tratamiento de agua para ganado y procesamiento de productos agrícolas. Cada sector tiene requerimientos únicos que abordamos con tecnología especializada.', 3),
('¿Cómo puedo convertirme en distribuidor de PROASA?',
 'Buscamos socios estratégicos comprometidos con la excelencia en tratamiento de agua. Para ser distribuidor, evaluamos su experiencia en el sector, cobertura geográfica, capacidad técnica y compromiso comercial. Ofrecemos capacitación técnica continua, soporte de marketing, precios preferenciales y respaldo completo. Si está interesado en expandir nuestra red de distribución, contáctenos para evaluar las oportunidades de colaboración en su región.', 4);

-- Marcas
INSERT INTO brands (slug, name, company_name, hero_image, intro_lead, intro_body, pillars, quote, mission, mission_image, sort_order)
VALUES (
  'vontron', 'Vontron', 'Vontron Technology Co., Ltd',
  '/images/vontron-portada.jpg',
  'VONTRON TECHNOLOGY CO., LTD., del grupo CRRC (código 000920), es líder global en membranas de ósmosis inversa, con más de 26 años en investigación, producción y ventas —desde su base en Guiyang— y presencia en más de 130 países.',
  ARRAY[
    'El negocio principal de VONTRON son las membranas, con más de 20 años de experiencia en la fabricación de membranas de separación. Como fabricante de referencia nacional de membranas de ósmosis inversa, VONTRON se especializa en I+D, fabricación y servicio técnico de membranas y elementos de ósmosis inversa (OI), nanofiltración (NF) y ultrafiltración (UF), y posee las tecnologías clave en la fabricación de membranas y una sólida capacidad de diseño de sistemas. Los productos de VONTRON se venden ampliamente en más de 130 países y regiones.',
    'VONTRON ha desarrollado más de 20 series y más de 200 especificaciones de membranas, incluyendo membranas de desalinización, membranas resistentes a la incrustación, membranas resistentes a la oxidación, membranas de nanofiltración, membranas de ultrafiltración, membranas de separación especiales y membranas residenciales.',
    'Estas membranas son aplicables a agua embotellada, agua potable municipal, agua pura industrial, agua de alta pureza para electricidad, desalinización de agua de mar, desalinización de agua salobre, reutilización de aguas residuales, separación de agua de alta salinidad con emisiones casi nulas, producción de alimentos y bebidas, fabricación farmacéutica, separación y purificación de materiales, entre otras aplicaciones. VONTRON es actualmente el mayor fabricante y proveedor de servicios de membranas de ósmosis inversa de tipo seco de China.'
  ],
  '[
    {"title": "Profesionalismo y Experiencia", "list": false, "items": ["Con más de 26 años en investigación y desarrollo, Vontron se ha consolidado como líder mundial en membranas de separación. Nuestro equipo combina innovación, conocimiento científico y experiencia industrial para ofrecer soluciones confiables en el tratamiento de agua a nivel global."]},
    {"title": "Estrategias Comprobadas", "list": false, "items": ["No solo hablamos de calidad: la garantizamos. Nuestras membranas han sido probadas en más de 70 millones de usuarios en 130 países, cumpliendo con rigurosos estándares internacionales como ISO, NSF, CNAS y RoHS. Cada solución está diseñada para maximizar eficiencia, sostenibilidad y resultados a largo plazo."]},
    {"title": "Soporte Personalizado", "list": false, "items": ["En Vontron entendemos que cada cliente y cada aplicación son únicos. Ofrecemos asesoría técnica especializada y acompañamiento integral, desde la selección de membranas hasta la implementación y mantenimiento, asegurando que nuestras soluciones se adapten a sus necesidades específicas."]}
  ]'::jsonb,
  'En Vontron creemos que el agua pura es sinónimo de vida. Nuestra misión es clara: mejorar el medio ambiente y compartir la salud, desarrollando tecnologías que impacten positivamente en la sociedad y el planeta.',
  'En Vontron, creemos que nuestras tecnologías de membranas no solo purifican el agua: también cuidan del planeta y del bienestar humano. Estamos comprometidos con la innovación que transforme la gestión del agua de forma sostenible.',
  '/images/vontron-mision.jpg', 1
),
(
  'sunresin', 'Sunresin', 'Sunresin New Materials Co., Ltd',
  '/images/sunresin-portada.jpg',
  'Fundada en 2001, Sunresin comenzó su trayectoria como pionera en la tecnología de resinas de intercambio iónico y adsorción. Con el paso de los años, la empresa amplió su experiencia a diversas industrias, como la salud, la alimentación y bebidas, el tratamiento de aguas y la protección del medio ambiente.',
  ARRAY[
    'Sunresin es líder mundial en innovación, desarrollo y producción de resinas de intercambio iónico y adsorbentes, así como resinas especiales para aplicaciones en ciencias de la vida, como cromatografía, síntesis de péptidos en fase sólida, catálisis y API/excipientes.',
    'Al servicio de industrias globales diversas y altamente reguladas, Sunresin desempeña un papel crucial en la solución de complejos desafíos de purificación, separación y extracción en procesos para la salud, las ciencias de la vida, el tratamiento de aguas, la protección del medio ambiente, la energía, la minería y las aplicaciones de alimentos y bebidas. Con más de 1400 empleados en todo el mundo, I+D de vanguardia y una sólida presencia global, está a la vanguardia de la innovación en tecnología de resinas.'
  ],
  '[
    {"title": "Profesionalismo y Experiencia", "list": true, "items": [
      "Sunresin tiene cerca de 20 años de experiencia en fabricación de resinas de intercambio iónico, adsorbentes y tecnologías de separación.",
      "Posee cientos de tipos de resinas usadas en industrias diversas como tratamiento de aguas, farmacéutica, biotecnología, alimentos, etc.",
      "Cuenta con certificaciones de calidad y ambientales (ISO 9001, ISO 14001), lo cual demuestra un compromiso institucional con estándares profesionales."
    ]},
    {"title": "Estrategias Comprobadas", "list": true, "items": [
      "Sunresin ofrece soluciones EPC completas (ingeniería, compras, construcción) para clientes: no sólo fabrica los materiales, sino que implementa proyectos concretos basados en sus tecnologías.",
      "Ha ejecutado múltiples contratos en DLE (Direct Lithium Extraction), con una capacidad total importante de carbonato e hidróxido de litio, lo que demuestra experiencia aplicada en tecnologías emergentes.",
      "Dispone de una cartera de productos muy diversificada (≈ 25 categorías, más de 200 tipos de resinas) lo que le permite adaptarse con productos probados a distintas necesidades industriales."
    ]},
    {"title": "Soporte Personalizado", "list": true, "items": [
      "Sunresin no solo vende resinas, también ofrece equipos, soluciones de separación y servicios técnicos relacionados, adaptando la oferta al tipo de aplicación del cliente.",
      "Tiene centros de I+D y aplicaciones y fábricas especializadas, lo que le permite desarrollar productos nuevos, mejorar procesos y apoyar técnicamente a sus clientes en innovación.",
      "Proporciona PDFs, catálogos y documentación técnica descargable, lo que muestra un soporte de información transparente para quienes ya usan sus productos o están evaluando su uso."
    ]}
  ]'::jsonb,
  'En Sunresin creemos que la innovación en tecnologías de separación es clave para un futuro sostenible. Nuestra misión es clara: desarrollar soluciones limpias y eficientes que impulsen la economía circular, promuevan la salud y protejan los recursos naturales, generando un impacto positivo en la industria, la sociedad y el planeta.',
  'Nuestra misión en Sunresin es liderar la innovación en tecnologías de separación mediante el desarrollo de resinas avanzadas y soluciones sostenibles. Buscamos contribuir al cuidado del medio ambiente, apoyar a las industrias con procesos más limpios y eficientes, y mejorar la calidad de vida a través de aplicaciones seguras y responsables que generen un impacto positivo en la sociedad y el planeta.',
  '/images/sunresin-mision.jpg', 2
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, company_name = EXCLUDED.company_name, hero_image = EXCLUDED.hero_image,
  intro_lead = EXCLUDED.intro_lead, intro_body = EXCLUDED.intro_body, pillars = EXCLUDED.pillars,
  quote = EXCLUDED.quote, mission = EXCLUDED.mission, mission_image = EXCLUDED.mission_image,
  sort_order = EXCLUDED.sort_order;

-- Fichas técnicas
DELETE FROM brand_documents;
INSERT INTO brand_documents (brand_id, title, url, sort_order)
SELECT id, 'Membrana LP21-4040', 'https://drive.google.com/file/d/1YLMybjQEs6RbTXPvJF11vC_-4F7NjQI5/view?usp=sharing', 1 FROM brands WHERE slug = 'vontron'
UNION ALL
SELECT id, 'Catálogo general', 'https://drive.google.com/file/d/1wVTVbMWshvMhjPEVTk3frTHM83n3ISWy/view?usp=sharing', 2 FROM brands WHERE slug = 'vontron'
UNION ALL
SELECT id, 'Catálogo general', 'https://drive.google.com/file/d/1B4NHrfG4rXAHmoJW_3WWR371beUR_fGk/view?usp=sharing', 1 FROM brands WHERE slug = 'sunresin';

-- v2: cifras y estilo por marca (tomadas del contenido de cada marca)
UPDATE brands SET
  tagline = 'Membranas de ósmosis inversa, nanofiltración y ultrafiltración',
  accent = '#1463ff',
  stats = '[
    {"value": "26+", "label": "años de I+D"},
    {"value": "130+", "label": "países y regiones"},
    {"value": "200+", "label": "especificaciones de membranas"},
    {"value": "70M+", "label": "usuarios en el mundo"}
  ]'::jsonb
WHERE slug = 'vontron';

UPDATE brands SET
  tagline = 'Resinas de intercambio iónico y tecnologías de separación',
  accent = '#e98f2e',
  stats = '[
    {"value": "2001", "label": "año de fundación"},
    {"value": "1400+", "label": "empleados en el mundo"},
    {"value": "200+", "label": "tipos de resinas"},
    {"value": "25", "label": "categorías de producto"}
  ]'::jsonb
WHERE slug = 'sunresin';
