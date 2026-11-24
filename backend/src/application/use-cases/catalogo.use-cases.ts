import { Inject, Injectable } from '@nestjs/common';
import {
  EdificioResumenModel,
  FacultadModel,
  LeyendaItemModel,
  SedeModel,
  UnidadCentroModel,
} from '../../domain/models/catalogo.model';
import { CATALOGO_REPOSITORY, ICatalogoRepository } from '../../domain/repositories/repositories.interface';

@Injectable()
export class ObtenerLeyendaUseCase {
  constructor(@Inject(CATALOGO_REPOSITORY) private readonly repo: ICatalogoRepository) {}
  ejecutar(): Promise<LeyendaItemModel[]> {
    return this.repo.obtenerLeyenda();
  }
}

@Injectable()
export class ObtenerFacultadesUseCase {
  constructor(@Inject(CATALOGO_REPOSITORY) private readonly repo: ICatalogoRepository) {}
  ejecutar(): Promise<FacultadModel[]> {
    return this.repo.obtenerFacultades();
  }
}

@Injectable()
export class ObtenerSedesUseCase {
  constructor(@Inject(CATALOGO_REPOSITORY) private readonly repo: ICatalogoRepository) {}
  ejecutar(): Promise<SedeModel[]> {
    return this.repo.obtenerSedes();
  }
}

@Injectable()
export class ObtenerEdificiosUseCase {
  constructor(@Inject(CATALOGO_REPOSITORY) private readonly repo: ICatalogoRepository) {}
  ejecutar(): Promise<EdificioResumenModel[]> {
    return this.repo.obtenerEdificios();
  }
}

@Injectable()
export class ObtenerUnidadesCentroUseCase {
  constructor(@Inject(CATALOGO_REPOSITORY) private readonly repo: ICatalogoRepository) {}
  ejecutar(): Promise<UnidadCentroModel[]> {
    return this.repo.obtenerUnidadesCentro();
  }
}
