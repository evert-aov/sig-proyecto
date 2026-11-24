import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActualizarCentroInternoDto } from '../../application/dto/actualizar-centro-interno.dto';
import { CrearCentroInternoDto } from '../../application/dto/crear-centro-interno.dto';
import { FiltroCentrosDto } from '../../application/dto/filtro-centros.dto';
import {
  ActualizarCentroInternoUseCase,
  CrearCentroInternoUseCase,
  EliminarCentroInternoUseCase,
  ListarCentrosInternosUseCase,
  ObtenerCentroInternoUseCase,
} from '../../application/use-cases/centros-internos.use-cases';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.strategy';

@ApiTags('Centros Internos (Grupo 16)')
@Controller('centros-internos')
export class CentrosInternosController {
  constructor(
    private readonly listarUseCase: ListarCentrosInternosUseCase,
    private readonly obtenerUseCase: ObtenerCentroInternoUseCase,
    private readonly crearUseCase: CrearCentroInternoUseCase,
    private readonly actualizarUseCase: ActualizarCentroInternoUseCase,
    private readonly eliminarUseCase: EliminarCentroInternoUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar Centros Internos filtrados por facultad, sede o accesibilidad' })
  listar(@Query() filtro: FiltroCentrosDto) {
    return this.listarUseCase.ejecutar(filtro);
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Obtener ficha completa y fotos de un Centro Interno por código' })
  obtenerPorCodigo(@Param('codigo') codigo: string) {
    return this.obtenerUseCase.ejecutar(codigo);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo Centro Interno (requiere JWT)' })
  crear(@Body() dto: CrearCentroInternoDto) {
    return this.crearUseCase.ejecutar(dto);
  }

  @Patch(':codigo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar datos o ubicación de un Centro Interno (requiere JWT)' })
  actualizar(@Param('codigo') codigo: string, @Body() dto: ActualizarCentroInternoDto) {
    return this.actualizarUseCase.ejecutar(codigo, dto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un Centro Interno (requiere JWT)' })
  eliminar(@Param('codigo') codigo: string) {
    return this.eliminarUseCase.ejecutar(codigo);
  }
}
