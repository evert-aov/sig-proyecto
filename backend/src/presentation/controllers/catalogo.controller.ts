import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ObtenerEdificiosUseCase,
  ObtenerFacultadesUseCase,
  ObtenerLeyendaUseCase,
  ObtenerSedesUseCase,
  ObtenerUnidadesCentroUseCase,
} from '../../application/use-cases/catalogo.use-cases';

@ApiTags('Catálogo y Leyenda')
@Controller('catalogo')
export class CatalogoController {
  constructor(
    private readonly leyendaUseCase: ObtenerLeyendaUseCase,
    private readonly facultadesUseCase: ObtenerFacultadesUseCase,
    private readonly sedesUseCase: ObtenerSedesUseCase,
    private readonly edificiosUseCase: ObtenerEdificiosUseCase,
    private readonly unidadesCentroUseCase: ObtenerUnidadesCentroUseCase,
  ) {}

  @Get('leyenda')
  @ApiOperation({ summary: 'Obtener leyenda oficial unificada (v_leyenda)' })
  leyenda() {
    return this.leyendaUseCase.ejecutar();
  }

  @Get('facultades')
  @ApiOperation({ summary: 'Listar las 18 facultades de la UAGRM y cantidad de Centros Internos' })
  facultades() {
    return this.facultadesUseCase.ejecutar();
  }

  @Get('sedes')
  @ApiOperation({ summary: 'Listar sedes universitarias con superficie en m²' })
  sedes() {
    return this.sedesUseCase.ejecutar();
  }

  @Get('edificios')
  @ApiOperation({ summary: 'Listar edificios y módulos con pisos, ascensor y centroide' })
  edificios() {
    return this.edificiosUseCase.ejecutar();
  }

  @Get('unidades-centro')
  @ApiOperation({ summary: 'Listar unidades organizacionales de Centros Internos' })
  unidadesCentro() {
    return this.unidadesCentroUseCase.ejecutar();
  }
}
