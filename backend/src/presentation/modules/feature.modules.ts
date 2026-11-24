import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  BUSQUEDA_REPOSITORY,
  CAPAS_REPOSITORY,
  CATALOGO_REPOSITORY,
  CENTROS_INTERNOS_REPOSITORY,
  ESPACIAL_REPOSITORY,
  FOTOS_REPOSITORY,
  RUTAS_REPOSITORY,
  USUARIOS_REPOSITORY,
} from '../../domain/repositories/repositories.interface';
import { FOTO_STORAGE_PORT } from '../../domain/ports/storage.port';
import { ObtenerCapaGeoJsonUseCase } from '../../application/use-cases/obtener-capa-geojson.use-case';
import {
  ActualizarCentroInternoUseCase,
  CrearCentroInternoUseCase,
  EliminarCentroInternoUseCase,
  ListarCentrosInternosUseCase,
  ObtenerCentroInternoUseCase,
} from '../../application/use-cases/centros-internos.use-cases';
import {
  ObtenerEdificiosUseCase,
  ObtenerFacultadesUseCase,
  ObtenerLeyendaUseCase,
  ObtenerSedesUseCase,
  ObtenerUnidadesCentroUseCase,
} from '../../application/use-cases/catalogo.use-cases';
import {
  BuscarInfraestructuraUseCase,
  CalcularRutaUseCase,
  ObtenerAmbientesEnSedeUseCase,
  ObtenerQaTopologicaUseCase,
  ObtenerResumenEspacialUseCase,
} from '../../application/use-cases/espacial-rutas-busqueda.use-cases';
import {
  AutenticarUsuarioUseCase,
  EliminarFotoUseCase,
  SubirFotoUseCase,
} from '../../application/use-cases/fotos-y-auth.use-cases';
import { loadEnvConfig } from '../../infrastructure/config/env.config';
import { JwtAuthGuard, JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { PgCapasRepository } from '../../infrastructure/persistence/typeorm/repositories/pg-capas.repository';
import { PgCentrosInternosRepository } from '../../infrastructure/persistence/typeorm/repositories/pg-centros-internos.repository';
import { PgCatalogoRepository } from '../../infrastructure/persistence/typeorm/repositories/pg-catalogo.repository';
import {
  PgBusquedaRepository,
  PgEspacialRepository,
  PgRutasRepository,
} from '../../infrastructure/persistence/typeorm/repositories/pg-espacial-rutas-busqueda.repository';
import {
  PgFotosRepository,
  PgUsuariosRepository,
} from '../../infrastructure/persistence/typeorm/repositories/pg-fotos-y-usuarios.repository';
import { LocalFotoStorage } from '../../infrastructure/storage/local-foto.storage';
import { CapasController } from '../controllers/capas.controller';
import { CentrosInternosController } from '../controllers/centros-internos.controller';
import { CatalogoController } from '../controllers/catalogo.controller';
import {
  BusquedaController,
  EspacialController,
  RutasController,
} from '../controllers/espacial-rutas-busqueda.controller';
import { AuthController, FotosController } from '../controllers/fotos-y-auth.controller';

@Module({
  controllers: [CapasController],
  providers: [
    ObtenerCapaGeoJsonUseCase,
    { provide: CAPAS_REPOSITORY, useClass: PgCapasRepository },
  ],
})
export class CapasModule {}

@Module({
  controllers: [CentrosInternosController],
  providers: [
    ListarCentrosInternosUseCase,
    ObtenerCentroInternoUseCase,
    CrearCentroInternoUseCase,
    ActualizarCentroInternoUseCase,
    EliminarCentroInternoUseCase,
    { provide: CENTROS_INTERNOS_REPOSITORY, useClass: PgCentrosInternosRepository },
  ],
})
export class CentrosInternosModule {}

@Module({
  controllers: [CatalogoController],
  providers: [
    ObtenerLeyendaUseCase,
    ObtenerFacultadesUseCase,
    ObtenerSedesUseCase,
    ObtenerEdificiosUseCase,
    ObtenerUnidadesCentroUseCase,
    { provide: CATALOGO_REPOSITORY, useClass: PgCatalogoRepository },
  ],
})
export class CatalogoModule {}

@Module({
  controllers: [BusquedaController, RutasController, EspacialController],
  providers: [
    BuscarInfraestructuraUseCase,
    CalcularRutaUseCase,
    ObtenerResumenEspacialUseCase,
    ObtenerQaTopologicaUseCase,
    ObtenerAmbientesEnSedeUseCase,
    { provide: BUSQUEDA_REPOSITORY, useClass: PgBusquedaRepository },
    { provide: RUTAS_REPOSITORY, useClass: PgRutasRepository },
    { provide: ESPACIAL_REPOSITORY, useClass: PgEspacialRepository },
  ],
})
export class EspacialModule {}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const env = loadEnvConfig();
        return {
          secret: env.jwtSecret,
          signOptions: { expiresIn: env.jwtExpiresIn as never },
        };
      },
    }),
  ],
  controllers: [FotosController, AuthController],
  providers: [
    SubirFotoUseCase,
    EliminarFotoUseCase,
    AutenticarUsuarioUseCase,
    JwtStrategy,
    JwtAuthGuard,
    { provide: FOTOS_REPOSITORY, useClass: PgFotosRepository },
    { provide: USUARIOS_REPOSITORY, useClass: PgUsuariosRepository },
    { provide: FOTO_STORAGE_PORT, useClass: LocalFotoStorage },
  ],
  exports: [JwtAuthGuard, PassportModule],
})
export class FotosYAuthModule {}
