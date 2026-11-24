import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FiltroCapas, GeoJsonFeatureCollection, NombreCapa } from '../../domain/models/geojson.model';
import { CAPAS_REPOSITORY, ICapasRepository } from '../../domain/repositories/repositories.interface';

const CAPAS_VALIDAS: ReadonlySet<string> = new Set([
  'sedes',
  'edificios',
  'ambientes',
  'centros-internos',
  'puntos-interes',
  'areas',
  'vias',
]);

@Injectable()
export class ObtenerCapaGeoJsonUseCase {
  constructor(
    @Inject(CAPAS_REPOSITORY)
    private readonly capasRepository: ICapasRepository,
  ) {}

  async ejecutar(capa: string, filtro: FiltroCapas): Promise<GeoJsonFeatureCollection> {
    if (!CAPAS_VALIDAS.has(capa)) {
      throw new BadRequestException(
        `Capa '${capa}' no válida. Capas soportadas: ${Array.from(CAPAS_VALIDAS).join(', ')}`,
      );
    }
    return this.capasRepository.obtenerGeoJson(capa as NombreCapa, filtro);
  }
}
