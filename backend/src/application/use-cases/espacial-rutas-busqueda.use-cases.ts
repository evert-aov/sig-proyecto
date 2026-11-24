import { Inject, Injectable } from '@nestjs/common';
import { GeoJsonFeatureCollection } from '../../domain/models/geojson.model';
import {
  BusquedaResultadoModel,
  QaTopologicaModel,
  ResumenSuperficieSedeModel,
  RutaCalculadaModel,
} from '../../domain/models/espacial-y-seguridad.model';
import {
  BUSQUEDA_REPOSITORY,
  ESPACIAL_REPOSITORY,
  IBusquedaRepository,
  IEspacialRepository,
  IRutasRepository,
  RUTAS_REPOSITORY,
} from '../../domain/repositories/repositories.interface';
import { CalcularRutaDto } from '../dto/calcular-ruta.dto';

@Injectable()
export class BuscarInfraestructuraUseCase {
  constructor(@Inject(BUSQUEDA_REPOSITORY) private readonly repo: IBusquedaRepository) {}

  ejecutar(texto: string): Promise<BusquedaResultadoModel[]> {
    return this.repo.buscar(texto);
  }
}

@Injectable()
export class CalcularRutaUseCase {
  constructor(@Inject(RUTAS_REPOSITORY) private readonly repo: IRutasRepository) {}

  ejecutar(dto: CalcularRutaDto): Promise<RutaCalculadaModel> {
    return this.repo.calcularRuta(
      dto.oLon,
      dto.oLat,
      dto.dLon,
      dto.dLat,
      dto.soloAccesible ?? false,
      dto.radioM ?? 40,
    );
  }
}

@Injectable()
export class ObtenerResumenEspacialUseCase {
  constructor(@Inject(ESPACIAL_REPOSITORY) private readonly repo: IEspacialRepository) {}

  ejecutar(): Promise<ResumenSuperficieSedeModel[]> {
    return this.repo.obtenerResumenSuperficies();
  }
}

@Injectable()
export class ObtenerQaTopologicaUseCase {
  constructor(@Inject(ESPACIAL_REPOSITORY) private readonly repo: IEspacialRepository) {}

  ejecutar(): Promise<QaTopologicaModel> {
    return this.repo.obtenerQaTopologica();
  }
}

@Injectable()
export class ObtenerAmbientesEnSedeUseCase {
  constructor(@Inject(ESPACIAL_REPOSITORY) private readonly repo: IEspacialRepository) {}

  ejecutar(sedeCodigo: string): Promise<GeoJsonFeatureCollection> {
    return this.repo.obtenerAmbientesEnSede(sedeCodigo.toUpperCase());
  }
}
