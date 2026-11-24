-- 004_views.sql
-- Vistas de consumo para la aplicación y control de calidad topológica (QA)

-- =====================================================================
-- 1. V_LEYENDA: catálogo unificado de leyenda para las 4 capas
-- =====================================================================
CREATE OR REPLACE VIEW public.v_leyenda AS
SELECT 'ambiente'::TEXT AS capa, codigo, nombre, categoria, color, icono, orden, descripcion
FROM public.tipo_ambiente
UNION ALL
SELECT 'punto_interes'::TEXT AS capa, codigo, nombre, categoria, color, icono, orden, descripcion
FROM public.tipo_punto
UNION ALL
SELECT 'area'::TEXT AS capa, codigo, nombre, categoria, color, icono, orden, descripcion
FROM public.tipo_area
UNION ALL
SELECT 'via'::TEXT AS capa, codigo, nombre, categoria, color, icono, orden, descripcion
FROM public.tipo_via
ORDER BY capa, orden, nombre;

-- =====================================================================
-- 2. V_AMBIENTE: ambientes enriquecidos con unidad, facultad, edificio, sede y accesibilidad
-- =====================================================================
CREATE OR REPLACE VIEW public.v_ambiente AS
WITH RECURSIVE unidad_facultad AS (
  SELECT
    u.id,
    CASE WHEN u.tipo = 'facultad' THEN u.id ELSE NULL::INTEGER END AS facultad_id,
    CASE WHEN u.tipo = 'facultad' THEN u.codigo ELSE NULL::TEXT END AS facultad_codigo,
    CASE WHEN u.tipo = 'facultad' THEN u.nombre ELSE NULL::TEXT END AS facultad_nombre,
    CASE WHEN u.tipo = 'facultad' THEN u.sigla ELSE NULL::TEXT END AS facultad_sigla
  FROM public.unidad u
  WHERE u.padre_id IS NULL OR u.tipo = 'facultad'
  UNION ALL
  SELECT
    h.id,
    COALESCE(uf.facultad_id, CASE WHEN h.tipo = 'facultad' THEN h.id ELSE NULL::INTEGER END),
    COALESCE(uf.facultad_codigo, CASE WHEN h.tipo = 'facultad' THEN h.codigo ELSE NULL::TEXT END),
    COALESCE(uf.facultad_nombre, CASE WHEN h.tipo = 'facultad' THEN h.nombre ELSE NULL::TEXT END),
    COALESCE(uf.facultad_sigla, CASE WHEN h.tipo = 'facultad' THEN h.sigla ELSE NULL::TEXT END)
  FROM public.unidad h
  JOIN unidad_facultad uf ON h.padre_id = uf.id
  WHERE h.tipo <> 'facultad'
)
SELECT
  a.id,
  a.codigo,
  a.nombre,
  a.alias,
  a.piso,
  a.referencia,
  a.encargado,
  a.telefono,
  a.horario,
  a.servicios,
  a.descripcion,
  a.verificado_en,
  a.grupo_id,
  ta.codigo AS tipo_codigo,
  ta.nombre AS tipo_nombre,
  ta.categoria,
  ta.color,
  ta.icono,
  u.id AS unidad_id,
  u.codigo AS unidad_codigo,
  u.nombre AS unidad_nombre,
  u.sigla AS unidad_sigla,
  u.tipo AS unidad_tipo,
  u.responsable AS unidad_responsable,
  u.cargo_responsable AS unidad_cargo_responsable,
  u.correo AS unidad_correo,
  u.web AS unidad_web,
  uf.facultad_id,
  uf.facultad_codigo,
  uf.facultad_nombre,
  uf.facultad_sigla,
  e.id AS edificio_id,
  e.codigo AS edificio_codigo,
  e.nombre AS edificio_nombre,
  e.pisos AS edificio_pisos,
  e.ascensor AS edificio_ascensor,
  s.id AS sede_id,
  s.codigo AS sede_codigo,
  s.nombre AS sede_nombre,
  (a.piso = 0 OR COALESCE(e.ascensor, false)) AS llegada_sin_escaleras,
  (
    SELECT f.ruta
    FROM public.foto f
    WHERE f.ambiente_id = a.id
    ORDER BY f.principal DESC, f.id ASC
    LIMIT 1
  ) AS foto_principal,
  ST_X(a.geom) AS lon,
  ST_Y(a.geom) AS lat,
  a.geom,
  a.creado_en,
  a.actualizado_en
FROM public.ambiente a
JOIN public.tipo_ambiente ta ON ta.id = a.tipo_ambiente_id
LEFT JOIN public.unidad u ON u.id = a.unidad_id
LEFT JOIN unidad_facultad uf ON uf.id = u.id
LEFT JOIN public.edificio e ON e.id = a.edificio_id
LEFT JOIN public.sede s ON s.id = a.sede_id;

-- =====================================================================
-- 3. V_PUNTO_INTERES: puntos de infraestructura listos para el mapa
-- =====================================================================
CREATE OR REPLACE VIEW public.v_punto_interes AS
SELECT
  p.id,
  p.codigo,
  COALESCE(p.nombre, tp.nombre) AS nombre,
  p.piso,
  p.accesible,
  p.nota,
  p.extintor_agente,
  p.extintor_kg,
  p.extintor_vence,
  (p.extintor_vence IS NOT NULL AND p.extintor_vence < CURRENT_DATE) AS extintor_vencido,
  p.verificado_en,
  p.grupo_id,
  tp.codigo AS tipo_codigo,
  tp.nombre AS tipo_nombre,
  tp.categoria,
  tp.color,
  tp.icono,
  e.id AS edificio_id,
  e.codigo AS edificio_codigo,
  e.nombre AS edificio_nombre,
  e.ascensor AS edificio_ascensor,
  s.id AS sede_id,
  s.codigo AS sede_codigo,
  s.nombre AS sede_nombre,
  (p.piso = 0 OR COALESCE(e.ascensor, false)) AS llegada_sin_escaleras,
  ST_X(p.geom) AS lon,
  ST_Y(p.geom) AS lat,
  p.geom,
  p.creado_en,
  p.actualizado_en
FROM public.punto_interes p
JOIN public.tipo_punto tp ON tp.id = p.tipo_punto_id
LEFT JOIN public.edificio e ON e.id = p.edificio_id
LEFT JOIN public.sede s ON s.id = p.sede_id;

-- =====================================================================
-- 4. VISTAS DE CONTROL DE CALIDAD TOPOLÓGICA (QA)
-- =====================================================================
CREATE OR REPLACE VIEW public.v_ambiente_fuera_de_edificio AS
SELECT
  a.id,
  a.codigo,
  a.nombre,
  e.codigo AS edificio_codigo,
  e.nombre AS edificio_nombre,
  ROUND(ST_Distance(a.geom::geography, e.geom::geography)::numeric, 2) AS distancia_m
FROM public.ambiente a
JOIN public.edificio e ON e.id = a.edificio_id
WHERE e.geom IS NOT NULL
  AND NOT ST_Covers(e.geom, a.geom);

CREATE OR REPLACE VIEW public.v_via_desconectada AS
WITH nodos_grado AS (
  SELECT n.id, COUNT(v.id) AS grado
  FROM public.via_nodo n
  LEFT JOIN public.via v ON v.origen = n.id OR v.destino = n.id
  GROUP BY n.id
)
SELECT
  v.id,
  v.codigo,
  v.nombre,
  v.sede_id,
  ng_o.grado AS grado_origen,
  ng_d.grado AS grado_destino
FROM public.via v
LEFT JOIN nodos_grado ng_o ON ng_o.id = v.origen
LEFT JOIN nodos_grado ng_d ON ng_d.id = v.destino
WHERE v.origen IS NULL
   OR v.destino IS NULL
   OR (COALESCE(ng_o.grado, 0) <= 1 AND COALESCE(ng_d.grado, 0) <= 1);

CREATE OR REPLACE VIEW public.v_entrada_sin_via AS
SELECT
  p.id,
  p.codigo,
  p.nombre,
  s.codigo AS sede_codigo,
  ROUND(COALESCE(MIN(ST_Distance(p.geom::geography, v.geom::geography)), 999999)::numeric, 2) AS distancia_via_m
FROM public.punto_interes p
JOIN public.tipo_punto tp ON tp.id = p.tipo_punto_id
LEFT JOIN public.sede s ON s.id = p.sede_id
LEFT JOIN public.via v ON ST_DWithin(p.geom::geography, v.geom::geography, 2.0)
WHERE tp.codigo = 'ENTRADA'
GROUP BY p.id, p.codigo, p.nombre, s.codigo
HAVING COUNT(v.id) = 0;
