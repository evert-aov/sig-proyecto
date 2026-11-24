import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UsoEdificio } from '../../domain/models/catalogo.model';

export class ActualizarEdificioDto {
  @ApiPropertyOptional({ example: 'Módulo 236 — FICCT' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ type: [String], example: ['FICCT', 'Computación'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alias?: string[];

  @ApiPropertyOptional({ enum: ['academico', 'administrativo', 'servicios', 'deportivo', 'mixto'] })
  @IsOptional()
  @IsIn(['academico', 'administrativo', 'servicios', 'deportivo', 'mixto'])
  uso?: UsoEdificio;

  @ApiPropertyOptional({ minimum: 1, maximum: 30, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  pisos?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ascensor?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string | null;
}
