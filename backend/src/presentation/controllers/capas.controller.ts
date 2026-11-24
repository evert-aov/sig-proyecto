import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FiltroCapasDto } from '../../application/dto/filtro-capas.dto';
import { ObtenerCapaGeoJsonUseCase } from '../../application/use-cases/obtener-capa-geojson.use-case';

@ApiTags('Capas GeoJSON')
@Controller('capas')
export class CapasController {
  constructor(private readonly obtenerCapaUseCase: ObtenerCapaGeoJsonUseCase) {}

  @Get(':capa')
  @ApiOperation({ summary: 'Obtener una capa vectorial en formato GeoJSON (EPSG:4326)' })
  @ApiParam({
    name: 'capa',
    enum: ['sedes', 'edificios', 'ambientes', 'centros-internos', 'puntos-interes', 'areas', 'vias'],
  })
  obtenerCapa(@Param('capa') capa: string, @Query() filtro: FiltroCapasDto) {
    return this.obtenerCapaUseCase.ejecutar(capa, filtro);
  }
}
