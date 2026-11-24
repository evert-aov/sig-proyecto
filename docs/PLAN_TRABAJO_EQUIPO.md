# Plan de Trabajo en Equipo — Proyecto SIG UAGRM 2026-2 (Grupo 16: Centros Internos)

**Materia:** INF442-SA  
**Tema:** Grupo 16 — Centros Internos (Mapa Web 2D/3D, Enrutamiento Peatonal, Realidad Aumentada y Plano Digital QGIS)  
**Integrantes:** 5  

---

## 1. Alcance del Levantamiento

- **Qué SÍ se levanta:** Las **12 facultades urbanas de Santa Cruz de la Sierra** (Ciudad Universitaria `CU`, Campus El Cristo `CAMPUS` y `VALLECITO` si aplica).
- **Qué NO se levanta:** Las **6 facultades integrales de provincia** (`FICH` Chaco, `FINOR` Norte, `FINI` Ichilo, `FICHQ` Chiquitana, `FIVC` Valles Cruceños y `FINE` Nor-Este) **no se capturarán** por imposibilidad de traslado; se dejará documentado en el informe que el levantamiento de campo cubre las facultades de la capital.
- **Ya está listo en el sistema:** Base de datos PostgreSQL/PostGIS/pgRouting, Backend NestJS, Frontend Web 2D/3D + AR, las 18 facultades precargadas y **20 polígonos reales de edificios** (`M185`, `M202`, `M212`–`M291`).

---

## 2. Repartición Exacta del Trabajo (5 Integrantes)

Cada integrante tiene **facultades, módulos y rangos de códigos exclusivos** para que nunca haya códigos duplicados ni trabajo repetido.

| Integrante | Rol y Facultades asignadas | Módulos / Edificios | Qué debe capturar y digitalizar | Rango exclusivo de códigos |
| :--- | :--- | :--- | :--- | :--- |
| **Integrante 1 (Líder Técnico / Integrador)** | **Web + BD + Integración + Plano Final** + solo **`FICCT`** | `M236` *(+ terminar de calcar edificios faltantes: `FCHDA`, Posta CU, `FCA`)* | 1. Terminar edificios faltantes en QGIS.<br>2. Campo en **`M236` (FICCT)**: Centros Internos (Informática, Sistemas, Redes), `ascensor`, fotos y extintores del módulo.<br>3. Senderos (`via`) y entradas solo del sector **`M236` FICCT**.<br>4. Unir entregas de los 4 compañeros, validar QA, subir fotos y generar Plano PDF. | Centros: `M236-CI-*`<br>Extintores: `M236-EXT*`<br>Vías: `CU-V101..199`<br>Entradas: `CU-ENT01..05` |
| **Integrante 2** | **`FCET`** (Tecnología)<br>**`FPOL`** (Politécnica)<br>**`FCCA`** (Contaduría/Auditoría) | `M224`, `M225`, `M251` (`FCET`)<br>`M202`, `M212` (`FPOL`)<br>`M213`, `M214` (`FCCA`) | 1. Campo: todos los Centros Internos de estas 3 facultades + fotos (puerta y fachada).<br>2. Verificar en cada módulo si tiene ascensor (`S`/`N`) y pisos.<br>3. Capturar extintores/botiquines del sector.<br>4. Digitalizar en QGIS los senderos (`via`) y entradas (`ENTRADA`) de su sector (Noreste y Este de CU). | Centros: `M224-CI-*`, `M225-CI-*`, `M251-CI-*`, `M202-CI-*`, `M212-CI-*`, `M213-CI-*`, `M214-CI-*`<br>Extintores: `<MODULO>-EXT*`<br>Vías: `CU-V201..299`<br>Entradas: `CU-ENT06..10` |
| **Integrante 3** | **`FCEE`** (Económicas)<br>**`FCV`** (Veterinaria)<br>+ **Posta Médica / Enfermería CU** | `M255`, `M256`, `M257`, `M264`, `M265` (`FCEE`)<br>`M228` (`FCV`)<br>`CU-SALUD` (Posta CU) | 1. Campo: Centros Internos de FCEE y FCV + **Enfermería / Consultorio Médico de CU** (necesario para el punto 22 de rutas) + fotos.<br>2. Verificar `ascensor` (`S`/`N`) de cada módulo.<br>3. Extintores/botiquines del sector.<br>4. Digitalizar senderos (`via`), entradas (`ENTRADA`) del sector Centro/Sur CU y 2–3 plazas/parqueos (`area`). | Centros: `M255-CI-*`..`M265-CI-*`, `M228-CI-*`<br>Salud: `CU-SALUD-ENF`, `CU-SALUD-MED`<br>Vías: `CU-V301..399`<br>Entradas: `CU-ENT11..15` |
| **Integrante 4** | **`FHUM`** (Humanidades)<br>**`FCSH`** (Salud Humana)<br>**`FCFB`** (Farmacia/Bioquímica)<br>**`FCHDA`** (Hábitat) | `M254`, `M262`, `M263` (`FHUM`)<br>`M272` (`FCSH`)<br>`M291` (`FCFB`)<br>Módulos `FCHDA` | 1. Campo: Centros Internos de estas 4 facultades + fotos.<br>2. Verificar `ascensor` (`S`/`N`) de cada módulo.<br>3. Extintores/botiquines del sector.<br>4. Digitalizar senderos (`via`) y entradas (`ENTRADA`) del sector Oeste y Norte de CU. | Centros: `M254-CI-*`, `M262-CI-*`, `M263-CI-*`, `M272-CI-*`, `M291-CI-*`, `M242-CI-*`<br>Extintores: `<MODULO>-EXT*`<br>Vías: `CU-V401..499`<br>Entradas: `CU-ENT16..20` |
| **Integrante 5** | **`FCJPS`** (Derecho — Campus El Cristo)<br>**`FCA`** (Agrícola — Vallecito)<br>+ **Informe y Diapositivas** | `M185` (`CAMPUS`)<br>Bloque `FCA` (`VALLECITO`) | 1. Campo en **Campus El Cristo (`M185`)** y **Vallecito (`FCA`)**: Centros Internos, `ascensor`, fotos y extintores.<br>2. Digitalizar senderos (`via`) y entradas (`ENTRADA`) de `CAMPUS` y la acera de conexión hacia `CU` (y `VALLECITO`).<br>3. Redactar informe técnico y presentación de defensa del grupo. | Centros: `M185-CI-*`, `VAL-CI-*`<br>Extintores: `M185-EXT*`, `VAL-EXT*`<br>Vías: `CAMPUS-V501..599`, `VAL-V501..520`<br>Entradas: `CAMPUS-ENT01..05`, `VAL-ENT01..02` |

---

## 3. Reglas Obligatorias de Llenado (para los 5)

Si se incumple alguno de estos formatos, la base de datos rechaza automáticamente el registro:

1. **`codigo`:** **SOLO MAYÚSCULAS, NÚMEROS Y GUIONES** (`A-Z`, `0-9`, `-`).
   - Prohibido usar espacios, tildes, `Ñ` o guion bajo `_`.
   - Ejemplos válidos: `M255-CI-ADM`, `M236-EXT01`, `CU-V201`, `CU-ENT06`.
2. **Listas (`alias`, `servicios`):** separar elementos con **punto y coma `;`** (sin espacio extra si es posible).
   - Ejemplo: `Casos especiales;Banco de examenes;Orientacion`
3. **Booleanos (`ascensor`, `accesible`, `techado`):** usar **`S`** o **`N`** (en `via.accesible` usar `true` / `false`).
4. **`piso`:** número entero donde **`0` = Planta Baja**, `1` = 1er piso, `2` = 2do piso, `-1` = sótano.
5. **`grupo`:** escribir siempre **`16`**.
6. **Tolerancia GPS de `ambiente` y `punto_interes`:** cuando tomes un punto dentro/junto a un módulo, debe caer **dentro del polígono del edificio o a máximo 10 metros** de su borde.
7. **Fotos reales:** tomar **2 fotos por cada Centro Interno**:
   - Una de la **puerta** (`puerta.jpg`).
   - Una de la **fachada** del módulo (`fachada.jpg`).
   - Guardarlas en una carpeta con el código exacto del Centro Interno (ej. `fotos/M255-CI-ADM/puerta.jpg`).

---

## 4. Qué Datos Anotar en Cada Capa

### A. Centro Interno (capa `ambiente`) — *Lo más importante del proyecto*
- `codigo`: ej. `M255-CI-ADM`
- `nombre`: ej. `Centro Interno de Administración de Empresas`
- `alias`: siglas/apodos separados por `;` (ej. `CEAE;Centro de Administracion`)
- `tipo`: **`CENTRO_INTERNO`** *(para Posta Médica usar `ENFERMERIA` o `CONSULTORIO`)*
- `unidad`: si la carrera ya existe usa su código (`CI-FCEE-ADM`); si es nueva, deja vacío y anota el nombre completo de la carrera y facultad en `descrip` para que el Integrante 1 la dé de alta en `unidad`.
- `edificio`: código del módulo (ej. `M255`)
- `sede`: `CU`, `CAMPUS` o `VALLECITO`
- `piso`: `0`, `1`, `2`...
- `referencia`: indicación clara para encontrar la puerta (ej. `Planta baja, segunda puerta entrando por el pasillo norte`)
- `encargado`: nombre del presidente o encargado actual
- `telefono`: teléfono de contacto (si tienen)
- `horario`: ej. `Lun-Vie 08:30-12:30 y 15:00-19:00`
- `servicios`: separados por `;` (ej. `Certificados;Casos especiales;Banco de examenes;Talleres`)
- `verificado`: fecha en formato `YYYY-MM-DD` (ej. `2026-11-25`)
- `grupo`: `16`

### B. Infraestructura en ruta (capa `punto_interes`)
- `ENTRADA`: portones/ingresos peatonales al campus (**obligatorio pegarla al extremo de una `via`**).
- `EXTINTOR`: extintores en pasillos/halls del recorrido (anotar si se ve en etiqueta: `ext_agente` = `PQS`/`CO2`/`AGUA`, `ext_kg` = peso, `ext_vence` = `YYYY-MM-DD`).
- `BOTIQUIN`, `RAMPA`, `GRADAS`, `SALIDA_EMERGENCIA`.

### C. Verificación de edificios (anotar en libreta o tabla si cambia algo)
Revisar en tus módulos asignados:
- Si el edificio tiene **ascensor funcional (`S`/`N`)** *(actualmente falta confirmar en todos los módulos)*.
- Si la cantidad de **`pisos`** (contando planta baja) coincide con la realidad.

---

## 5. Manual Paso a Paso: Cómo Usar QField en el Celular (Campo)

### Antes de salir (lo prepara el Integrante 1 una vez)
1. Abrir `qgis/plantilla_campo_grupo16.gpkg` en QGIS (ya trae las 4 `sede` y los 20 `edificio` reales con `ambiente`, `punto_interes`, `area` y `via` limpios).
2. Terminar los polígonos de edificios faltantes (`FCHDA`, Posta CU, `FCA` Vallecito) y aplicar los estilos de `qgis/styles/*.qml`.
3. Añadir mapa base `OpenStreetMap` (`XYZ Tiles`) y guardar como `qgis/proyecto_campo_grupo16.qgz` (`EPSG:4326`).
4. Instalar el plugin **`QFieldSync`** (`Plugins → Manage and Install Plugins`).
5. Ir a **`Plugins → QFieldSync → Package for QField`**, exportar a una carpeta `paquete_qfield_grupo16`, comprimirla en `.zip` y enviarla al grupo de WhatsApp/Drive.

### En campo con tu celular (Integrantes 1 al 5)
1. **Instala QField:** descarga **QField for QGIS** desde Play Store (Android) o App Store (iPhone).
2. **Abre el proyecto:**
   - Descomprime `paquete_qfield_grupo16.zip` en tu celular (ej. en `Descargas/paquete_qfield_grupo16`).
   - Abre **QField** → **`Abrir archivo local`** → busca esa carpeta → abre el archivo **`.qgs`** del proyecto.
   - Acepta los permisos de **Ubicación precisa**.
3. **Ubícate con GPS:**
   - Toca el botón de **mira GPS** (abajo a la derecha). El mapa centrará un punto azul en tu posición real.
   - Espera unos segundos al aire libre junto al módulo para que la precisión baje a **< 10 m**.
4. **Capturar un Centro Interno (`ambiente`):**
   - Toca el menú **`☰`** (arriba izquierda) → activa el **lápiz (Modo edición/digitalización)** → selecciona la capa **`ambiente`**.
   - Párate en la puerta (si está en piso 1 o 2, toma la coordenada en el ingreso del módulo y anota el `piso` correcto).
   - Toca el botón verde **`+`** para fijar el punto *(asegúrate visualmente de que el punto caiga **dentro del polígono amarillo/gris del edificio**)*.
   - Llena los campos (`codigo`, `nombre`, `alias`, `tipo = CENTRO_INTERNO`, `edificio`, `piso`, `referencia`, `encargado`, `telefono`, `horario`, `servicios`, `verificado = YYYY-MM-DD`, `grupo = 16`).
   - Toca el check **`✓`** (arriba izquierda) para guardar.
5. **Capturar Entradas, Extintores y Botiquines (`punto_interes`):**
   - En el menú **`☰`** cambia la capa activa a **`punto_interes`**.
   - Toca **`+`**, elige `tipo` (`EXTINTOR`, `BOTIQUIN`, `ENTRADA`, `RAMPA`), llena `codigo`, `edificio` (o `sede`), `accesible` (`S`/`N`), `grupo = 16` → **`✓`**.
6. **Tomar las fotos:**
   - Con la cámara de tu celular toma la foto de la puerta y la de la fachada, guardando el par en una carpeta con el código (ej. `M255-CI-ADM/`).
7. **Enviar tu avance:**
   - Comprime tu carpeta `paquete_qfield_grupo16` (donde quedó el `.gpkg` con tus puntos guardados) + tu carpeta `fotos/` y envíalas como `entrega_intX.zip` al Integrante 1.

---

## 6. Manual Paso a Paso: Cómo Usar QGIS en PC (Digitalizar Senderos `via` y Entradas)

Cada integrante dibuja los senderos peatonales (`via`) de **su propia zona** en QGIS (en laptop/PC) sobre `qgis/plantilla_campo_grupo16.gpkg` (o sobre su propio `.gpkg` después de regresar de campo):

1. **Abrir las capas en QGIS:**
   - Menú **`Layer → Add Layer → Add Vector Layer...`** (`Ctrl + Shift + V`) → selecciona tu archivo `.gpkg` → **`Select All`** → **`Add Layers`**.
   - En el panel izquierdo `Browser` → `XYZ Tiles` → doble clic en **`OpenStreetMap`** (arrástralo al fondo de la lista `Layers` para verlo debajo de todo).
   - *(Opcional satélite)* Clic derecho en `XYZ Tiles → New Connection`: URL `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`.
2. **Activar barras de edición y Snapping (OBLIGATORIO):**
   - Menú **`View → Toolbars`** → activa **`Snapping Toolbar`** y **`Advanced Digitizing Toolbar`**.
   - En `Snapping Toolbar` enciende el **imán 🧲 (`Enable Snapping`)**:
     - Modo: **`All Layers`**
     - Tipo: **`Vertex and Segment`**
     - Tolerancia: **`12 px`**
     - Enciende **`Enable Topological Editing`** (al lado del imán).
3. **Reglas de red (sin esto pgRouting NO calcula rutas):**
   - **Regla 1 (Snapping):** cada tramo que se une con otro debe hacer clic exactamente sobre el **cuadro/cruz rosa** del vértice existente.
   - **Regla 2 (Cortar en cada cruce):** dos caminos que se cruzan deben ser **cuatro tramos**, nunca líneas largas cruzándose sin nodo en medio. Dibuja tramo por tramo de intersección a intersección (o usa la herramienta de tijeras **`Split Features`**).
   - **Regla 3 (`ENTRADA` conectada):** si capturaste una `ENTRADA` en campo, muévela con el **`Vertex Tool`** o dibuja la `via` hasta el **punto rosa exacto** de la `ENTRADA` (distancia < 2 m).
4. **Dibujar un tramo de `via`:**
   - Selecciona `via` en `Layers` → clic en el **lápiz amarillo** (`Toggle Editing`) → **`Add Line Feature`**.
   - Clic izquierdo en los vértices del camino → **clic derecho** para terminar el tramo en el cruce.
   - Llena: `codigo` (ej. `CU-V201` usando tu rango), `tipo` (`SENDERO`, `ACERA` o `PASILLO_TECHADO`), `sede` (`CU` o `CAMPUS`), `superficie` (`cemento`, `adoquin`, `asfalto`, `tierra`), `techado` (`S`/`N`), `accesible` (`true` si es plano/rampa, **`false` si tiene gradas**), `grupo` (`16`).
   - Guarda con el **disquete 💾** y cierra el lápiz.

---

## 7. Lo que Falta para Cerrar el Proyecto (Checklist Final del Grupo)

1. [ ] **Integrante 1:** Completar edificios faltantes (`FCHDA`, Posta CU, `FCA`), capturar `FICCT` (`M236`) y senderos de `FICCT`.
2. [ ] **Integrantes 2, 3, 4 y 5:** Recorrido de campo con QField + fotos + digitalización de senderos (`via`) de su zona.
3. [ ] **Integrante 1 (Integración en PostgreSQL):**
   - Agregar en `public.unidad` los Centros Internos nuevos encontrados en campo.
   - Actualizar campo `ascensor` (`S`/`N`) de los edificios según lo relevado en campo.
   - Consolidar las entregas en QGIS verificando uniones de `via` entre zonas de compañeros y ejecutar:
     ```bash
     nix develop
     psql -c "TRUNCATE public.foto, public.ambiente, public.punto_interes, public.via, public.via_nodo, public.area RESTART IDENTITY CASCADE;"
     ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg
     ```
   - Verificar en `/admin → QA Topológica`: `fuera_edif = 0`, `via_desc = 0`, `ent_sin_via = 0`.
   - Subir todas las fotos en `/admin` (`CINT/<CODIGO>/...`).
4. [ ] **Integrante 1 (Plano Final QGIS):** Generar el plano PDF a 300 DPI usando `qgis/plano_print_template.qpt` con leyenda oficial y tabla de superficies (`m²`).
5. [ ] **Integrante 5 + Todos (Pruebas y Defensa):** Probar en celular (GPS real + ruta accesible con extintores/enfermería + AR `/ar` por HTTPS), redactar informe y armar diapositivas.

---

## 8. Cronograma Sugerido (4 Días)

- **Día 1 (Hoy):** Integrante 1 termina edificios faltantes y envía `paquete_qfield_grupo16.zip`; todos instalan QField y revisan sus módulos asignados.
- **Día 2 (Campo UAGRM — 2 a 3 h):** Los 5 integrantes levantan Centros Internos, `ascensor`, extintores, entradas y fotos en sus sectores.
- **Día 3 (QGIS + Integración):** Cada integrante dibuja las `via` de su zona y envía su `.zip`; Integrante 1 une todo en PostgreSQL, corrige QA a `0` y sube fotos.
- **Día 4 (Plano + Pruebas + Defensa):** Generación del plano PDF final, pruebas en vivo (2D/3D, rutas y AR) y entrega del informe/presentación.
