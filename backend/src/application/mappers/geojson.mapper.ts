import { GeoJsonFeature, GeoJsonFeatureCollection, GeoJsonGeometry } from '../../domain/models/geojson.model';
import { CentroInternoModel } from '../../domain/models/centro-interno.model';

export class GeoJsonMapper {
  static aFeature<TProps extends Record<string, unknown>>(
    id: string | number,
    geometry: GeoJsonGeometry,
    properties: TProps,
  ): GeoJsonFeature<TProps> {
    return {
      type: 'Feature',
      id,
      geometry,
      properties,
    };
  }

  static aFeatureCollection<TProps extends Record<string, unknown>>(
    features: GeoJsonFeature<TProps>[],
  ): GeoJsonFeatureCollection<TProps> {
    return {
      type: 'FeatureCollection',
      features,
    };
  }
}

export class CentroInternoMapper {
  static aGeoJsonFeature(centro: CentroInternoModel): GeoJsonFeature {
    return {
      type: 'Feature',
      id: centro.id,
      geometry: {
        type: 'Point',
        coordinates: [centro.lon, centro.lat],
      },
      properties: {
        id: centro.id,
        codigo: centro.codigo,
        nombre: centro.nombre,
        alias: centro.alias,
        piso: centro.piso,
        referencia: centro.referencia,
        encargado: centro.encargado,
        telefono: centro.telefono,
        horario: centro.horario,
        servicios: centro.servicios,
        descripcion: centro.descripcion,
        tipo_codigo: centro.tipoCodigo,
        tipo_nombre: centro.tipoNombre,
        categoria: centro.categoria,
        color: centro.color,
        icono: centro.icono,
        unidad_codigo: centro.unidadCodigo,
        unidad_sigla: centro.unidadSigla,
        facultad_id: centro.facultadId,
        facultad_codigo: centro.facultadCodigo,
        facultad_nombre: centro.facultadNombre,
        facultad_sigla: centro.facultadSigla,
        edificio_codigo: centro.edificioCodigo,
        edificio_nombre: centro.edificioNombre,
        edificio_pisos: centro.edificioPisos,
        edificio_ascensor: centro.edificioAscensor,
        sede_codigo: centro.sedeCodigo,
        sede_nombre: centro.sedeNombre,
        llegada_sin_escaleras: centro.llegadaSinEscaleras,
        foto_principal: centro.fotoPrincipal,
      },
    };
  }
}
