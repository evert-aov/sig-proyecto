# Guía de Desarrolladores — SIG UAGRM 2026-2 (Grupo 16: Centros Internos)

Esta guía documenta la arquitectura, convenciones y flujo de desarrollo del proyecto para que cualquier integrante del grupo que clone el repositorio público pueda ejecutarlo, entenderlo y extenderlo sin romper la estructura limpia ni el modelo de datos común.

---

## 1. Requisitos e Instalación Multiplataforma

El proyecto incluye un entorno reproducible para **NixOS**, pero también puede levantarse en **Ubuntu/Debian, Windows o macOS**.

### Opción A — NixOS (recomendada)
```bash
nix develop
./scripts/db-reset.sh
```
Esto levanta PostgreSQL 18 + PostGIS 3.6 + pgRouting 4.0 en `127.0.0.1:5433` (base `sig_uagrm`, usuario `sig_admin`, clave `sig_uagrm_2026`) usando el directorio local `.pgdata/`.

### Opción B — Ubuntu / Debian / Windows / macOS (sin Nix)
1. **Instalar dependencias:**
   - **Node.js `>= 22.22` o `24 LTS`** (`npm >= 10`)
   - **PostgreSQL 17/18 + PostGIS 3.x + pgRouting 3.4+/4.0** (o vía Docker: `docker run -d --name sig-pg -p 5433:5432 -e POSTGRES_USER=sig_admin -e POSTGRES_PASSWORD=sig_uagrm_2026 -e POSTGRES_DB=sig_uagrm pgrouting/pgrouting:17-3.5-3.7`)
   - **GDAL** (`ogr2ogr`) y **QGIS** (para el flujo ETL y mapas)
2. **Inicializar la base de datos manualmente (en orden exacto):**
   ```bash
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/migrations/001_extensions_and_schema.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/migrations/002_triggers_and_rules.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/migrations/003_routing_and_functions.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/migrations/004_views.sql

   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/seeds/010_catalogos_y_grupos.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/seeds/020_facultades_uagrm.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/seeds/030_demo_cu_campus.sql
   psql -h 127.0.0.1 -p 5433 -U sig_admin -d sig_uagrm -f database/seeds/040_usuarios_demo.sql
   ```
3. **Configurar variables de entorno del backend:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```
4. **Levantar el frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Abrir `http://localhost:4200` (Swagger API en `http://localhost:3000/api/docs`).

---

## 2. Arquitectura del Backend (`backend/src/`)

El backend usa **NestJS 12 + TypeORM 1.1** con **Arquitectura Limpia por capas**. No se debe colocar SQL ni lógica de negocio dentro de los controladores ni concentrar múltiples dominios en un solo archivo.

```text
backend/src/
├── domain/
│   ├── models/            # Interfaces puras de dominio (CentroInterno, RutaCalculada, etc.)
│   ├── ports/             # Puertos externos (ej. FOTO_STORAGE_PORT)
│   └── repositories/      # Contratos e injection tokens (CAPAS_REPOSITORY, etc.)
├── application/
│   ├── dto/               # Validaciones HTTP con class-validator + Swagger
│   ├── mappers/           # Transformación a GeoJSON estándar
│   └── use-cases/         # Un caso de uso por operación (ej. CalcularRutaUseCase)
├── infrastructure/
│   ├── config/            # Lectura de .env y configuración TypeORM (synchronize: false)
│   ├── persistence/typeorm/
│   │   ├── entities/      # Mapeo declarativo de tablas (sin alteración automática de esquema)
│   │   └── repositories/  # Implementación real con SQL espacial PostGIS / pgRouting
│   ├── auth/              # Estrategia Passport JWT y guard JwtAuthGuard
│   └── storage/           # LocalFotoStorage: guarda imágenes en uploads/fotos/CINT/<CODIGO>/
└── presentation/
    ├── controllers/       # Controladores REST delgados (solo delegan a UseCases)
    ├── filters/           # GlobalHttpExceptionFilter (traduce códigos PG 23505/23514/P0001)
    └── modules/           # Ensamblado de DI por módulo funcional
```

### Flujo de una petición HTTP
`Controller (presentation)` → valida `DTO` → llama `UseCase (application)` → invoca token `Repository / Port (domain)` → ejecuta `Pg*Repository (infrastructure)` en PostGIS → retorna modelo limpio o `FeatureCollection` GeoJSON.

### Cómo agregar un nuevo endpoint / caso de uso
1. Define el tipo de retorno en `domain/models/` y el método en la interfaz correspondiente de `domain/repositories/repositories.interface.ts`.
2. Crea el `DTO` en `application/dto/` (si recibe parámetros) y la clase `@Injectable()` en `application/use-cases/`.
3. Implementa la consulta SQL/PostGIS parametrizada (`$1`, `$2`...) en `infrastructure/persistence/typeorm/repositories/`.
4. Expón la ruta en `presentation/controllers/` y registra el `UseCase` en `presentation/modules/feature.modules.ts`.

### Autenticación JWT y Fotos
- Las rutas de lectura (`GET`) son públicas.
- Las rutas de escritura (`POST`, `PATCH`, `DELETE` en `/api/centros-internos` y `/api/fotos`) están protegidas con `@UseGuards(JwtAuthGuard)`.
- Los usuarios se almacenan en `app_auth.usuario_app` (esquema separado para no alterar `public`).
- Las fotos subidas se validan por MIME (`image/jpeg`, `image/png`, `image/webp`) y se guardan en `uploads/fotos/CINT/<CODIGO>/<timestamp>-<nombre>.<ext>`, servidas estáticamente en `/uploads/fotos/...`.

---

## 3. Arquitectura del Frontend (`frontend/src/app/`)

El frontend usa **Angular 22 (Standalone + Zoneless + Signals)** con **separación estricta entre lógica y vista**:
- **Prohibido** usar `template:` o `styles:` inline en `@Component`. Todo componente tiene obligatoriamente sus 3 archivos: `.component.ts`, `.component.html` y `.component.scss`.
- Los componentes presentacionales (`components/`) solo reciben `input()` y emiten `output()`; los contenedores de página (`pages/`) se comunican con los `Facades`.

```text
frontend/src/app/
├── core/
│   ├── api/               # SigApiService (HTTP) + authInterceptor (adjunta Bearer JWT)
│   ├── models/            # Interfaces TypeScript sincronizadas con el backend
│   ├── services/
│   │   ├── maplibre-engine.service.ts  # Motor MapLibre GL JS 6 (2D/3D, capas GeoJSON, estilos)
│   │   ├── turf-spatial.service.ts     # Análisis cliente con Turf.js 7 (buffer, rumbo, distancia)
│   │   ├── locar-engine.service.ts     # Motor AR LocAR.js 0.2 + Three.js 0.181 (cámara + sprites)
│   │   └── geolocation.service.ts      # GPS del navegador con respaldo UAGRM
│   └── state/             # Facades con Signals (MapaState, RutasState, ArState, AuthState, AdminState)
├── shared/components/     # Navegación superior (TopNavComponent)
└── features/
    ├── mapa/              # Visor 2D/3D, filtros por facultad/sede, rutas, leyenda, detalle
    ├── ar/                # Vista de Realidad Aumentada móvil + modo simulador 3D para PC
    └── admin/             # Login JWT, CRUD Centros Internos, subida de fotos, superficies y QA
```

### Detalles técnicos clave que debes respetar si modificas el frontend
1. **MapLibre GL JS v6 Worker:**
   - MapLibre v6 es ESM puro y carga el worker desde `/maplibre-gl-worker.mjs`.
   - En `frontend/angular.json` está copiado como asset desde `node_modules/maplibre-gl/dist` hacia `/`, y en `MaplibreEngineService` se registra con `setWorkerUrl('/maplibre-gl-worker.mjs')`. **Si cambias `angular.json`, debes reiniciar `ng serve`**.
   - Si agregas nuevas fuentes GeoJSON, usa `mapEngine.actualizarFuente(...)` para aprovechar la cola `fuentesPendientes` (evita condiciones de carrera antes del evento `load`).
2. **LocAR.js + Three.js:**
   - `locar@0.2.12` requiere **`three@^0.181.0`** en la raíz de `frontend/package.json` para evitar instancias duplicadas de Three.js en tiempo de ejecución.
3. **Pruebas de GPS y AR en celular:**
   - En PC sin chip GPS, el navegador estima ubicación por IP (precisión de varios kilómetros).
   - Para probar en celular con GPS real y cámara AR:
     - **Por Wi-Fi con HTTPS:** `./scripts/dev-https.sh` y luego `npx ng serve --host 0.0.0.0 --ssl --ssl-cert ../.certs/dev-cert.pem --ssl-key ../.certs/dev-key.pem --proxy-config proxy.conf.json`.
     - **Por USB con `adb`:** `adb reverse tcp:4200 tcp:4200 && adb reverse tcp:3000 tcp:3000` (permite usar `http://localhost:4200` en el navegador del celular como contexto seguro).

---

## 4. Base de Datos Espacial y Flujo ETL (`database/`)

- **Esquema `public` compatible con los 22 grupos:** las 14 tablas (`grupo`, `sede`, `unidad`, `tipo_*`, `edificio`, `ambiente`, `punto_interes`, `area`, `via_nodo`, `via`, `foto`) siguen el modelo común v1.0.
- **Convenciones obligatorias:**
  - `EPSG:4326` (WGS 84) en todas las geometrías.
  - Códigos validados por regex `^[A-Z0-9-]+$` (solo mayúsculas, números y guiones).
  - `grupo_id = 16` en los datos levantados por nuestro equipo.
  - Tolerancia GPS de **10.0 m** entre un `ambiente` / `punto_interes` y el polígono de su `edificio`.
- **pgRouting 4.0 (`armar_red()`):**
  - En pgRouting 4.0 se eliminaron `pgr_createTopology` y `pgr_nodeNetwork`; por eso `armar_red()` utiliza `pgr_extractVertices` + `ST_SnapToGrid` y se dispara automáticamente cuando cambia `public.via`.
- **Importación desde QGIS / QField / Shapefiles:**
  ```bash
  # Importar todas las capas del GeoPackage o carpeta de shapefiles:
  ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg

  # Importar solo capas específicas (ej. sede y edificio):
  ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg sede,edificio
  ```
  El ETL repara polígonos menores con `ST_MakeValid`, convierte códigos de texto (`TIPO`, `EDIFICIO`, `SEDE`) a sus `id`, reconstruye la red de rutas y ejecuta las vistas QA (`v_ambiente_fuera_de_edificio`, `v_via_desconectada`, `v_entrada_sin_via`).

---

## 5. Flujo Git y Seguridad en Repositorio Público

### Qué NO subir nunca al repositorio (ya protegido en `.gitignore`)
- `backend/.env` (subir solo `.env.example` con valores de desarrollo local).
- `.pgdata/`, `.certs/`, `uploads/`, `node_modules/`, `dist/`, `.angular/`, `*.tsbuildinfo`, `.~lock.*`.
- Credenciales reales de producción o servidores en la nube.

### Flujo recomendado para trabajar entre compañeros
1. Crear una rama desde `master`/`main` antes de editar:
   ```bash
   git checkout -b feat/mi-modulo
   ```
2. Verificar siempre compilación antes de hacer commit:
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```
3. Usar mensajes de commit claros por área (`feat(frontend): ...`, `feat(backend): ...`, `fix(database): ...`, `docs: ...`).
