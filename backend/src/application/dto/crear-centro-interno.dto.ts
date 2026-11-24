import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CrearCentroInternoDto {
  @ApiProperty({ example: 'M236-CI-NUEVO', description: 'Solo mayúsculas, números y guiones' })
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, { message: 'El código solo puede contener mayúsculas, números y guiones.' })
  codigo: string;

  @ApiProperty({ example: 'Centro Interno de Ciencia de Datos' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ type: [String], example: ['CICD'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alias?: string[];

  @ApiProperty({ example: 0, description: '0 = planta baja, 1 = primer piso' })
  @IsInt()
  @Min(-2)
  @Max(20)
  piso: number;

  @ApiPropertyOptional({ example: 'Planta baja, ala norte' })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiPropertyOptional({ example: 'Univ. Juan Pérez' })
  @IsOptional()
  @IsString()
  encargado?: string;

  @ApiPropertyOptional({ example: '3-355-0000' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Lun–Vie 08:30–12:30' })
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiPropertyOptional({ type: [String], example: ['Asesoría estudiantil'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicios?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 'CI-FICCT-INF' })
  @IsOptional()
  @IsString()
  unidadCodigo?: string;

  @ApiPropertyOptional({ example: 'M236' })
  @IsOptional()
  @IsString()
  edificioCodigo?: string;

  @ApiPropertyOptional({ example: 'CU' })
  @IsOptional()
  @IsString()
  sedeCodigo?: string;

  @ApiProperty({ example: -63.19555 })
  @IsLongitude()
  lon: number;

  @ApiProperty({ example: -17.7762 })
  @IsLatitude()
  lat: number;
}
