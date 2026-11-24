import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BuscarDto {
  @ApiProperty({ example: 'sistemas' })
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class SubirFotoDto {
  @ApiProperty({ example: 'M236-CI-INF' })
  @IsString()
  @IsNotEmpty()
  ambienteCodigo: string;

  @ApiProperty({ enum: ['fachada', 'puerta', 'interior', 'referencia'] })
  @IsIn(['fachada', 'puerta', 'interior', 'referencia'])
  tipo: 'fachada' | 'puerta' | 'interior' | 'referencia';

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  principal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@uagrm.edu.bo' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'AdminSIG2026!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
