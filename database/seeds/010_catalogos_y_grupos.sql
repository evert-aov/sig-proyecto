-- 010_catalogos_y_grupos.sql
-- Los 22 grupos del proyecto SIG UAGRM 2026-2, catálogos de leyenda y 4 sedes base

-- =====================================================================
-- 0. GRUPOS (1 a 22 según enunciado del proyecto)
-- =====================================================================
INSERT INTO public.grupo (id, codigo, tema, contacto) VALUES
  (1,  'RECT1',  'OFICINAS ADMINISTRATIVAS DEL RECTORADO (1)', NULL),
  (2,  'RECT2',  'OFICINAS ADMINISTRATIVAS DEL RECTORADO (2)', NULL),
  (3,  'RECT3',  'OFICINAS ADMINISTRATIVAS DEL RECTORADO (3)', NULL),
  (4,  'VRECT1', 'OFICINAS ADMINISTRATIVAS DEL VICERECTORADO (1)', NULL),
  (5,  'VRECT2', 'OFICINAS ADMINISTRATIVAS DEL VICERECTORADO (2)', NULL),
  (6,  'ORGESP', 'ORGANOS ESPECIALES: CORTE ELECTORAL, DEFENSORIA UNIVERSITARIA, GUARDERIA, CANAL 11, ETC', NULL),
  (7,  'FUP',    'FEDERACION UNIVERSITARIA DE PROFESORES Y ASOCIACIONES DE DOCENTES FACULTATIVOS', NULL),
  (8,  'POSTG',  'ESCUELAS DE POSTGRADO', NULL),
  (9,  'FACDEC', 'FACULTADES: DECANATURA Y VICEDECANATURAS', NULL),
  (10, 'CARR',   'DIRECCIONES DE CARRERA', NULL),
  (11, 'ACRED',  'OFICINAS DE ACREDITACIONES', NULL),
  (12, 'EXTINV', 'OFICINAS DE EXTENSION E INVESTIGACION DE LAS FACULTADES Y LA UAGRM', NULL),
  (13, 'DTIC',   'DTIC, CPD FACULTATIVOS', NULL),
  (14, 'LABS',   'LABORATORIOS', NULL),
  (15, 'BIBLIO', 'BIBLIOTECAS', NULL),
  (16, 'CINT',   'CENTROS INTERNOS', 'grupo16-centros-internos@uagrm.edu.bo'),
  (17, 'KIOSCO', 'QUIOSCOS Y FOTOCOPIADORAS', NULL),
  (18, 'DEPORT', 'CAMPOS DEPORTIVOS', NULL),
  (19, 'COMED',  'LUGARES DE COMIDA, COMEDORES', NULL),
  (20, 'PARQ',   'PARQUEOS, SANITARIOS', NULL),
  (21, 'AR',     'MUESTRA DE INFORMACION ALFANUMERICA APUNTANDO EL CELULAR', NULL),
  (22, 'RUTAS',  'MOSTRAR EL CAMINO DESDE UN PUNTO DE INICIO HASTA UN PUNTO FINAL (EXTINTORES, CENTROS MEDICOS)', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 1. CATÁLOGOS DE LA LEYENDA (Paleta oficial del modelo común)
-- =====================================================================
INSERT INTO public.tipo_ambiente (codigo, nombre, categoria, color, icono, orden, descripcion) VALUES
  ('OFICINA',        'Oficina Administrativa',   'administrativo',          '#1F6FEB', 'building-2',    1, 'Oficinas administrativas y dirección'),
  ('SECRETARIA',     'Secretaría',               'administrativo',          '#1F6FEB', 'file-text',     2, 'Atención y trámites administrativos'),
  ('CAJA',           'Caja / Tesorería',         'administrativo',          '#1F6FEB', 'credit-card',   3, 'Ventanilla de pagos y recaudaciones'),
  ('AULA',           'Aula',                     'academico',               '#8250DF', 'graduation-cap',4, 'Salón de clases'),
  ('LABORATORIO',    'Laboratorio',              'academico',               '#8250DF', 'flask-conical', 5, 'Laboratorio académico o de práctica'),
  ('BIBLIOTECA',     'Biblioteca',               'academico',               '#8250DF', 'book-open',     6, 'Biblioteca facultativa o central'),
  ('AUDITORIO',      'Auditorio',                'academico',               '#8250DF', 'mic',           7, 'Auditorio o salón de actos'),
  ('INVESTIGACION',  'Instituto de Investigación','investigacion_extension','#CF222E', 'microscope',    8, 'Unidad de investigación'),
  ('EXTENSION',      'Oficina de Extensión',     'investigacion_extension', '#CF222E', 'share-2',       9, 'Extensión universitaria e interacción social'),
  ('CENTRO_INTERNO', 'Centro Interno',           'investigacion_extension', '#CF222E', 'users',         10,'Centro Interno estudiantil de carrera o facultad'),
  ('CPD',            'Centro de Proc. de Datos', 'tecnologia',              '#2DA44E', 'server',        11,'DTIC o CPD facultativo'),
  ('SALA_COMPUTO',   'Sala de Cómputo',          'tecnologia',              '#2DA44E', 'monitor',       12,'Sala de computación'),
  ('KIOSCO',         'Quiosco',                  'servicios',               '#BC4C00', 'store',         13,'Quiosco universitario'),
  ('FOTOCOPIADORA',  'Fotocopiadora',            'servicios',               '#BC4C00', 'printer',       14,'Servicio de fotocopias e impresiones'),
  ('COMEDOR',        'Comedor / Cafetería',      'servicios',               '#BC4C00', 'utensils',      15,'Comedor o lugar de comida'),
  ('GUARDERIA',      'Guardería',                'servicios',               '#BC4C00', 'baby',          16,'Guardería universitaria'),
  ('CONSULTORIO',    'Consultorio Médico',       'salud_seguridad',         '#DB2777', 'stethoscope',   17,'Atención médica universitaria'),
  ('ENFERMERIA',     'Enfermería / Primeros Auxilios','salud_seguridad',    '#DB2777', 'heart-pulse',   18,'Puesto de enfermería y primeros auxilios')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipo_punto (codigo, nombre, categoria, color, icono, orden, descripcion) VALUES
  ('ENTRADA',           'Entrada / Acceso',      'acceso',            '#24292F', 'door-open',      1, 'Ingreso peatonal o vehicular'),
  ('RAMPA',             'Rampa Accesible',       'acceso',            '#24292F', 'accessibility',  2, 'Rampa para silla de ruedas'),
  ('GRADAS',            'Gradas / Escaleras',    'acceso',            '#24292F', 'stairs',         3, 'Escaleras exteriores o de paso'),
  ('EXTINTOR',          'Extintor',              'seguridad',         '#D1242F', 'flame-kindling', 4, 'Extintor contra incendios'),
  ('BOTIQUIN',          'Botiquín',              'seguridad',         '#D1242F', 'cross',          5, 'Botiquín de primeros auxilios'),
  ('SALIDA_EMERGENCIA', 'Salida de Emergencia',  'seguridad',         '#D1242F', 'siren',          6, 'Ruta o puerta de evacuación'),
  ('PUNTO_ENCUENTRO',   'Punto de Encuentro',    'seguridad',         '#D1242F', 'shield-check',   7, 'Zona segura ante emergencias'),
  ('SANITARIO',         'Sanitario / Baño',      'servicios_basicos', '#0969DA', 'bath',           8, 'Servicios higiénicos'),
  ('BEBEDERO',          'Bebedero',              'servicios_basicos', '#0969DA', 'droplets',       9, 'Bebedero de agua potable')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipo_area (codigo, nombre, categoria, color, icono, orden, descripcion) VALUES
  ('CANCHA_FUTBOL',   'Cancha de Fútbol',     'deportivo',       '#1A7F37', 'trophy',    1, 'Campo de fútbol'),
  ('CANCHA_MULTIPLE', 'Cancha Polifuncional', 'deportivo',       '#1A7F37', 'dribbble',  2, 'Cancha múltiple (fútsal, básquet, vóley)'),
  ('PISTA_ATLETISMO', 'Pista de Atletismo',   'deportivo',       '#1A7F37', 'footprints',3, 'Pista atlética'),
  ('PISCINA',         'Piscina',              'deportivo',       '#1A7F37', 'waves',     4, 'Piscina universitaria'),
  ('JARDIN',          'Jardín',               'area_verde',      '#82C91E', 'flower-2',  5, 'Jardín ornamental'),
  ('AREA_VERDE',      'Área Verde',           'area_verde',      '#82C91E', 'trees',     6, 'Zona arborizada o césped'),
  ('PLAZA',           'Plaza / Explanada',    'area_verde',      '#82C91E', 'landmark',  7, 'Plaza o espacio cívico abierto'),
  ('PARQUEO',         'Parqueo',              'estacionamiento', '#8C959F', 'car',       8, 'Estacionamiento vehicular')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.tipo_via (codigo, nombre, categoria, color, icono, orden, descripcion) VALUES
  ('SENDERO',         'Sendero Peatonal',  'peatonal',  '#A0522D', 'footprints', 1, 'Camino peatonal interno'),
  ('ACERA',           'Acera',             'peatonal',  '#A0522D', 'route',      2, 'Acera pavimentada'),
  ('PASILLO_TECHADO', 'Pasillo Techado',   'peatonal',  '#A0522D', 'umbrella',   3, 'Pasillo peatonal cubierto'),
  ('VIA_INTERNA',     'Vía Interna',       'vehicular', '#444C56', 'road',       4, 'Calzada interna vehicular'),
  ('CALLE',           'Calle Colindante',  'vehicular', '#444C56', 'map-pin',    5, 'Calle perimetral')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 2. SEDES INICIALES (Santa Cruz de la Sierra)
-- =====================================================================
INSERT INTO public.sede (codigo, nombre, tipo, municipio, direccion, geom, grupo_id) VALUES
  (
    'CU',
    'Ciudad Universitaria UAGRM',
    'campus',
    'Santa Cruz de la Sierra',
    'Av. Busch entre 2do y 3er Anillo',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-63.19690 -17.77490, -63.19410 -17.77490, -63.19410 -17.77730, -63.19690 -17.77730, -63.19690 -17.77490))',
      4326
    )),
    16
  ),
  (
    'CAMPUS',
    'Campus Universitario (El Cristo)',
    'campus',
    'Santa Cruz de la Sierra',
    'Av. Centenario y Av. Venezuela (2do Anillo)',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-63.19360 -17.77760, -63.19150 -17.77760, -63.19150 -17.77930, -63.19360 -17.77930, -63.19360 -17.77760))',
      4326
    )),
    16
  ),
  (
    'VALLECITO',
    'Fundo El Vallecito',
    'instalacion_externa',
    'Santa Cruz de la Sierra',
    'Carretera al Norte Km 9',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-63.16200 -17.69800, -63.15900 -17.69800, -63.15900 -17.70050, -63.16200 -17.70050, -63.16200 -17.69800))',
      4326
    )),
    16
  ),
  (
    'MUSEO',
    'Museo de Historia Natural Noel Kempff Mercado',
    'instalacion_externa',
    'Santa Cruz de la Sierra',
    'Calle Junín #151',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-63.18580 -17.78300, -63.18520 -17.78300, -63.18520 -17.78350, -63.18580 -17.78350, -63.18580 -17.78300))',
      4326
    )),
    16
  )
ON CONFLICT (codigo) DO NOTHING;
