import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, SubirFotoDto } from '../../application/dto/comunes.dto';
import {
  AutenticarUsuarioUseCase,
  EliminarFotoUseCase,
  SubirFotoUseCase,
} from '../../application/use-cases/fotos-y-auth.use-cases';
import { JwtAuthGuard, JwtPayload } from '../../infrastructure/auth/jwt.strategy';

interface MulterMemoryFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@ApiTags('Fotos')
@Controller('fotos')
export class FotosController {
  constructor(
    private readonly subirFotoUseCase: SubirFotoUseCase,
    private readonly eliminarFotoUseCase: EliminarFotoUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ambienteCodigo: { type: 'string' },
        tipo: { type: 'string', enum: ['fachada', 'puerta', 'interior', 'referencia'] },
        principal: { type: 'boolean' },
        descripcion: { type: 'string' },
        archivo: { type: 'string', format: 'binary' },
      },
      required: ['ambienteCodigo', 'tipo', 'archivo'],
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Subir foto de un Centro Interno bajo ruta CINT/<CODIGO>/<archivo> (requiere JWT)' })
  subir(@Body() dto: SubirFotoDto, @UploadedFile() file: MulterMemoryFile | undefined) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar el archivo de imagen en el campo "archivo".');
    }
    return this.subirFotoUseCase.ejecutar(dto, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una foto por ID (requiere JWT)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarFotoUseCase.ejecutar(id);
  }
}

@ApiTags('Autenticación JWT')
@Controller('auth')
export class AuthController {
  constructor(private readonly autenticarUseCase: AutenticarUsuarioUseCase) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT para operaciones de escritura' })
  login(@Body() dto: LoginDto) {
    return this.autenticarUseCase.ejecutar(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  perfil(@Req() req: { user: JwtPayload }) {
    return req.user;
  }
}
