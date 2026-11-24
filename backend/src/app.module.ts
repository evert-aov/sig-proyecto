import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './infrastructure/config/typeorm.config';
import {
  CapasModule,
  CatalogoModule,
  CentrosInternosModule,
  EspacialModule,
  FotosYAuthModule,
} from './presentation/modules/feature.modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(),
    }),
    CapasModule,
    CentrosInternosModule,
    CatalogoModule,
    EspacialModule,
    FotosYAuthModule,
  ],
})
export class AppModule {}
