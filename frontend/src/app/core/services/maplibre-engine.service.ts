import { Injectable } from '@angular/core';
import {
  GeoJSONSource,
  LngLatLike,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  StyleSpecification,
  setWorkerUrl,
} from 'maplibre-gl';
import { GeoJsonFeature, GeoJsonFeatureCollection } from '../models/sig.models';

export interface VisorCallbacks {
  onCentroClick: (codigo: string) => void;
  onMapaClick: (lon: number, lat: number) => void;
}

@Injectable({ providedIn: 'root' })
export class MaplibreEngineService {
  private map: MapLibreMap | null = null;
  private modo3D = false;
  private mapaCargado = false;
  private readonly fuentesPendientes = new Map<string, GeoJsonFeatureCollection>();

  inicializar(container: HTMLElement, callbacks: VisorCallbacks): void {
    this.destruir();
    setWorkerUrl('/maplibre-gl-worker.mjs');

    const style: StyleSpecification = {
      version: 8,
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 19,
          attribution: '&copy; OpenStreetMap contributors | SIG UAGRM 2026',
        },
        satelite: {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Tiles &copy; Esri World Imagery | SIG UAGRM 2026',
        },
      },
      layers: [
        {
          id: 'base-osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 22,
          layout: { visibility: 'visible' },
        },
        {
          id: 'base-satelite',
          type: 'raster',
          source: 'satelite',
          minzoom: 0,
          maxzoom: 22,
          layout: { visibility: 'none' },
        },
      ],
    };

    const map = new MapLibreMap({
      container,
      style,
      center: [-63.1953, -17.7762],
      zoom: 17.2,
      pitch: 0,
      bearing: 0,
    });
    this.map = map;

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      this.registrarFuentesYCapas(callbacks);
      this.mapaCargado = true;
      for (const [nombre, fc] of this.fuentesPendientes.entries()) {
        const src = map.getSource(nombre) as GeoJSONSource | undefined;
        src?.setData(fc as never);
      }
    });

    map.on('click', (ev) => {
      const features = map.queryRenderedFeatures(ev.point, {
        layers: ['centros-internos-circle'],
      });
      if (features && features.length > 0) {
        return;
      }
      callbacks.onMapaClick(ev.lngLat.lng, ev.lngLat.lat);
    });
  }

  private registrarFuentesYCapas(callbacks: VisorCallbacks): void {
    if (!this.map) return;

    const emptyFc: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] };
    const fuentes = [
      'sedes',
      'areas',
      'edificios',
      'vias',
      'puntos-interes',
      'centros-internos',
      'centro-seleccionado',
      'ruta-buffer',
      'ruta',
      'ruta-extremos',
      'ruta-seguridad',
      'usuario',
    ];

    for (const id of fuentes) {
      if (!this.map.getSource(id)) {
        this.map.addSource(id, { type: 'geojson', data: emptyFc as never });
      }
    }

    // 1. Sedes
    this.map.addLayer({
      id: 'sedes-line',
      type: 'line',
      source: 'sedes',
      paint: { 'line-color': '#1e40af', 'line-width': 2, 'line-dasharray': [4, 2] },
    });

    // 2. Áreas
    this.map.addLayer({
      id: 'areas-fill',
      type: 'fill',
      source: 'areas',
      paint: {
        'fill-color': ['coalesce', ['get', 'color'], '#82C91E'],
        'fill-opacity': 0.45,
      },
    });

    // 3. Edificios 2D y 3D
    this.map.addLayer({
      id: 'edificios-fill-2d',
      type: 'fill',
      source: 'edificios',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['get', 'tiene_centro_interno'], false],
          '#fee2e2',
          '#e2e8f0',
        ],
        'fill-outline-color': [
          'case',
          ['boolean', ['get', 'tiene_centro_interno'], false],
          '#cf222e',
          '#475569',
        ],
        'fill-opacity': 0.82,
      },
    });

    this.map.addLayer({
      id: 'edificios-extrusion-3d',
      type: 'fill-extrusion',
      source: 'edificios',
      layout: { visibility: 'none' },
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['get', 'tiene_centro_interno'], false],
          '#dc2626',
          '#64748b',
        ],
        'fill-extrusion-height': ['*', ['coalesce', ['get', 'pisos'], 2], 5.5],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.9,
        'fill-extrusion-vertical-gradient': true,
      },
    });

    this.map.addLayer({
      id: 'edificios-label',
      type: 'symbol',
      source: 'edificios',
      layout: {
        'text-field': ['get', 'codigo'],
        'text-size': 11,
        'text-font': ['Noto Sans Bold'],
      },
      paint: {
        'text-color': '#0f172a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    });

    // 4. Vías peatonales (accesibles continuas vs gradas punteadas)
    this.map.addLayer({
      id: 'vias-accesibles-line',
      type: 'line',
      source: 'vias',
      filter: ['==', ['get', 'accesible'], true],
      paint: {
        'line-color': '#a0522d',
        'line-width': 3,
      },
    });

    this.map.addLayer({
      id: 'vias-gradas-line',
      type: 'line',
      source: 'vias',
      filter: ['==', ['get', 'accesible'], false],
      paint: {
        'line-color': '#444c56',
        'line-width': 3,
        'line-dasharray': [2, 2],
      },
    });

    // 5. Buffer corredor de seguridad (Turf.js) y línea de ruta (pgRouting)
    this.map.addLayer({
      id: 'ruta-buffer-fill',
      type: 'fill',
      source: 'ruta-buffer',
      paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.14 },
    });

    this.map.addLayer({
      id: 'ruta-line',
      type: 'line',
      source: 'ruta',
      paint: { 'line-color': '#1d4ed8', 'line-width': 5.5, 'line-opacity': 0.92 },
    });

    // 6. Puntos de interés
    this.map.addLayer({
      id: 'puntos-interes-circle',
      type: 'circle',
      source: 'puntos-interes',
      paint: {
        'circle-radius': 5.5,
        'circle-color': ['coalesce', ['get', 'color'], '#24292F'],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    });

    // 7. Elementos de seguridad resaltados en la ruta
    this.map.addLayer({
      id: 'ruta-seguridad-circle',
      type: 'circle',
      source: 'ruta-seguridad',
      paint: {
        'circle-radius': 8.5,
        'circle-color': ['coalesce', ['get', 'color'], '#d1242f'],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#fef08a',
      },
    });

    // 8. Centros Internos (capa protagonista)
    this.map.addLayer({
      id: 'centros-internos-circle',
      type: 'circle',
      source: 'centros-internos',
      paint: {
        'circle-radius': 8.5,
        'circle-color': '#cf222e',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
      },
    });

    this.map.addLayer({
      id: 'centros-internos-label',
      type: 'symbol',
      source: 'centros-internos',
      layout: {
        'text-field': ['coalesce', ['get', 'unidad_sigla'], ['get', 'codigo']],
        'text-size': 11,
        'text-font': ['Noto Sans Bold'],
        'text-offset': [0, 1.3],
      },
      paint: {
        'text-color': '#991b1b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    });

    // 8b. Centro Interno seleccionado (halo ámbar + pin central)
    this.map.addLayer({
      id: 'centro-seleccionado-halo',
      type: 'circle',
      source: 'centro-seleccionado',
      paint: {
        'circle-radius': 18,
        'circle-color': '#f59e0b',
        'circle-opacity': 0.35,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#d97706',
      },
    });

    this.map.addLayer({
      id: 'centro-seleccionado-pin',
      type: 'circle',
      source: 'centro-seleccionado',
      paint: {
        'circle-radius': 9,
        'circle-color': '#b91c1c',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });

    // 8c. Extremos de ruta (Inicio / Destino)
    this.map.addLayer({
      id: 'ruta-extremos-circle',
      type: 'circle',
      source: 'ruta-extremos',
      paint: {
        'circle-radius': 9,
        'circle-color': ['case', ['==', ['get', 'rol'], 'origen'], '#16a34a', '#dc2626'],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });

    this.map.addLayer({
      id: 'ruta-extremos-label',
      type: 'symbol',
      source: 'ruta-extremos',
      layout: {
        'text-field': ['get', 'etiqueta'],
        'text-size': 11,
        'text-font': ['Noto Sans Bold'],
        'text-offset': [0, -1.5],
      },
      paint: {
        'text-color': '#0f172a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.8,
      },
    });

    // 9. Posición actual del usuario
    this.map.addLayer({
      id: 'usuario-halo',
      type: 'circle',
      source: 'usuario',
      paint: {
        'circle-radius': 16,
        'circle-color': '#0ea5e9',
        'circle-opacity': 0.28,
      },
    });

    this.map.addLayer({
      id: 'usuario-circle',
      type: 'circle',
      source: 'usuario',
      paint: {
        'circle-radius': 8,
        'circle-color': '#0284c7',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });

    this.map.on('mouseenter', 'centros-internos-circle', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'centros-internos-circle', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });

    this.map.on('click', 'centros-internos-circle', (ev) => {
      const feat = ev.features?.[0];
      const codigo = feat?.properties?.['codigo'] as string | undefined;
      if (codigo) {
        callbacks.onCentroClick(codigo);
      }
    });
  }

  actualizarFuente<TProps = Record<string, unknown>>(
    nombre: string,
    data: GeoJsonFeatureCollection<TProps> | GeoJsonFeature<TProps> | null,
  ): void {
    const fc = (!data
      ? { type: 'FeatureCollection', features: [] }
      : data.type === 'FeatureCollection'
        ? data
        : { type: 'FeatureCollection', features: [data] }) as GeoJsonFeatureCollection;

    this.fuentesPendientes.set(nombre, fc);

    if (!this.mapaCargado) return;
    const src = this.map?.getSource(nombre) as GeoJSONSource | undefined;
    src?.setData(fc as never);
  }

  setVisibilidadCapa(capaBase: string, visible: boolean): void {
    if (!this.map) return;
    const visibility = visible ? 'visible' : 'none';
    const layerMap: Record<string, string[]> = {
      sedes: ['sedes-line'],
      areas: ['areas-fill'],
      edificios: this.modo3D
        ? ['edificios-extrusion-3d', 'edificios-label']
        : ['edificios-fill-2d', 'edificios-label'],
      vias: ['vias-accesibles-line', 'vias-gradas-line'],
      'puntos-interes': ['puntos-interes-circle'],
      'centros-internos': ['centros-internos-circle', 'centros-internos-label'],
    };
    for (const layerId of layerMap[capaBase] ?? []) {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    }
  }

  alternar3D(activar: boolean): void {
    this.modo3D = activar;
    if (!this.map) return;

    if (this.map.getLayer('edificios-fill-2d')) {
      this.map.setLayoutProperty('edificios-fill-2d', 'visibility', activar ? 'none' : 'visible');
    }
    if (this.map.getLayer('edificios-extrusion-3d')) {
      this.map.setLayoutProperty('edificios-extrusion-3d', 'visibility', activar ? 'visible' : 'none');
    }

    this.map.easeTo({
      pitch: activar ? 55 : 0,
      bearing: activar ? -18 : 0,
      duration: 600,
    });
  }

  cambiarMapaBase(tipo: 'osm' | 'satelite'): void {
    if (!this.map) return;
    if (this.map.getLayer('base-osm')) {
      this.map.setLayoutProperty('base-osm', 'visibility', tipo === 'osm' ? 'visible' : 'none');
    }
    if (this.map.getLayer('base-satelite')) {
      this.map.setLayoutProperty('base-satelite', 'visibility', tipo === 'satelite' ? 'visible' : 'none');
    }
  }

  volarA(lon: number, lat: number, zoom = 18.2): void {
    this.map?.flyTo({
      center: [lon, lat] as LngLatLike,
      zoom,
      duration: 850,
    });
  }

  destruir(): void {
    this.mapaCargado = false;
    this.map?.remove();
    this.map = null;
  }
}
