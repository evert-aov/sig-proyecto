-- 030_demo_cu_campus.sql
-- Dataset georreferenciado semilla (Ciudad Universitaria y Campus UAGRM, Grupo 16)
-- Garantiza: polígonos válidos, ambientes dentro de edificios, red peatonal conectada y entradas sobre nodos

-- =====================================================================
-- 1. EDIFICIOS (CU y CAMPUS)
-- =====================================================================
INSERT INTO public.edificio (codigo, nombre, alias, uso, pisos, ascensor, descripcion, geom, sede_id, grupo_id)
SELECT v.codigo, v.nombre, v.alias, v.uso, v.pisos, v.ascensor, v.descripcion,
       ST_Multi(ST_GeomFromText(v.wkt, 4326)), s.id, 16
FROM (
  VALUES
    ('M236', 'Módulo 236 — FICCT', ARRAY['FICCT','Módulo de Computación','236'], 'academico', 4, true,
     'Edificio de la Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones.',
     'POLYGON((-63.19580 -17.77605, -63.19535 -17.77605, -63.19535 -17.77635, -63.19580 -17.77635, -63.19580 -17.77605))', 'CU'),
    ('M225', 'Módulo 225 — Tecnología (FCET)', ARRAY['FCET','Tecnología','225'], 'academico', 3, false,
     'Módulo de carreras de Ingeniería Civil e Industrial (FCET).',
     'POLYGON((-63.19505 -17.77605, -63.19465 -17.77605, -63.19465 -17.77635, -63.19505 -17.77635, -63.19505 -17.77605))', 'CU'),
    ('M242', 'Módulo 242 — Hábitat, Diseño y Arte', ARRAY['FCHDA','Arquitectura','242'], 'academico', 3, true,
     'Módulo de la Facultad de Ciencias del Hábitat, Diseño y Arte.',
     'POLYGON((-63.19580 -17.77535, -63.19535 -17.77535, -63.19535 -17.77555, -63.19580 -17.77555, -63.19580 -17.77535))', 'CU'),
    ('M260', 'Módulo 260 — Ciencias de la Salud Humana', ARRAY['FCSH','Medicina','260'], 'academico', 3, true,
     'Módulo de la Facultad de Ciencias de la Salud Humana.',
     'POLYGON((-63.19505 -17.77535, -63.19465 -17.77535, -63.19465 -17.77555, -63.19505 -17.77555, -63.19505 -17.77535))', 'CU'),
    ('M212', 'Módulo 212 — Humanidades', ARRAY['FHUM','Humanidades','212'], 'academico', 2, false,
     'Módulo de la Facultad de Humanidades.',
     'POLYGON((-63.19442 -17.77595, -63.19415 -17.77595, -63.19415 -17.77630, -63.19442 -17.77630, -63.19442 -17.77595))', 'CU'),
    ('M214', 'Módulo 214 — Ciencias Económicas', ARRAY['FCEE','Económicas','214'], 'academico', 3, false,
     'Módulo de la Facultad de Ciencias Económicas y Empresariales.',
     'POLYGON((-63.19580 -17.77680, -63.19535 -17.77680, -63.19535 -17.77705, -63.19580 -17.77705, -63.19580 -17.77680))', 'CU'),
    ('M254', 'Módulo 254 — Contaduría Pública', ARRAY['FCCA','Auditoría','254'], 'academico', 3, true,
     'Módulo de la Facultad de Ciencias Contables, Auditoría y Finanzas.',
     'POLYGON((-63.19505 -17.77680, -63.19465 -17.77680, -63.19465 -17.77705, -63.19505 -17.77705, -63.19505 -17.77680))', 'CU'),
    ('CU-SALUD', 'Posta y Bienestar Universitario CU', ARRAY['Centro Médico','Enfermería CU'], 'servicios', 1, false,
     'Atención primaria de salud y primeros auxilios en Ciudad Universitaria.',
     'POLYGON((-63.19650 -17.77640, -63.19610 -17.77640, -63.19610 -17.77665, -63.19650 -17.77665, -63.19650 -17.77640))', 'CU'),
    ('CAMPUS-DER', 'Bloque Derecho — Ciencias Jurídicas', ARRAY['FCJPS','Derecho'], 'academico', 3, false,
     'Bloque de la Facultad de Ciencias Jurídicas, Políticas y Sociales.',
     'POLYGON((-63.19320 -17.77805, -63.19275 -17.77805, -63.19275 -17.77835, -63.19320 -17.77835, -63.19320 -17.77805))', 'CAMPUS'),
    ('CAMPUS-POL', 'Bloque Facultad Politécnica', ARRAY['FPOL','Politécnica'], 'academico', 3, true,
     'Bloque académico de la Facultad Politécnica en el Campus.',
     'POLYGON((-63.19245 -17.77805, -63.19200 -17.77805, -63.19200 -17.77835, -63.19245 -17.77835, -63.19245 -17.77805))', 'CAMPUS')
) AS v(codigo, nombre, alias, uso, pisos, ascensor, descripcion, wkt, sede_cod)
JOIN public.sede s ON s.codigo = v.sede_cod
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 2. AMBIENTES: CENTROS INTERNOS + CENTROS MÉDICOS / ENFERMERÍAS
-- =====================================================================
INSERT INTO public.ambiente (
  codigo, nombre, alias, piso, referencia, encargado, telefono, horario,
  servicios, descripcion, verificado_en, geom, tipo_ambiente_id, unidad_id, edificio_id, grupo_id
)
SELECT
  v.codigo, v.nombre, v.alias, v.piso, v.referencia, v.encargado, v.telefono, v.horario,
  v.servicios, v.descripcion, CURRENT_DATE,
  ST_SetSRID(ST_MakePoint(v.lon, v.lat), 4326),
  ta.id, u.id, e.id, 16
FROM (
  VALUES
    ('M236-CI-INF', 'Centro Interno de Ingeniería Informática',
     ARRAY['CEI','Centro de Informática'], 0,
     'Planta baja, ala norte junto al patio central del Módulo 236',
     'Univ. Carlos Méndez (Presidencia)', '3-355-2361', 'Lun–Vie 08:30–12:30 y 15:00–19:30',
     ARRAY['Certificados','Asesoría de casos especiales','Préstamo de libros','Inscripción a talleres'],
     'Oficina de atención estudiantil de Ingeniería Informática.',
     -63.19568, -17.77615, 'CENTRO_INTERNO', 'CI-FICCT-INF', 'M236'),

    ('M236-CI-SIS', 'Centro Interno de Ingeniería en Sistemas',
     ARRAY['CES','Centro de Sistemas'], 1,
     'Primer piso, pasillo este frente al laboratorio de redes',
     'Univ. Sofía Rojas (Presidencia)', '3-355-2362', 'Lun–Vie 09:00–13:00 y 15:30–20:00',
     ARRAY['Banco de exámenes','Orientación de matrícula','Talleres técnicos','Casos especiales'],
     'Atención a estudiantes de Ingeniería en Sistemas.',
     -63.19555, -17.77620, 'CENTRO_INTERNO', 'CI-FICCT-SIS', 'M236'),

    ('M236-CI-RED', 'Centro Interno de Redes y Telecomunicaciones',
     ARRAY['CER','Centro de Redes'], 2,
     'Segundo piso, oficina contigua a la sala de telecomunicaciones',
     'Univ. Diego Vargas (Presidencia)', '3-355-2363', 'Lun–Vie 09:00–12:00 y 16:00–19:30',
     ARRAY['Préstamo de ponchadoras y testers','Talleres Linux/Cisco','Orientación académica'],
     'Centro Interno de Ingeniería en Redes y Telecomunicaciones.',
     -63.19543, -17.77625, 'CENTRO_INTERNO', 'CI-FICCT-RED', 'M236'),

    ('M225-CI-CIV', 'Centro Interno de Ingeniería Civil',
     ARRAY['CEIC','Centro de Civil'], 0,
     'Planta baja, ingreso principal lado oeste del Módulo 225',
     'Univ. Mateo Justiniano (Presidencia)', '3-355-2251', 'Lun–Vie 08:00–12:00 y 14:30–18:30',
     ARRAY['Banco de apuntes','Visitas técnicas','Trámites estudiantiles','Torneos internos'],
     'Centro Interno de Estudiantes de Ingeniería Civil (FCET).',
     -63.19492, -17.77616, 'CENTRO_INTERNO', 'CI-FCET-CIV', 'M225'),

    ('M225-CI-IND', 'Centro Interno de Ingeniería Industrial',
     ARRAY['CEII','Centro de Industrial'], 1,
     'Primer piso, subiendo gradas principales a mano derecha (sin ascensor)',
     'Univ. Valeria Suárez (Presidencia)', '3-355-2252', 'Lun–Vie 08:30–12:30 y 15:00–19:00',
     ARRAY['Orientación estudiantil','Seminarios de calidad','Casos de registro'],
     'Centro Interno de Estudiantes de Ingeniería Industrial.',
     -63.19476, -17.77624, 'CENTRO_INTERNO', 'CI-FCET-IND', 'M225'),

    ('M242-CI-ARQ', 'Centro Interno de Arquitectura',
     ARRAY['CEA','Centro de Arquitectura'], 0,
     'Planta baja, frente al patio de exposiciones del Módulo 242',
     'Univ. Lucía Peña (Presidencia)', '3-355-2421', 'Lun–Vie 09:00–13:00 y 15:00–19:30',
     ARRAY['Taller de maquetas','Banco de planos','Bienales estudiantiles'],
     'Centro Interno de Estudiantes de Arquitectura (FCHDA).',
     -63.19558, -17.77545, 'CENTRO_INTERNO', 'CI-FCHDA-ARQ', 'M242'),

    ('M260-CI-MED', 'Centro Interno de Medicina',
     ARRAY['CEM','Centro de Medicina'], 1,
     'Primer piso, ala sur junto al ascensor del Módulo 260',
     'Univ. Gabriel Chávez (Presidencia)', '3-355-2601', 'Lun–Vie 08:00–12:00 y 14:00–18:00',
     ARRAY['Banco de guías clínicas','Campañas de salud','Tutorías estudiantiles'],
     'Centro Interno de Estudiantes de Medicina (FCSH).',
     -63.19485, -17.77545, 'CENTRO_INTERNO', 'CI-FCSH-MED', 'M260'),

    ('M212-CI-PSI', 'Centro Interno de Psicología',
     ARRAY['CEP','Centro de Psicología'], 0,
     'Planta baja, segunda puerta al ingresar por el pasillo central',
     'Univ. Camila Torrico (Presidencia)', '3-355-2121', 'Lun–Vie 08:30–12:00 y 15:00–18:30',
     ARRAY['Orientación estudiantil','Grupos de estudio','Jornadas académicas'],
     'Centro Interno de Estudiantes de Psicología (FHUM).',
     -63.19428, -17.77612, 'CENTRO_INTERNO', 'CI-FHUM-PSI', 'M212'),

    ('M214-CI-ADM', 'Centro Interno de Administración de Empresas',
     ARRAY['CEAE','Centro de Administración'], 0,
     'Planta baja, frente a la galería de ingreso sur del Módulo 214',
     'Univ. Andrés Quiroga (Presidencia)', '3-355-2141', 'Lun–Vie 08:30–12:30 y 15:00–19:30',
     ARRAY['Bolsa de pasantías','Orientación académica','Gestión de becas'],
     'Centro Interno de Estudiantes de Administración de Empresas (FCEE).',
     -63.19558, -17.77692, 'CENTRO_INTERNO', 'CI-FCEE-ADM', 'M214'),

    ('M254-CI-CON', 'Centro Interno de Contaduría Pública',
     ARRAY['CECP','Centro de Auditoría'], 0,
     'Planta baja, costado este junto a las vitrinas informativas',
     'Univ. Fernanda Salvatierra (Presidencia)', '3-355-2541', 'Lun–Vie 08:30–12:30 y 15:00–19:30',
     ARRAY['Asesoría de trámites','Cursos contables','Actividades culturales'],
     'Centro Interno de Contaduría Pública / Auditoría (FCCA).',
     -63.19485, -17.77692, 'CENTRO_INTERNO', 'CI-FCCA-CON', 'M254'),

    ('CAMPUS-DER-CI-DER', 'Centro Interno de Derecho',
     ARRAY['CED','Centro de Derecho'], 0,
     'Planta baja del bloque Derecho, contiguo al patio de ingreso',
     'Univ. Rodrigo Paz (Presidencia)', '3-336-1020', 'Lun–Vie 08:30–12:30 y 15:00–19:30',
     ARRAY['Clínica jurídica estudiantil','Biblioteca jurídica','Trámites estudiantiles'],
     'Centro Interno de Estudiantes de Derecho (FCJPS).',
     -63.19298, -17.77820, 'CENTRO_INTERNO', 'CI-FCJPS-DER', 'CAMPUS-DER'),

    ('CAMPUS-POL-CI-FPOL', 'Centro Interno Facultativo Politécnica',
     ARRAY['CEPOL','Centro Politécnica'], 0,
     'Planta baja, hall central junto al ascensor',
     'Univ. Natalia Arce (Presidencia)', '3-336-2050', 'Lun–Vie 08:00–12:00 y 14:30–18:30',
     ARRAY['Asistencia de inscripción','Préstamo de herramientas','Eventos deportivos'],
     'Centro Interno de Estudiantes de la Facultad Politécnica.',
     -63.19222, -17.77820, 'CENTRO_INTERNO', 'CI-FPOL', 'CAMPUS-POL'),

    -- Centros médicos / enfermerías para detección en ruta (punto 22)
    ('CU-SALUD-ENF', 'Enfermería Ciudad Universitaria',
     ARRAY['Enfermería CU','Primeros Auxilios'], 0,
     'Planta baja, ingreso directo desde el sendero oeste',
     'Lic. Martha Cuéllar', '3-355-9110', 'Lun–Vie 07:30–20:30',
     ARRAY['Primeros auxilios','Curaciones','Control de presión arterial'],
     'Puesto de enfermería y atención rápida en Ciudad Universitaria.',
     -63.19630, -17.77652, 'ENFERMERIA', NULL, 'CU-SALUD'),

    ('CU-SALUD-MED', 'Consultorio Médico Universitario CU',
     ARRAY['Posta Médica','Seguro Estudiantil'], 0,
     'Planta baja, ala este de la Posta Universitaria',
     'Dr. Roberto Balcázar', '3-355-9111', 'Lun–Vie 08:00–18:00',
     ARRAY['Consulta médica general','Derivación SSU','Emergencias'],
     'Consultorio médico de atención estudiantil.',
     -63.19622, -17.77655, 'CONSULTORIO', NULL, 'CU-SALUD')
) AS v(codigo, nombre, alias, piso, referencia, encargado, telefono, horario, servicios, descripcion, lon, lat, tipo_cod, unidad_cod, edif_cod)
JOIN public.tipo_ambiente ta ON ta.codigo = v.tipo_cod
LEFT JOIN public.unidad u ON u.codigo = v.unidad_cod
JOIN public.edificio e ON e.codigo = v.edif_cod
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 3. RED DE VÍAS PEATONALES (Snapped en vértices exactos, cortada en cruces)
-- =====================================================================
INSERT INTO public.via (codigo, nombre, superficie, techado, accesible, verificado_en, geom, tipo_via_id, grupo_id)
SELECT v.codigo, v.nombre, v.superficie, v.techado, v.accesible, CURRENT_DATE,
       ST_GeomFromText(v.wkt, 4326), tv.id, 16
FROM (
  VALUES
    -- Ciudad Universitaria (CU): eje central Norte-Sur y anillos peatonales
    ('CU-V001', 'Ingreso Norte — Eje Salud/Hábitat',     'cemento', false, true, 'LINESTRING(-63.195200 -17.775100, -63.195200 -17.775600)', 'ACERA'),
    ('CU-V002', 'Eje Central Norte (M242/M260 — Plaza)',  'adoquin', true,  true, 'LINESTRING(-63.195200 -17.775600, -63.195200 -17.776200)', 'PASILLO_TECHADO'),
    ('CU-V003', 'Eje Central Sur (Plaza — M214/M254)',   'adoquin', true,  true, 'LINESTRING(-63.195200 -17.776200, -63.195200 -17.776700)', 'PASILLO_TECHADO'),
    ('CU-V004', 'Ingreso Sur — Eje Económicas',          'cemento', false, true, 'LINESTRING(-63.195200 -17.776700, -63.195200 -17.777100)', 'ACERA'),

    -- Rama Oeste (Entrada Oeste -> Posta -> M236 FICCT)
    ('CU-V005', 'Ingreso Oeste — Frente Posta Salud',    'cemento', false, true, 'LINESTRING(-63.196600 -17.776200, -63.195900 -17.776200)', 'ACERA'),
    -- Tramo directo con gradas (accesible = false) para demostrar desvío accesible en pgRouting
    ('CU-V006', 'Paso directo gradas FICCT',             'cemento', false, false,'LINESTRING(-63.195900 -17.776200, -63.195200 -17.776200)', 'SENDERO'),
    -- Alternativa con rampa accesible por el sur (W1 -> SW1 -> S1 -> C1)
    ('CU-V007', 'Sendero accesible Posta — Sur',         'adoquin', false, true, 'LINESTRING(-63.195900 -17.776200, -63.195900 -17.776700)', 'SENDERO'),
    ('CU-V008', 'Sendero accesible Sur — M214',          'adoquin', false, true, 'LINESTRING(-63.195900 -17.776700, -63.195200 -17.776700)', 'SENDERO'),
    -- Conexión norte oeste (W1 -> NW1 -> N1)
    ('CU-V009', 'Sendero Oeste — M242 Arquitectura',     'cemento', false, true, 'LINESTRING(-63.195900 -17.776200, -63.195900 -17.775600)', 'SENDERO'),
    ('CU-V010', 'Pasillo M242 — Eje Norte',              'cemento', true,  true, 'LINESTRING(-63.195900 -17.775600, -63.195200 -17.775600)', 'PASILLO_TECHADO'),

    -- Rama Este (M225 FCET, M212 Humanidades, M260 Salud, M254 Auditoría)
    ('CU-V011', 'Pasillo Plaza — M225/M212',             'adoquin', true,  true, 'LINESTRING(-63.195200 -17.776200, -63.194500 -17.776200)', 'PASILLO_TECHADO'),
    ('CU-V012', 'Sendero Norte Este — M260 Salud',       'cemento', false, true, 'LINESTRING(-63.195200 -17.775600, -63.194500 -17.775600)', 'SENDERO'),
    ('CU-V013', 'Sendero Este Norte (M260 — M212)',      'cemento', false, true, 'LINESTRING(-63.194500 -17.775600, -63.194500 -17.776200)', 'SENDERO'),
    ('CU-V014', 'Sendero Este Sur (M212 — M254)',        'cemento', false, true, 'LINESTRING(-63.194500 -17.776200, -63.194500 -17.776700)', 'SENDERO'),
    ('CU-V015', 'Sendero M254 — Eje Sur',                'cemento', false, true, 'LINESTRING(-63.194500 -17.776700, -63.195200 -17.776700)', 'SENDERO'),

    -- Campus Universitario (El Cristo) y enlace peatonal CU <-> Campus
    ('CU-V016',     'Enlace Av. Busch — 2do Anillo (Tramo N)', 'cemento', false, true, 'LINESTRING(-63.195200 -17.777100, -63.194250 -17.777800)', 'ACERA'),
    ('CAMPUS-V004', 'Enlace Av. Busch — 2do Anillo (Tramo S)', 'cemento', false, true, 'LINESTRING(-63.194250 -17.777800, -63.193300 -17.778500)', 'ACERA'),
    ('CAMPUS-V001', 'Ingreso Oeste Campus — Derecho',    'cemento', false, true, 'LINESTRING(-63.193300 -17.778500, -63.192600 -17.778500)', 'ACERA'),
    ('CAMPUS-V002', 'Sendero Central Campus — Politécnica','adoquin',true, true, 'LINESTRING(-63.192600 -17.778500, -63.191900 -17.778500)', 'PASILLO_TECHADO'),
    ('CAMPUS-V003', 'Acceso Norte Bloques Campus',       'cemento', false, true, 'LINESTRING(-63.192600 -17.778500, -63.192600 -17.778000)', 'SENDERO')
) AS v(codigo, nombre, superficie, techado, accesible, wkt, tipo_cod)
JOIN public.tipo_via tv ON tv.codigo = v.tipo_cod
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 4. PUNTOS DE INTERÉS (Entradas tocando nodos, extintores, botiquines, rampas, sanitarios)
-- =====================================================================
INSERT INTO public.punto_interes (
  codigo, nombre, piso, accesible, nota, extintor_agente, extintor_kg, extintor_vence,
  verificado_en, geom, tipo_punto_id, edificio_id, sede_id, grupo_id
)
SELECT
  v.codigo, v.nombre, v.piso, v.accesible, v.nota, v.agente, v.kg, v.vence,
  CURRENT_DATE, ST_SetSRID(ST_MakePoint(v.lon, v.lat), 4326),
  tp.id, e.id, s.id, 16
FROM (
  VALUES
    -- Entradas exactamente sobre nodos terminales de via (distancia = 0 m)
    ('CU-ENT01', 'Entrada Oeste Ciudad Universitaria (Av. Busch)', 0, true,  'Ingreso peatonal principal con rampa', NULL, NULL, NULL::DATE, -63.196600, -17.776200, 'ENTRADA', NULL, 'CU'),
    ('CU-ENT02', 'Entrada Norte Ciudad Universitaria',             0, true,  'Acceso cercano a Salud Humana y Arquitectura', NULL, NULL, NULL::DATE, -63.195200, -17.775100, 'ENTRADA', NULL, 'CU'),
    ('CU-ENT03', 'Entrada Sur Ciudad Universitaria',               0, true,  'Acceso por Económicas y Auditoría', NULL, NULL, NULL::DATE, -63.195200, -17.777100, 'ENTRADA', NULL, 'CU'),
    ('CAMPUS-ENT01', 'Entrada Oeste Campus El Cristo',             0, true,  'Ingreso por 2do Anillo', NULL, NULL, NULL::DATE, -63.193300, -17.778500, 'ENTRADA', NULL, 'CAMPUS'),
    ('CAMPUS-ENT02', 'Entrada Este Campus El Cristo',              0, true,  'Ingreso por Av. Venezuela', NULL, NULL, NULL::DATE, -63.191900, -17.778500, 'ENTRADA', NULL, 'CAMPUS'),

    -- Accesibilidad
    ('CU-RAMP01', 'Rampa Accesible Sur FICCT', 0, true, 'Rampa con baranda hacia eje central sin gradas', NULL, NULL, NULL::DATE, -63.195900, -17.776550, 'RAMPA', NULL, 'CU'),
    ('CU-GRAD01', 'Gradas Acceso Directo FICCT', 0, false,'Gradas de 8 peldaños frente a plaza central', NULL, NULL, NULL::DATE, -63.195550, -17.776200, 'GRADAS', NULL, 'CU'),

    -- Extintores y botiquines a lo largo de la red peatonal y módulos (punto 22)
    ('M236-EXT01', 'Extintor Hall PB M236',        0, true, 'Junto a escalera principal PB',   'PQS', 6.0, '2027-06-30'::DATE, -63.195600, -17.776220, 'EXTINTOR', 'M236', 'CU'),
    ('M225-EXT01', 'Extintor Pasillo M225',        0, true, 'Columna exterior oeste M225',     'CO2', 5.0, '2027-03-15'::DATE, -63.194980, -17.776200, 'EXTINTOR', 'M225', 'CU'),
    ('M214-EXT01', 'Extintor Galería M214',        0, true, 'Ingreso norte M214 (por recargar)','PQS',6.0, '2026-09-01'::DATE, -63.195550, -17.776820, 'EXTINTOR', 'M214', 'CU'),
    ('M242-EXT01', 'Extintor Patio M242',          0, true, 'Pasillo cubierto planta baja',    'PQS', 6.0, '2027-08-20'::DATE, -63.195550, -17.775520, 'EXTINTOR', 'M242', 'CU'),
    ('M260-EXT01', 'Extintor Ingreso M260',        0, true, 'Junto a ascensor planta baja',    'CO2', 5.0, '2027-10-10'::DATE, -63.194880, -17.775520, 'EXTINTOR', 'M260', 'CU'),
    ('CU-BOT01',   'Botiquín Plaza Central CU',    0, true, 'Punto de primeros auxilios en caseta central', NULL, NULL, NULL::DATE, -63.195220, -17.776180, 'BOTIQUIN', NULL, 'CU'),
    ('CU-PE01',    'Punto de Encuentro Explanada', 0, true, 'Área abierta libre de obstáculos', NULL, NULL, NULL::DATE, -63.195180, -17.775900, 'PUNTO_ENCUENTRO', NULL, 'CU'),
    ('CU-SAN01',   'Sanitario Público Plaza CU',   0, true, 'Cabina adaptada en planta baja',  NULL, NULL, NULL::DATE, -63.195100, -17.776450, 'SANITARIO', NULL, 'CU'),

    ('CAMPUS-DER-EXT01', 'Extintor PB Derecho',    0, true, 'Pasillo ingreso Derecho',         'PQS', 6.0, '2027-05-15'::DATE, -63.192900, -17.778320, 'EXTINTOR', 'CAMPUS-DER', 'CAMPUS'),
    ('CAMPUS-POL-BOT01', 'Botiquín PB Politécnica',0, true, 'Recepción planta baja',           NULL,  NULL, NULL::DATE,        -63.192250, -17.778320, 'BOTIQUIN', 'CAMPUS-POL', 'CAMPUS')
) AS v(codigo, nombre, piso, accesible, nota, agente, kg, vence, lon, lat, tipo_cod, edif_cod, sede_cod)
JOIN public.tipo_punto tp ON tp.codigo = v.tipo_cod
LEFT JOIN public.edificio e ON e.codigo = v.edif_cod
JOIN public.sede s ON s.codigo = v.sede_cod
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 5. ÁREAS DE CONTEXTO (Cancha, Jardines, Parqueos)
-- =====================================================================
INSERT INTO public.area (
  codigo, nombre, material, capacidad, acceso, nota, verificado_en, geom, tipo_area_id, sede_id, grupo_id
)
SELECT
  v.codigo, v.nombre, v.material, v.capacidad, v.acceso, v.nota, CURRENT_DATE,
  ST_Multi(ST_GeomFromText(v.wkt, 4326)), ta.id, s.id, 16
FROM (
  VALUES
    ('CU-PLAZA01',  'Plaza Central Estudiantil CU',   'pavimento', NULL::SMALLINT, 'publico', 'Explanada de encuentro entre módulos',
     'POLYGON((-63.19532 -17.77582, -63.19508 -17.77582, -63.19508 -17.77600, -63.19532 -17.77600, -63.19532 -17.77582))', 'PLAZA', 'CU'),
    ('CU-JARDIN01', 'Área Verde Oeste CU',            'cesped_natural', NULL::SMALLINT, 'publico', 'Jardín arbolado junto a Posta',
     'POLYGON((-63.19655 -17.77575, -63.19605 -17.77575, -63.19605 -17.77605, -63.19655 -17.77605, -63.19655 -17.77575))', 'AREA_VERDE', 'CU'),
    ('CU-PARQ01',   'Parqueo Sur Ciudad Universitaria','pavimento', 45, 'publico', 'Estacionamiento general',
     'POLYGON((-63.19655 -17.77680, -63.19600 -17.77680, -63.19600 -17.77715, -63.19655 -17.77715, -63.19655 -17.77680))', 'PARQUEO', 'CU'),
    ('CAMPUS-CANCHA01', 'Cancha Polifuncional Campus', 'cemento', NULL::SMALLINT, 'publico', 'Cancha estudiantil de uso múltiple',
     'POLYGON((-63.19320 -17.77870, -63.19270 -17.77870, -63.19270 -17.77910, -63.19320 -17.77910, -63.19320 -17.77870))', 'CANCHA_MULTIPLE', 'CAMPUS')
) AS v(codigo, nombre, material, capacidad, acceso, nota, wkt, tipo_cod, sede_cod)
JOIN public.tipo_area ta ON ta.codigo = v.tipo_cod
JOIN public.sede s ON s.codigo = v.sede_cod
ON CONFLICT (codigo) DO NOTHING;

-- Asegurar construcción explícita de la red de rutas
SELECT public.armar_red();
