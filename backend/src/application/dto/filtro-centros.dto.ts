import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class FiltroCentrosDto {
  @ApiPropertyOptional({ description: 'ID de la facultad para filtrar centros internos' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facultadId?: number;

  @ApiPropertyOptional({ description: 'Código de la sede (CU, CAMPUS, etc.)' })
  @IsOptional()
  @IsString()
  sedeCodigo?: string;

  @ApiPropertyOptional({ description: 'Solo centros con llegada sin escaleras' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloSinEscaleras?: boolean;

  @ApiPropertyOptional({ description: 'Filtro de texto sobre nombre, código o sigla' })
  @IsOptional()
  @IsString()
  texto?: string;
}
