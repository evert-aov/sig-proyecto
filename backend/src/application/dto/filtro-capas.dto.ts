import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class FiltroCapasDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de facultad' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facultadId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por código de sede (CU, CAMPUS, etc.)' })
  @IsOptional()
  @IsString()
  sedeCodigo?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoría de leyenda' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Filtrar elementos accesibles / sin escaleras' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloAccesible?: boolean;
}
