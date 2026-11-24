import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActualizarEdificioDto } from '../../application/dto/actualizar-edificio.dto';
import { ActualizarEdificioUseCase } from '../../application/use-cases/actualizar-edificio.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.strategy';

@ApiTags('Edificios')
@Controller('edificios')
export class EdificiosController {
  constructor(private readonly actualizarEdificioUseCase: ActualizarEdificioUseCase) {}

  @Patch(':codigo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar solo datos descriptivos de un edificio (sin modificar su geometría ni ubicación)',
  })
  actualizarDescriptivos(
    @Param('codigo') codigo: string,
    @Body() dto: ActualizarEdificioDto,
  ) {
    return this.actualizarEdificioUseCase.ejecutar(codigo, dto);
  }
}
