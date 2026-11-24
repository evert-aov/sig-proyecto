-- 020_facultades_uagrm.sql
-- Las 18 Facultades oficiales del PDF + carreras y Centros Internos (Grupo 16)

-- =====================================================================
-- 1. LAS 18 FACULTADES OFICIALES (según página 2 de PROYECTO DE SIG 2026.pdf)
-- =====================================================================
INSERT INTO public.unidad (codigo, nombre, sigla, alias, tipo, descripcion, grupo_id) VALUES
  ('FICH',  'FACULTAD INTEGRAL DEL CHACO',                                                      'FICH',  ARRAY['Chaco','Camiri'], 'facultad', 'Facultad Integral del Chaco - Camiri', 16),
  ('FINOR', 'FACULTAD INTEGRAL DEL NORTE',                                                      'FINOR', ARRAY['Norte','Montero'], 'facultad', 'Facultad Integral del Norte - Montero', 16),
  ('FCCA',  'FACULTAD DE CIENCIAS CONTABLES, AUDITORÍA, SISTEMAS DE CONTROL DE GESTIÓN Y FINANZAS','FCCA', ARRAY['Auditoría','Contaduría'], 'facultad', 'Facultad de Ciencias Contables, Auditoría, Sistemas de Control de Gestión y Finanzas', 16),
  ('FCHDA', 'FACULTAD DE CIENCIAS DEL HÁBITAT, DISEÑO Y ARTE',                                  'FCHDA', ARRAY['Hábitat','Arquitectura'], 'facultad', 'Facultad de Ciencias del Hábitat, Diseño y Arte', 16),
  ('FHUM',  'FACULTAD DE HUMANIDADES',                                                          'FHUM',  ARRAY['Humanidades'], 'facultad', 'Facultad de Humanidades', 16),
  ('FCSH',  'FACULTAD DE CIENCIAS DE LA SALUD HUMANA',                                          'FCSH',  ARRAY['Salud Humana','Medicina'], 'facultad', 'Facultad de Ciencias de la Salud Humana', 16),
  ('FCJPS', 'FACULTAD DE CIENCIAS JURÍDICAS, POLÍTICAS, SOCIALES Y RELACIONES INTERNACIONALES', 'FCJPS', ARRAY['Derecho','Jurídicas'], 'facultad', 'Facultad de Ciencias Jurídicas, Políticas, Sociales y Relaciones Internacionales', 16),
  ('FCEE',  'FACULTAD DE CIENCIAS ECONÓMICAS Y EMPRESARIALES',                                  'FCEE',  ARRAY['Economía','Empresariales'], 'facultad', 'Facultad de Ciencias Económicas y Empresariales', 16),
  ('FCV',   'FACULTAD DE CIENCIAS VETERINARIAS',                                                'FCV',   ARRAY['Veterinaria'], 'facultad', 'Facultad de Ciencias Veterinarias', 16),
  ('FCA',   'FACULTAD DE CIENCIAS AGRÍCOLAS',                                                   'FCA',   ARRAY['Agrícola','El Vallecito'], 'facultad', 'Facultad de Ciencias Agrícolas', 16),
  ('FCET',  'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',                                        'FCET',  ARRAY['Tecnología','Exactas'], 'facultad', 'Facultad de Ciencias Exactas y Tecnología', 16),
  ('FPOL',  'FACULTAD POLITÉCNICA',                                                             'FPOL',  ARRAY['Politécnica'], 'facultad', 'Facultad Politécnica', 16),
  ('FINI',  'FACULTAD INTEGRAL DE ICHILO',                                                      'FINI',  ARRAY['Ichilo','Yapacaní'], 'facultad', 'Facultad Integral de Ichilo', 16),
  ('FICHQ', 'FACULTAD INTEGRAL CHIQUITANA',                                                     'FICHQ', ARRAY['Chiquitana','San Ignacio'], 'facultad', 'Facultad Integral Chiquitana', 16),
  ('FCFB',  'FACULTAD DE CIENCIAS FARMACÉUTICAS Y BIOQUÍMICAS',                                 'FCFB',  ARRAY['Farmacia','Bioquímica'], 'facultad', 'Facultad de Ciencias Farmacéuticas y Bioquímicas', 16),
  ('FICCT', 'FACULTAD DE INGENIERÍA EN CIENCIAS DE LA COMPUTACIÓN Y TELECOMUNICACIONES',        'FICCT', ARRAY['Computación','Sistemas','Informática'], 'facultad', 'Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones', 16),
  ('FIVC',  'FACULTAD INTEGRAL DE LOS VALLES CRUCEÑOS',                                         'FIVC',  ARRAY['Valles','Vallegrande'], 'facultad', 'Facultad Integral de los Valles Cruceños', 16),
  ('FINE',  'FACULTAD INTEGRAL DEL NOR-ESTE',                                                   'FINE',  ARRAY['Nor-Este','San Julián'], 'facultad', 'Facultad Integral del Nor-Este', 16)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 2. CARRERAS Y UNIDADES DE APOYO VINCULADAS A SU FACULTAD
-- =====================================================================
INSERT INTO public.unidad (codigo, nombre, sigla, alias, tipo, padre_id, descripcion, grupo_id)
SELECT v.codigo, v.nombre, v.sigla, v.alias, 'carrera', f.id, v.descripcion, 16
FROM (
  VALUES
    ('FICCT-INF',  'Ingeniería Informática',                     'INF',   ARRAY['Informática'],           'FICCT', 'Carrera de Ingeniería Informática'),
    ('FICCT-SIS',  'Ingeniería en Sistemas',                     'SIS',   ARRAY['Sistemas'],              'FICCT', 'Carrera de Ingeniería en Sistemas'),
    ('FICCT-RED',  'Ingeniería en Redes y Telecomunicaciones',   'RED',   ARRAY['Redes','Telecom'],       'FICCT', 'Carrera de Ingeniería en Redes y Telecomunicaciones'),
    ('FCET-CIV',   'Ingeniería Civil',                           'CIV',   ARRAY['Civil'],                 'FCET',  'Carrera de Ingeniería Civil'),
    ('FCET-IND',   'Ingeniería Industrial',                      'IND',   ARRAY['Industrial'],            'FCET',  'Carrera de Ingeniería Industrial'),
    ('FCEE-ADM',   'Administración de Empresas',                 'ADM',   ARRAY['Administración'],        'FCEE',  'Carrera de Administración de Empresas'),
    ('FCCA-CON',   'Contaduría Pública',                         'CON',   ARRAY['Auditoría','Contaduría'], 'FCCA', 'Carrera de Contaduría Pública'),
    ('FCHDA-ARQ',  'Arquitectura',                               'ARQ',   ARRAY['Arq'],                   'FCHDA', 'Carrera de Arquitectura'),
    ('FHUM-PSI',   'Psicología',                                 'PSI',   ARRAY['Psico'],                 'FHUM',  'Carrera de Psicología'),
    ('FCSH-MED',   'Medicina',                                   'MED',   ARRAY['Medicina'],              'FCSH',  'Carrera de Medicina'),
    ('FCJPS-DER',  'Derecho',                                    'DER',   ARRAY['Leyes','Abogacía'],      'FCJPS', 'Carrera de Derecho'),
    ('FPOL-MEC',   'Mecánica Industrial',                        'MEC',   ARRAY['Mecánica'],              'FPOL',  'Carrera de Mecánica Industrial')
) AS v(codigo, nombre, sigla, alias, fac_cod, descripcion)
JOIN public.unidad f ON f.codigo = v.fac_cod
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================================
-- 3. CENTROS INTERNOS (tipo = 'centro', padre = carrera o facultad)
-- =====================================================================
INSERT INTO public.unidad (
  codigo, nombre, sigla, alias, tipo, padre_id,
  responsable, cargo_responsable, descripcion, servicios, correo, grupo_id
)
SELECT
  v.codigo, v.nombre, v.sigla, v.alias, 'centro', p.id,
  v.responsable, v.cargo_responsable, v.descripcion, v.servicios, v.correo, 16
FROM (
  VALUES
    ('CI-FICCT-INF', 'Centro Interno de Ingeniería Informática',           'CI-INF',   ARRAY['CEI','Centro de Informática'],    'FICCT-INF', 'Representación Estudiantil Informática', 'Presidente del Centro Interno', 'Representación estudiantil, apoyo académico, auxiliaturas y bienestar estudiantil de Ingeniería Informática.', ARRAY['Certificados de participación','Asesoría estudiantil','Préstamo de material','Auxiliaturas','Inscripción a talleres'], 'ci.informatica@uagrm.edu.bo'),
    ('CI-FICCT-SIS', 'Centro Interno de Ingeniería en Sistemas',           'CI-SIS',   ARRAY['CES','Centro de Sistemas'],       'FICCT-SIS', 'Representación Estudiantil Sistemas',    'Presidente del Centro Interno', 'Centro Interno estudiantil de Ingeniería en Sistemas: trámites estudiantiles, orientación y eventos técnicos.', ARRAY['Orientación de matrícula','Casos especiales','Banco de exámenes','Talleres técnicos'], 'ci.sistemas@uagrm.edu.bo'),
    ('CI-FICCT-RED', 'Centro Interno de Redes y Telecomunicaciones',       'CI-RED',   ARRAY['CER','Centro de Redes'],          'FICCT-RED', 'Representación Estudiantil Redes',       'Presidente del Centro Interno', 'Apoyo estudiantil y gestión de actividades académicas para Ingeniería en Redes y Telecomunicaciones.', ARRAY['Préstamo de equipos básicos','Orientación académica','Talleres Cisco/Linux'], 'ci.redes@uagrm.edu.bo'),
    ('CI-FCET-CIV',  'Centro Interno de Ingeniería Civil',                 'CI-CIV',   ARRAY['CEIC','Centro de Civil'],         'FCET-CIV',  'Representación Estudiantil Civil',       'Presidente del Centro Interno', 'Centro Interno de Estudiantes de Ingeniería Civil (FCET).', ARRAY['Banco de apuntes','Visitas técnicas','Trámites estudiantiles','Deportes'], 'ci.civil@uagrm.edu.bo'),
    ('CI-FCET-IND',  'Centro Interno de Ingeniería Industrial',            'CI-IND',   ARRAY['CEII','Centro de Industrial'],    'FCET-IND',  'Representación Estudiantil Industrial',  'Presidente del Centro Interno', 'Representación estudiantil y apoyo académico de Ingeniería Industrial.', ARRAY['Orientación estudiantil','Seminarios','Casos de registro'], 'ci.industrial@uagrm.edu.bo'),
    ('CI-FCEE-ADM',  'Centro Interno de Administración de Empresas',       'CI-ADM',   ARRAY['CEAE','Centro de Administración'],'FCEE-ADM',  'Representación Estudiantil Administración','Presidente del Centro Interno','Centro Interno de Estudiantes de Administración de Empresas.', ARRAY['Bolsa de pasantías','Orientación académica','Gestión de becas'], 'ci.administracion@uagrm.edu.bo'),
    ('CI-FCCA-CON',  'Centro Interno de Contaduría Pública',               'CI-CON',   ARRAY['CECP','Centro de Auditoría'],     'FCCA-CON',  'Representación Estudiantil Contaduría',  'Presidente del Centro Interno', 'Centro Interno de Contaduría Pública / Auditoría.', ARRAY['Asesoría de trámites','Cursos contables','Actividades culturales'], 'ci.contaduria@uagrm.edu.bo'),
    ('CI-FCHDA-ARQ', 'Centro Interno de Arquitectura',                     'CI-ARQ',   ARRAY['CEA','Centro de Arquitectura'],   'FCHDA-ARQ', 'Representación Estudiantil Arquitectura','Presidente del Centro Interno', 'Centro Interno de Estudiantes de Arquitectura (FCHDA).', ARRAY['Taller de maquetas','Banco de planos','Bienales y exposiciones'], 'ci.arquitectura@uagrm.edu.bo'),
    ('CI-FHUM-PSI',  'Centro Interno de Psicología',                       'CI-PSI',   ARRAY['CEP','Centro de Psicología'],     'FHUM-PSI',  'Representación Estudiantil Psicología',  'Presidente del Centro Interno', 'Centro Interno de Estudiantes de Psicología (FHUM).', ARRAY['Orientación estudiantil','Grupos de estudio','Jornadas académicas'], 'ci.psicologia@uagrm.edu.bo'),
    ('CI-FCSH-MED',  'Centro Interno de Medicina',                         'CI-MED',   ARRAY['CEM','Centro de Medicina'],       'FCSH-MED',  'Representación Estudiantil Medicina',    'Presidente del Centro Interno', 'Centro Interno de Estudiantes de Medicina (FCSH).', ARRAY['Banco de guías clínicas','Campañas de salud','Tutorías'], 'ci.medicina@uagrm.edu.bo'),
    ('CI-FCJPS-DER', 'Centro Interno de Derecho',                          'CI-DER',   ARRAY['CED','Centro de Derecho'],        'FCJPS-DER', 'Representación Estudiantil Derecho',     'Presidente del Centro Interno', 'Centro Interno de Estudiantes de la Facultad de Ciencias Jurídicas y Derecho.', ARRAY['Clínica jurídica estudiantil','Biblioteca jurídica','Trámites'], 'ci.derecho@uagrm.edu.bo'),
    ('CI-FPOL',      'Centro Interno Facultativo Politécnica',             'CI-FPOL',  ARRAY['CEPOL','Centro Politécnica'],     'FPOL',      'Representación Estudiantil Politécnica', 'Presidente del Centro Interno', 'Centro Interno de Estudiantes de la Facultad Politécnica.', ARRAY['Asistencia de inscripción','Préstamo de herramientas','Eventos deportivos'], 'ci.politecnica@uagrm.edu.bo')
) AS v(codigo, nombre, sigla, alias, padre_cod, responsable, cargo_responsable, descripcion, servicios, correo)
JOIN public.unidad p ON p.codigo = v.padre_cod
ON CONFLICT (codigo) DO NOTHING;
