import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscarDto } from '../../application/dto/comunes.dto';
import { CalcularRutaDto } from '../../application/dto/calcular-ruta.dto';
import {
  BuscarInfraestructuraUseCase,
  CalcularRutaUseCase,
  ObtenerAmbientesEnSedeUseCase,
  ObtenerQaTopologicaUseCase,
  ObtenerResumenEspacialUseCase,
} from '../../application/use-cases/espacial-rutas-busqueda.use-cases';

@ApiTags('Búsqueda')
@Controller('buscar')
export class BusquedaController {
  constructor(private readonly buscarUseCase: BuscarInfraestructuraUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Buscar ambientes, centros internos y edificios sin distinguir tildes' })
  buscar(@Query() dto: BuscarDto) {
    return this.buscarUseCase.ejecutar(dto.q);
  }
}

@ApiTags('Enrutamiento Peatonal (pgRouting)')
@Controller('rutas')
export class RutasController {
  constructor(private readonly calcularRutaUseCase: CalcularRutaUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Calcular ruta peatonal más corta y detectar extintores/centros médicos cercanos' })
  calcular(@Query() dto: CalcularRutaDto) {
    return this.calcularRutaUseCase.ejecutar(dto);
  }
}

@ApiTags('Consultas Espaciales y QA')
@Controller('espacial')
export class EspacialController {
  constructor(
    private readonly resumenUseCase: ObtenerResumenEspacialUseCase,
    private readonly qaUseCase: ObtenerQaTopologicaUseCase,
    private readonly ambientesEnSedeUseCase: ObtenerAmbientesEnSedeUseCase,
  ) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de superficies (m²) y longitudes (m) por sede' })
  resumen() {
    return this.resumenUseCase.ejecutar();
  }

  @Get('qa')
  @ApiOperation({ summary: 'Control de calidad topológica (fuera de edificio, vías desconectadas, entradas)' })
  qa() {
    return this.qaUseCase.ejecutar();
  }

  @Get('dentro-de-sede/:sedeCodigo')
  @ApiOperation({ summary: 'Consulta espacial ST_Contains de ambientes dentro de una sede' })
  dentroDeSede(@Param('sedeCodigo') sedeCodigo: string) {
    return this.ambientesEnSedeUseCase.ejecutar(sedeCodigo);
  }
}
