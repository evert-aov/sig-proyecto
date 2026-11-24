import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CalcularRutaDto {
  @ApiProperty({ example: -63.1966 })
  @Type(() => Number)
  @IsLongitude()
  oLon: number;

  @ApiProperty({ example: -17.7762 })
  @Type(() => Number)
  @IsLatitude()
  oLat: number;

  @ApiProperty({ example: -63.1952 })
  @Type(() => Number)
  @IsLongitude()
  dLon: number;

  @ApiProperty({ example: -17.7762 })
  @Type(() => Number)
  @IsLatitude()
  dLat: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloAccesible?: boolean;

  @ApiPropertyOptional({ default: 40, minimum: 5, maximum: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(250)
  radioM?: number;
}
