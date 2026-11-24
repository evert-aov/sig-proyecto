import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'public', name: 'grupo' })
export class GrupoEntity {
  @PrimaryColumn({ type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  tema: string;

  @Column({ type: 'text', nullable: true })
  contacto: string | null;
}

@Entity({ schema: 'public', name: 'sede' })
export class SedeEntity {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text' })
  municipio: string;

  @Column({ type: 'text', nullable: true })
  direccion: string | null;

  @Column({ name: 'area_m2', type: 'numeric', precision: 12, scale: 1, nullable: true })
  areaM2: string | null;

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;
}

@Entity({ schema: 'public', name: 'unidad' })
export class UnidadEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  sigla: string | null;

  @Column({ type: 'text', array: true })
  alias: string[];

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  responsable: string | null;

  @Column({ name: 'cargo_responsable', type: 'text', nullable: true })
  cargoResponsable: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'text', array: true })
  servicios: string[];

  @Column({ type: 'text', nullable: true })
  correo: string | null;

  @Column({ type: 'text', nullable: true })
  web: string | null;

  @Column({ name: 'padre_id', type: 'integer', nullable: true })
  padreId: number | null;

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;
}

@Entity({ schema: 'public', name: 'tipo_ambiente' })
export class TipoAmbienteEntity {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  categoria: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'text' })
  icono: string;

  @Column({ type: 'smallint' })
  orden: number;
}

@Entity({ schema: 'public', name: 'tipo_punto' })
export class TipoPuntoEntity {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  categoria: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'text' })
  icono: string;

  @Column({ type: 'smallint' })
  orden: number;
}

@Entity({ schema: 'public', name: 'tipo_area' })
export class TipoAreaEntity {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  categoria: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'text' })
  icono: string;

  @Column({ type: 'smallint' })
  orden: number;
}

@Entity({ schema: 'public', name: 'tipo_via' })
export class TipoViaEntity {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  categoria: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'text' })
  icono: string;

  @Column({ type: 'smallint' })
  orden: number;
}

@Entity({ schema: 'public', name: 'edificio' })
export class EdificioEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', array: true })
  alias: string[];

  @Column({ type: 'text' })
  uso: string;

  @Column({ type: 'smallint' })
  pisos: number;

  @Column({ type: 'boolean' })
  ascensor: boolean;

  @Column({ name: 'area_m2', type: 'numeric', precision: 12, scale: 1, nullable: true })
  areaM2: string | null;

  @Column({ name: 'sede_id', type: 'smallint' })
  sedeId: number;

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;
}

@Entity({ schema: 'public', name: 'ambiente' })
export class AmbienteEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', array: true })
  alias: string[];

  @Column({ type: 'smallint' })
  piso: number;

  @Column({ type: 'text', nullable: true })
  referencia: string | null;

  @Column({ type: 'text', nullable: true })
  encargado: string | null;

  @Column({ type: 'text', nullable: true })
  telefono: string | null;

  @Column({ type: 'text', nullable: true })
  horario: string | null;

  @Column({ type: 'text', array: true })
  servicios: string[];

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'tipo_ambiente_id', type: 'smallint' })
  tipoAmbienteId: number;

  @Column({ name: 'unidad_id', type: 'integer', nullable: true })
  unidadId: number | null;

  @Column({ name: 'edificio_id', type: 'integer', nullable: true })
  edificioId: number | null;

  @Column({ name: 'sede_id', type: 'smallint', nullable: true })
  sedeId: number | null;

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;
}

@Entity({ schema: 'public', name: 'punto_interes' })
export class PuntoInteresEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  nombre: string | null;
}

@Entity({ schema: 'public', name: 'area' })
export class AreaEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  nombre: string | null;
}

@Entity({ schema: 'public', name: 'via' })
export class ViaEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  nombre: string | null;
}

@Entity({ schema: 'public', name: 'foto' })
export class FotoEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  ruta: string;

  @Column({ type: 'text' })
  tipo: 'fachada' | 'puerta' | 'interior' | 'referencia';

  @Column({ type: 'boolean' })
  principal: boolean;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'tomada_en', type: 'date', nullable: true })
  tomadaEn: string | null;

  @Column({ name: 'ambiente_id', type: 'integer', nullable: true })
  ambienteId: number | null;

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;
}

@Entity({ schema: 'app_auth', name: 'usuario_app' })
export class UsuarioAppEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  correo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ type: 'text' })
  rol: 'admin' | 'editor';

  @Column({ name: 'grupo_id', type: 'smallint' })
  grupoId: number;

  @Column({ type: 'boolean' })
  activo: boolean;
}
