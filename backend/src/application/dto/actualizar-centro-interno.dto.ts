import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { CrearCentroInternoDto } from './crear-centro-interno.dto';

export class ActualizarCentroInternoDto extends PartialType(
  OmitType(CrearCentroInternoDto, ['codigo'] as const),
) {
  @ApiPropertyOptional()
  sedeCodigo?: string;
}
