-- 003_routing_and_functions.sql
-- Red peatonal (pgRouting 4.0 compatible), búsqueda tolerante a tildes y cálculo de rutas

-- =====================================================================
-- 1. ARMAR RED PEATONAL (pgRouting 4.0: pgr_extractVertices + SQL)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.armar_red()
RETURNS VOID AS $$
BEGIN
  IF current_setting('sig.armando_red', true) = '1' THEN
    RETURN;
  END IF;

  PERFORM set_config('sig.armando_red', '1', true);

  UPDATE public.via
  SET origen = NULL,
      destino = NULL;

  DELETE FROM public.via_nodo;

  IF EXISTS (SELECT 1 FROM public.via) THEN
    INSERT INTO public.via_nodo (id, geom)
    SELECT id::integer, geom
    FROM pgr_extractVertices(
      'SELECT id, ST_SnapToGrid(geom, 0.000001) AS geom FROM public.via ORDER BY id'
    );

    UPDATE public.via v
    SET origen = n.id
    FROM public.via_nodo n
    WHERE ST_DWithin(ST_SnapToGrid(ST_StartPoint(v.geom), 0.000001), n.geom, 0.000001);

    UPDATE public.via v
    SET destino = n.id
    FROM public.via_nodo n
    WHERE ST_DWithin(ST_SnapToGrid(ST_EndPoint(v.geom), 0.000001), n.geom, 0.000001);
  END IF;

  PERFORM set_config('sig.armando_red', '0', true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_via_armar_red_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.armar_red();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_via_armar_red ON public.via;
CREATE TRIGGER trg_via_armar_red
  AFTER INSERT OR UPDATE OF geom OR DELETE ON public.via
  FOR EACH STATEMENT EXECUTE FUNCTION public.fn_via_armar_red_trigger();

-- =====================================================================
-- 2. BUSCAR(texto): búsqueda sin tildes en ambiente, edificio y unidad
-- =====================================================================
CREATE OR REPLACE FUNCTION public.buscar(p_texto TEXT)
RETURNS TABLE (
  entidad TEXT,
  id INTEGER,
  codigo TEXT,
  nombre TEXT,
  subtitulo TEXT,
  categoria TEXT,
  color TEXT,
  sede_codigo TEXT,
  facultad_nombre TEXT,
  lon DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  relevancia INTEGER
) AS $$
DECLARE
  v_q TEXT;
BEGIN
  v_q := trim(unaccent(lower(COALESCE(p_texto, ''))));
  IF v_q = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH RECURSIVE jerarquia_facultad AS (
    SELECT
      u.id,
      CASE WHEN u.tipo = 'facultad' THEN u.id ELSE NULL END AS facultad_id,
      CASE WHEN u.tipo = 'facultad' THEN u.nombre ELSE NULL END AS facultad_nombre,
      u.padre_id
    FROM public.unidad u
    WHERE u.padre_id IS NULL OR u.tipo = 'facultad'
    UNION ALL
    SELECT
      h.id,
      COALESCE(jf.facultad_id, CASE WHEN h.tipo = 'facultad' THEN h.id ELSE NULL END),
      COALESCE(jf.facultad_nombre, CASE WHEN h.tipo = 'facultad' THEN h.nombre ELSE NULL END),
      h.padre_id
    FROM public.unidad h
    JOIN jerarquia_facultad jf ON h.padre_id = jf.id
    WHERE h.tipo <> 'facultad'
  )
  -- Ambientes (Centros Internos, consultorios, oficinas, etc.)
  SELECT
    'ambiente'::TEXT AS entidad,
    a.id,
    a.codigo,
    a.nombre,
    COALESCE(u.sigla || ' — ', '') || COALESCE(e.nombre, s.nombre, 'Campus UAGRM') AS subtitulo,
    ta.categoria,
    ta.color,
    s.codigo AS sede_codigo,
    jf.facultad_nombre,
    ST_X(a.geom) AS lon,
    ST_Y(a.geom) AS lat,
    CASE
      WHEN unaccent(lower(a.codigo)) = v_q OR unaccent(lower(COALESCE(u.sigla, ''))) = v_q THEN 100
      WHEN unaccent(lower(a.nombre)) LIKE v_q || '%' THEN 90
      WHEN unaccent(lower(a.nombre)) LIKE '%' || v_q || '%' THEN 80
      ELSE 65
    END AS relevancia
  FROM public.ambiente a
  JOIN public.tipo_ambiente ta ON ta.id = a.tipo_ambiente_id
  LEFT JOIN public.unidad u ON u.id = a.unidad_id
  LEFT JOIN jerarquia_facultad jf ON jf.id = u.id
  LEFT JOIN public.edificio e ON e.id = a.edificio_id
  LEFT JOIN public.sede s ON s.id = a.sede_id
  WHERE unaccent(lower(a.codigo)) LIKE '%' || v_q || '%'
     OR unaccent(lower(a.nombre)) LIKE '%' || v_q || '%'
     OR unaccent(lower(array_to_string(a.alias, ' '))) LIKE '%' || v_q || '%'
     OR unaccent(lower(array_to_string(a.servicios, ' '))) LIKE '%' || v_q || '%'
     OR unaccent(lower(COALESCE(u.nombre, '') || ' ' || COALESCE(u.sigla, '') || ' ' || array_to_string(COALESCE(u.alias, '{}'), ' '))) LIKE '%' || v_q || '%'
     OR unaccent(lower(COALESCE(jf.facultad_nombre, ''))) LIKE '%' || v_q || '%'

  UNION ALL

  -- Edificios
  SELECT
    'edificio'::TEXT AS entidad,
    e.id,
    e.codigo,
    e.nombre,
    'Edificio (' || e.pisos || ' pisos) — ' || s.nombre AS subtitulo,
    'edificio'::TEXT AS categoria,
    '#334155'::TEXT AS color,
    s.codigo AS sede_codigo,
    NULL::TEXT AS facultad_nombre,
    ST_X(COALESCE(e.centro, ST_Centroid(e.geom))) AS lon,
    ST_Y(COALESCE(e.centro, ST_Centroid(e.geom))) AS lat,
    CASE
      WHEN unaccent(lower(e.codigo)) = v_q THEN 95
      WHEN unaccent(lower(e.nombre)) LIKE '%' || v_q || '%' THEN 75
      ELSE 60
    END AS relevancia
  FROM public.edificio e
  JOIN public.sede s ON s.id = e.sede_id
  WHERE e.geom IS NOT NULL
    AND (
      unaccent(lower(e.codigo)) LIKE '%' || v_q || '%'
      OR unaccent(lower(e.nombre)) LIKE '%' || v_q || '%'
      OR unaccent(lower(array_to_string(e.alias, ' '))) LIKE '%' || v_q || '%'
    )

  ORDER BY relevancia DESC, nombre ASC
  LIMIT 25;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================================
-- 3. RUTA(o_lon, o_lat, d_lon, d_lat, solo_accesible, radio_m)
--    Calcula ruta más corta con pgr_dijkstra y detecta extintores/centros médicos
-- =====================================================================
CREATE OR REPLACE FUNCTION public.ruta(
  o_lon DOUBLE PRECISION,
  o_lat DOUBLE PRECISION,
  d_lon DOUBLE PRECISION,
  d_lat DOUBLE PRECISION,
  solo_accesible BOOLEAN DEFAULT FALSE,
  radio_m NUMERIC DEFAULT 40
)
RETURNS JSONB AS $$
DECLARE
  v_origen_pt GEOMETRY(POINT, 4326);
  v_destino_pt GEOMETRY(POINT, 4326);
  v_nodo_inicio INTEGER;
  v_nodo_fin INTEGER;
  v_edges_sql TEXT;
  v_ruta_geom GEOMETRY;
  v_distancia_m NUMERIC(10, 1);
  v_tramos JSONB;
  v_elementos_seguridad JSONB;
BEGIN
  v_origen_pt := ST_SetSRID(ST_MakePoint(o_lon, o_lat), 4326);
  v_destino_pt := ST_SetSRID(ST_MakePoint(d_lon, d_lat), 4326);

  IF solo_accesible THEN
    SELECT n.id INTO v_nodo_inicio
    FROM public.via_nodo n
    WHERE EXISTS (
      SELECT 1 FROM public.via v
      WHERE v.accesible = true AND (v.origen = n.id OR v.destino = n.id)
    )
    ORDER BY n.geom <-> v_origen_pt
    LIMIT 1;

    SELECT n.id INTO v_nodo_fin
    FROM public.via_nodo n
    WHERE EXISTS (
      SELECT 1 FROM public.via v
      WHERE v.accesible = true AND (v.origen = n.id OR v.destino = n.id)
    )
    ORDER BY n.geom <-> v_destino_pt
    LIMIT 1;

    v_edges_sql := 'SELECT id, origen AS source, destino AS target, longitud_m AS cost, longitud_m AS reverse_cost FROM public.via WHERE accesible = true AND origen IS NOT NULL AND destino IS NOT NULL';
  ELSE
    SELECT n.id INTO v_nodo_inicio
    FROM public.via_nodo n
    ORDER BY n.geom <-> v_origen_pt
    LIMIT 1;

    SELECT n.id INTO v_nodo_fin
    FROM public.via_nodo n
    ORDER BY n.geom <-> v_destino_pt
    LIMIT 1;

    v_edges_sql := 'SELECT id, origen AS source, destino AS target, longitud_m AS cost, longitud_m AS reverse_cost FROM public.via WHERE origen IS NOT NULL AND destino IS NOT NULL';
  END IF;

  IF v_nodo_inicio IS NULL OR v_nodo_fin IS NULL THEN
    RETURN jsonb_build_object(
      'encontrada', false,
      'mensaje', 'No existen nodos de red peatonal disponibles para calcular la ruta.'
    );
  END IF;

  IF v_nodo_inicio = v_nodo_fin THEN
    RETURN jsonb_build_object(
      'encontrada', false,
      'mensaje', 'El origen y el destino corresponden al mismo nodo de la red.'
    );
  END IF;

  WITH dijkstra AS (
    SELECT seq, path_seq, node, edge, cost, agg_cost
    FROM pgr_dijkstra(v_edges_sql, v_nodo_inicio, v_nodo_fin, directed := false)
    WHERE edge <> -1
  ),
  tramos_ordenados AS (
    SELECT
      d.seq,
      v.id,
      v.codigo,
      v.nombre,
      v.superficie,
      v.techado,
      v.accesible,
      v.longitud_m,
      v.geom
    FROM dijkstra d
    JOIN public.via v ON v.id = d.edge
    ORDER BY d.seq
  )
  SELECT
    ST_LineMerge(ST_Collect(t.geom ORDER BY t.seq)),
    ROUND(COALESCE(SUM(t.longitud_m), 0)::numeric, 1),
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'codigo', t.codigo,
          'nombre', COALESCE(t.nombre, t.codigo),
          'superficie', t.superficie,
          'techado', t.techado,
          'accesible', t.accesible,
          'longitud_m', t.longitud_m
        ) ORDER BY t.seq
      ),
      '[]'::jsonb
    )
  INTO v_ruta_geom, v_distancia_m, v_tramos
  FROM tramos_ordenados t;

  IF v_ruta_geom IS NULL THEN
    RETURN jsonb_build_object(
      'encontrada', false,
      'solo_accesible', solo_accesible,
      'mensaje', 'No se encontró una ruta conectada entre el origen y el destino.'
    );
  END IF;

  -- Detectar extintores, botiquines, salidas de emergencia y centros médicos a menos de radio_m
  WITH seguridad_y_salud AS (
    SELECT
      'punto_interes'::TEXT AS capa,
      p.codigo,
      COALESCE(p.nombre, tp.nombre) AS nombre,
      tp.codigo AS tipo_codigo,
      tp.nombre AS tipo_nombre,
      tp.categoria,
      tp.color,
      tp.icono,
      p.piso,
      p.accesible,
      p.nota,
      p.extintor_agente,
      p.extintor_kg,
      p.extintor_vence,
      ROUND(ST_Distance(v_ruta_geom::geography, p.geom::geography)::numeric, 1) AS distancia_ruta_m,
      ST_AsGeoJSON(p.geom)::jsonb AS geometry
    FROM public.punto_interes p
    JOIN public.tipo_punto tp ON tp.id = p.tipo_punto_id
    WHERE tp.categoria = 'seguridad'
      AND ST_DWithin(v_ruta_geom::geography, p.geom::geography, radio_m)

    UNION ALL

    SELECT
      'ambiente'::TEXT AS capa,
      a.codigo,
      a.nombre,
      ta.codigo AS tipo_codigo,
      ta.nombre AS tipo_nombre,
      ta.categoria,
      ta.color,
      ta.icono,
      a.piso,
      (a.piso = 0 OR COALESCE(e.ascensor, false)) AS accesible,
      a.referencia AS nota,
      NULL::TEXT AS extintor_agente,
      NULL::NUMERIC AS extintor_kg,
      NULL::DATE AS extintor_vence,
      ROUND(ST_Distance(v_ruta_geom::geography, a.geom::geography)::numeric, 1) AS distancia_ruta_m,
      ST_AsGeoJSON(a.geom)::jsonb AS geometry
    FROM public.ambiente a
    JOIN public.tipo_ambiente ta ON ta.id = a.tipo_ambiente_id
    LEFT JOIN public.edificio e ON e.id = a.edificio_id
    WHERE ta.categoria = 'salud_seguridad'
      AND ST_DWithin(v_ruta_geom::geography, a.geom::geography, radio_m)
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'type', 'Feature',
        'geometry', s.geometry,
        'properties', jsonb_build_object(
          'capa', s.capa,
          'codigo', s.codigo,
          'nombre', s.nombre,
          'tipo_codigo', s.tipo_codigo,
          'tipo_nombre', s.tipo_nombre,
          'categoria', s.categoria,
          'color', s.color,
          'icono', s.icono,
          'piso', s.piso,
          'accesible', s.accesible,
          'nota', s.nota,
          'extintor_agente', s.extintor_agente,
          'extintor_kg', s.extintor_kg,
          'extintor_vence', s.extintor_vence,
          'distancia_ruta_m', s.distancia_ruta_m
        )
      ) ORDER BY s.distancia_ruta_m ASC
    ),
    '[]'::jsonb
  )
  INTO v_elementos_seguridad
  FROM seguridad_y_salud s;

  RETURN jsonb_build_object(
    'encontrada', true,
    'solo_accesible', solo_accesible,
    'radio_m', radio_m,
    'nodo_inicio', v_nodo_inicio,
    'nodo_fin', v_nodo_fin,
    'distancia_m', v_distancia_m,
    'tiempo_estimado_min', ROUND((v_distancia_m / 75.0)::numeric, 1),
    'ruta_geojson', jsonb_build_object(
      'type', 'Feature',
      'geometry', ST_AsGeoJSON(v_ruta_geom)::jsonb,
      'properties', jsonb_build_object(
        'distancia_m', v_distancia_m,
        'solo_accesible', solo_accesible
      )
    ),
    'tramos', v_tramos,
    'elementos_cercanos', jsonb_build_object(
      'type', 'FeatureCollection',
      'features', v_elementos_seguridad
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;
