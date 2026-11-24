-- 002_triggers_and_rules.sql
-- Reglas automáticas de integridad espacial, auditoría, superficies y longitudes

CREATE OR REPLACE FUNCTION public.fn_set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoría a todas las tablas
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'grupo', 'sede', 'unidad', 'tipo_area', 'tipo_ambiente', 'tipo_punto', 'tipo_via',
      'edificio', 'ambiente', 'punto_interes', 'area', 'via', 'foto'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_actualizado_en ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_actualizado_en BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.fn_set_actualizado_en();',
      tbl, tbl
    );
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_usuario_app_actualizado_en ON app_auth.usuario_app;
CREATE TRIGGER trg_usuario_app_actualizado_en
  BEFORE UPDATE ON app_auth.usuario_app
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_actualizado_en();

-- =====================================================================
-- SEDE: geometría válida + cálculo automático de area_m2
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_sede_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geom IS NOT NULL THEN
    IF NOT ST_IsValid(NEW.geom) THEN
      RAISE EXCEPTION 'La geometría de la sede % no es válida: %', NEW.codigo, ST_IsValidReason(NEW.geom);
    END IF;
    NEW.area_m2 := ROUND(ST_Area(NEW.geom::geography)::numeric, 1);
  ELSE
    NEW.area_m2 := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sede_geom ON public.sede;
CREATE TRIGGER trg_sede_geom
  BEFORE INSERT OR UPDATE OF geom ON public.sede
  FOR EACH ROW EXECUTE FUNCTION public.fn_sede_geom();

-- =====================================================================
-- EDIFICIO: geometría válida + centro + cálculo automático de area_m2
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_edificio_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geom IS NOT NULL THEN
    IF NOT ST_IsValid(NEW.geom) THEN
      RAISE EXCEPTION 'La geometría del edificio % no es válida: %', NEW.codigo, ST_IsValidReason(NEW.geom);
    END IF;
    NEW.area_m2 := ROUND(ST_Area(NEW.geom::geography)::numeric, 1);
    NEW.centro := ST_PointOnSurface(NEW.geom);
  ELSE
    NEW.area_m2 := NULL;
    NEW.centro := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_edificio_geom ON public.edificio;
CREATE TRIGGER trg_edificio_geom
  BEFORE INSERT OR UPDATE OF geom ON public.edificio
  FOR EACH ROW EXECUTE FUNCTION public.fn_edificio_geom();

-- =====================================================================
-- AREA: geometría válida + area_m2 + sede automática por ubicación
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_area_geom()
RETURNS TRIGGER AS $$
DECLARE
  v_sede_id SMALLINT;
BEGIN
  IF NOT ST_IsValid(NEW.geom) THEN
    RAISE EXCEPTION 'La geometría del área % no es válida: %', NEW.codigo, ST_IsValidReason(NEW.geom);
  END IF;

  NEW.area_m2 := ROUND(ST_Area(NEW.geom::geography)::numeric, 1);

  IF NEW.sede_id IS NULL THEN
    SELECT s.id INTO v_sede_id
    FROM public.sede s
    WHERE s.geom IS NOT NULL AND ST_Intersects(s.geom, NEW.geom)
    ORDER BY ST_Area(ST_Intersection(s.geom, NEW.geom)::geography) DESC
    LIMIT 1;
    NEW.sede_id := v_sede_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_area_geom ON public.area;
CREATE TRIGGER trg_area_geom
  BEFORE INSERT OR UPDATE OF geom, sede_id ON public.area
  FOR EACH ROW EXECUTE FUNCTION public.fn_area_geom();

-- =====================================================================
-- VIA: longitud_m automática + sede automática por ubicación
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_via_geom()
RETURNS TRIGGER AS $$
DECLARE
  v_sede_id SMALLINT;
BEGIN
  NEW.longitud_m := ROUND(ST_Length(NEW.geom::geography)::numeric, 1);

  IF NEW.sede_id IS NULL THEN
    SELECT s.id INTO v_sede_id
    FROM public.sede s
    WHERE s.geom IS NOT NULL AND ST_Intersects(s.geom, NEW.geom)
    ORDER BY ST_Length(ST_Intersection(s.geom, NEW.geom)::geography) DESC
    LIMIT 1;
    NEW.sede_id := v_sede_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_via_geom ON public.via;
CREATE TRIGGER trg_via_geom
  BEFORE INSERT OR UPDATE OF geom, sede_id ON public.via
  FOR EACH ROW EXECUTE FUNCTION public.fn_via_geom();

-- =====================================================================
-- AMBIENTE Y PUNTO_INTERES: sede automática, piso válido y tolerancia GPS 10 m
-- =====================================================================
CREATE OR REPLACE FUNCTION public.fn_validar_punto_en_edificio()
RETURNS TRIGGER AS $$
DECLARE
  v_edif RECORD;
  v_sede_id SMALLINT;
  v_dist NUMERIC;
BEGIN
  IF NEW.edificio_id IS NOT NULL THEN
    SELECT id, codigo, sede_id, pisos, geom
    INTO v_edif
    FROM public.edificio
    WHERE id = NEW.edificio_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El edificio_id % no existe.', NEW.edificio_id;
    END IF;

    IF NEW.sede_id IS NULL THEN
      NEW.sede_id := v_edif.sede_id;
    ELSIF NEW.sede_id <> v_edif.sede_id THEN
      RAISE EXCEPTION 'La sede_id (%) de % no coincide con la sede_id (%) del edificio %.',
        NEW.sede_id, NEW.codigo, v_edif.sede_id, v_edif.codigo;
    END IF;

    IF NEW.piso > (v_edif.pisos - 1) THEN
      RAISE EXCEPTION 'El piso % de % excede el último piso del edificio % (pisos = %, máximo permitido = %).',
        NEW.piso, NEW.codigo, v_edif.codigo, v_edif.pisos, (v_edif.pisos - 1);
    END IF;

    IF v_edif.geom IS NOT NULL THEN
      v_dist := ROUND(ST_Distance(NEW.geom::geography, v_edif.geom::geography)::numeric, 2);
      IF v_dist > 10.0 THEN
        RAISE EXCEPTION 'El punto % está a % m del edificio % (tolerancia máxima GPS: 10.0 m).',
          NEW.codigo, v_dist, v_edif.codigo;
      END IF;
    END IF;
  ELSIF NEW.sede_id IS NULL THEN
    SELECT s.id INTO v_sede_id
    FROM public.sede s
    WHERE s.geom IS NOT NULL AND ST_Contains(s.geom, NEW.geom)
    LIMIT 1;
    NEW.sede_id := v_sede_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ambiente_validar ON public.ambiente;
CREATE TRIGGER trg_ambiente_validar
  BEFORE INSERT OR UPDATE OF geom, edificio_id, sede_id, piso ON public.ambiente
  FOR EACH ROW EXECUTE FUNCTION public.fn_validar_punto_en_edificio();

DROP TRIGGER IF EXISTS trg_punto_interes_validar ON public.punto_interes;
CREATE TRIGGER trg_punto_interes_validar
  BEFORE INSERT OR UPDATE OF geom, edificio_id, sede_id, piso ON public.punto_interes
  FOR EACH ROW EXECUTE FUNCTION public.fn_validar_punto_en_edificio();
