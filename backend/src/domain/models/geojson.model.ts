export type GeoJsonGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'LineString'; coordinates: [number, number][] }
  | { type: 'MultiPolygon'; coordinates: [number, number][][][] }
  | { type: 'Polygon'; coordinates: [number, number][][] };

export interface GeoJsonFeature<TProps = Record<string, unknown>> {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJsonGeometry;
  properties: TProps;
}

export interface GeoJsonFeatureCollection<TProps = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoJsonFeature<TProps>[];
}

export type NombreCapa =
  | 'sedes'
  | 'edificios'
  | 'ambientes'
  | 'centros-internos'
  | 'puntos-interes'
  | 'areas'
  | 'vias';

export interface FiltroCapas {
  facultadId?: number;
  sedeCodigo?: string;
  categoria?: string;
  soloAccesible?: boolean;
}
