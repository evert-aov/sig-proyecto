# Guía QGIS + QField — SIG UAGRM 2026-2 (Grupo 16: Centros Internos)

## 1. Archivos generados para QGIS
- **GeoPackage de trabajo:** `qgis/sig_uagrm_centros_internos.gpkg` (en **WGS 84 / EPSG:4326**).
  - Contiene las 6 capas espaciales con los nombres de campo exactos de la plantilla común (`CODIGO`, `TIPO`, `EDIFICIO`, `SEDE`, `ALIAS`, `SERVICIOS`, `GRUPO`, etc.):
    - `sede` (MultiPolygon)
    - `edificio` (MultiPolygon)
    - `area` (MultiPolygon)
    - `via` (LineString)
    - `punto_interes` (Point)
    - `ambiente` (Point)
- **Estilos QML oficiales:** `qgis/styles/*.qml` (colores de `v_leyenda`).
- **Plantilla de plano digital final:** `qgis/plano_print_template.qpt` (incluye marco de mapa, leyenda, barra de escala, flecha de norte y tabla de infraestructura).

## 2. Conexión directa a PostgreSQL/PostGIS desde QGIS
También puedes editar o visualizar la base directamente en QGIS:
1. En el panel **Navegador** → clic derecho en **PostgreSQL** → **Nueva conexión**.
2. Parámetros locales (`nix develop`):
   - **Nombre:** `SIG_UAGRM_Local`
   - **Anfitrión:** `127.0.0.1`
   - **Puerto:** `5433`
   - **Base de datos:** `sig_uagrm`
   - **Usuario / Contraseña:** `sig_admin` / `sig_uagrm_2026`
3. Cargar las capas o vistas `v_ambiente`, `v_punto_interes`, `edificio`, `via`, `area`, `sede` y aplicar los estilos de `qgis/styles/`.

## 3. Levantamiento en campo con QField (QFieldSync)
1. Instalar el plugin **QFieldSync** en QGIS (`Complementos → Administrar e instalar complementos`).
2. Abrir `qgis/sig_uagrm_centros_internos.gpkg` en QGIS y aplicar los `.qml` de `qgis/styles/`.
3. **Configurar propiedades para QField:**
   - Sistema de coordenadas del proyecto: **EPSG:4326 (WGS 84)** (para que las coordenadas GPS coincidan sin reproyecciones erróneas).
   - En **Propiedades de capa → Formularios de atributos**: configurar valores predeterminados `GRUPO = 16`, `TIPO = 'CENTRO_INTERNO'` para nuevos puntos de Centros Internos.
   - Activar el **Autoensamblado (Snapping)** a vértices y segmentos (tolerancia `10 px` o `0.5 m`) antes de dibujar `via` y `ENTRADA`.
4. **Empaquetar para QField:**
   - Clic en **QFieldSync → Empaquetar para QField**.
   - Seleccionar carpeta de exportación y copiarla al celular (USB o QFieldCloud).
5. **En campo con QField (celular):**
   - Ubicarse en la puerta del Centro Interno (tolerancia máxima respecto al edificio: **10 m**).
   - Capturar el punto, llenar `CODIGO` (`M236-CI-INF`), `NOMBRE`, `EDIFICIO` (`M236`), `PISO` (`0` = planta baja), `REFERENCIA`, `ENCARGADO`, `HORARIO`, `TELEFONO`, `SERVICIOS` (separados por `;`), `VERIFICADO` (`YYYY-MM-DD`).
   - Tomar foto de puerta y fachada (`CINT/<CODIGO>/puerta.jpg`) y subirla desde el panel `/admin` de la web app.
6. **Sincronizar e importar a PostgreSQL:**
   - Al regresar, usar **QFieldSync → Sincronizar desde QField**.
   - Ejecutar el script ETL dentro de `nix develop`:
     ```bash
     ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg
     ```
   - Verificar que `fuera_edif = 0`, `via_desc = 0`, `ent_sin_via = 0`.

## 4. Generación del Plano Digital Final con Leyenda y Tabla
1. En QGIS: **Proyecto → Nueva composición de impresión**.
2. **Diseño → Añadir elementos desde plantilla** → seleccionar `qgis/plano_print_template.qpt`.
3. Ajustar el encuadre del mapa sobre Ciudad Universitaria / Campus UAGRM, actualizar la tabla de atributos vinculada a `v_ambiente` / `edificio` (superficies en `m²` calculadas automáticamente por PostGIS) y exportar en **PDF / PNG 300 DPI**.
