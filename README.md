# SIG UAGRM 2026-2 — Grupo 16: Centros Internos (INF442-SA)

Sistema de Información Geográfica Web, de Escritorio/Campo y de Realidad Aumentada para la localización, gestión, análisis espacial y enrutamiento peatonal hacia los **Centros Internos** de la Universidad Autónoma Gabriel René Moreno (UAGRM), respetando al 100% el **Modelo de Datos Común v1.0** para integración entre los 22 grupos.

## 1. Stack Tecnológico y Versiones Verificadas (NixOS 26.11)

| Capa | Tecnología | Versión | Rol en el proyecto |
| :--- | :--- | :--- | :--- |
| **Entorno Reproducible** | Nix Flakes (`flake.nix`) | Nix 2.34.8 | PostgreSQL + PostGIS + pgRouting + GDAL + Node.js + mkcert aislados por proyecto |
| **SIG Escritorio / Campo** | QGIS + QField / GDAL | QGIS 3.44.12 / GDAL 3.13.3 | GeoPackage `EPSG:4326`, simbología QML, plantilla de plano QPT y ETL `import_shapefiles.sh` |
| **Base de Datos Espacial** | PostgreSQL + PostGIS | PG 18.7 + PostGIS 3.6.4 | 14 tablas del modelo común, cálculo automático de `area_m2` y `longitud_m`, tolerancia GPS 10 m |
| **Enrutamiento** | pgRouting | pgRouting 4.0.1 | `armar_red()` con `pgr_extractVertices` + `pgr_dijkstra` con detección de extintores y centros médicos |
| **Backend** | NestJS + TypeORM | NestJS 12.6.0 + TypeORM 1.1.3 | API REST GeoJSON en Arquitectura Limpia (`domain` / `application` / `infrastructure` / `presentation`) + JWT + Swagger |
| **Mapa Web (Frontend)** | Angular + MapLibre GL JS + Turf.js | Angular 22.3.0 + MapLibre 6.19.0 + Turf 7.4.0 | Visor 2D/3D (extrusión por pisos), filtros por las 18 facultades, rutas y análisis cliente |
| **Realidad Aumentada** | LocAR.js + Three.js | LocAR 0.2.12 + Three 0.181.x | Vista AR móvil sobre cámara web con etiquetas 3D GPS y modo simulador para escritorio |

---

## 2. Arquitectura Limpia

- **Backend (`backend/src/`):**
  - `domain/`: Modelos puros, interfaces de repositorio (`CAPAS_REPOSITORY`, `CENTROS_INTERNOS_REPOSITORY`, etc.) y puerto de almacenamiento (`FOTO_STORAGE_PORT`).
  - `application/`: DTOs validados, mappers GeoJSON y casos de uso individuales (`use-cases/`).
  - `infrastructure/`: Configuración TypeORM (`synchronize: false`), repositorios PostgreSQL/PostGIS/pgRouting, JWT strategy y almacenamiento local de fotos bajo `uploads/fotos/CINT/<CODIGO>/`.
  - `presentation/`: Controladores delgados con Swagger y filtro global de excepciones SQL/PostGIS.
- **Frontend (`frontend/src/app/`):**
  - `core/api/`: Clientes HTTP REST + interceptor JWT.
  - `core/services/`: Motores técnicos aislados (`MaplibreEngineService`, `TurfSpatialService`, `LocarEngineService`, `GeolocationService`).
  - `core/state/`: Facades reactivas con Angular Signals (`MapaStateFacade`, `RutasStateFacade`, `ArStateFacade`, `AuthStateFacade`).
  - `features/` (`mapa`, `ar`, `admin`): Separación estricta de vista y lógica (`.component.ts`, `.component.html`, `.component.scss` sin plantillas ni estilos inline).

---

## 3. Puesta en Marcha en NixOS

### 3.1 Entrar al entorno Nix e inicializar la base de datos
```bash
nix develop
./scripts/db-reset.sh
```
Esto inicia PostgreSQL 18.7 en `127.0.0.1:5433` (directorio local `.pgdata`), crea la base `sig_uagrm` y ejecuta las migraciones `001..004` junto con los seeds `010..040`.

Para detener la base de datos:
```bash
./scripts/db-stop.sh
```

### 3.2 Iniciar Backend (NestJS 12)
```bash
cd backend
cp -n .env.example .env
npm install
npm run start:dev
```
- API base: `http://localhost:3000/api`
- Documentación Swagger: `http://localhost:3000/api/docs`
- Credenciales de administración JWT (demo): `admin@uagrm.edu.bo` / `AdminSIG2026!`

### 3.3 Iniciar Frontend (Angular 22)
En otra terminal dentro de `nix develop`:
```bash
cd frontend
npm install
npm start
```
Abrir en el navegador: `http://localhost:4200`

### 3.4 Probar Realidad Aumentada (LocAR.js) en celular con HTTPS local
Los navegadores móviles exigen **HTTPS** para habilitar cámara, GPS y brújula:
```bash
nix develop
./scripts/dev-https.sh
cd frontend
npx ng serve --host 0.0.0.0 --ssl --ssl-cert ../.certs/dev-cert.pem --ssl-key ../.certs/dev-key.pem --proxy-config proxy.conf.json
```
*(En PC sin cámara o fuera del campus, la ruta `/ar` incluye controles de **Posición Plaza CU** y **Brújula simulada**).*

---

## 4. Flujo QGIS + QField e Integración entre Grupos

- GeoPackage inicial en WGS 84 (`EPSG:4326`): `qgis/sig_uagrm_centros_internos.gpkg`
- Estilos categorizados oficiales: `qgis/styles/*.qml`
- Plantilla de plano digital final: `qgis/plano_print_template.qpt`
- Guía de levantamiento con QFieldSync: `qgis/qfield_guide.md`
- Importación de Shapefiles (plantilla de 10 caracteres del modelo común) o GeoPackage de campo hacia PostgreSQL:
  ```bash
  ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg
  ```
Todos los registros generados por este proyecto llevan `grupo_id = 16` (`CINT`) y códigos con el patrón `^[A-Z0-9-]+$`, listos para fusionarse sin colisiones con los aportes de los demás 21 grupos.

---

## 5. Documentación del Proyecto

- [Guía de Desarrolladores](docs/GUIA_DESARROLLADORES.md) — Instalación multiplataforma (NixOS, Ubuntu/Windows/macOS/Docker), arquitectura por capas de Backend y Frontend, reglas PostGIS/pgRouting y flujo Git.
- [Plan de Trabajo del Equipo (5 Integrantes)](docs/PLAN_TRABAJO_EQUIPO.md) — Repartición de facultades/módulos y manual de campo con QGIS + QField.
- [Guía QGIS y QFieldSync](qgis/qfield_guide.md) — Empaquetado móvil, simbología oficial y generación del plano digital final.
