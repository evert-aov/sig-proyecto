import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { loadEnvConfig } from './env.config';
import {
  AmbienteEntity,
  AreaEntity,
  EdificioEntity,
  FotoEntity,
  GrupoEntity,
  PuntoInteresEntity,
  SedeEntity,
  TipoAmbienteEntity,
  TipoAreaEntity,
  TipoPuntoEntity,
  TipoViaEntity,
  UnidadEntity,
  UsuarioAppEntity,
  ViaEntity,
} from '../persistence/typeorm/entities/sig.entities';

export const buildTypeOrmOptions = (): TypeOrmModuleOptions => {
  const env = loadEnvConfig();
  return {
    type: 'postgres',
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    synchronize: false,
    logging: false,
    entities: [
      GrupoEntity,
      SedeEntity,
      UnidadEntity,
      TipoAmbienteEntity,
      TipoPuntoEntity,
      TipoAreaEntity,
      TipoViaEntity,
      EdificioEntity,
      AmbienteEntity,
      PuntoInteresEntity,
      AreaEntity,
      ViaEntity,
      FotoEntity,
      UsuarioAppEntity,
    ],
  };
};
