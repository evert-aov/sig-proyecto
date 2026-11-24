export interface AppEnvConfig {
  port: number;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  uploadDir: string;
  corsOrigins: string[];
}

export const loadEnvConfig = (): AppEnvConfig => ({
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? '127.0.0.1',
  dbPort: Number(process.env.DB_PORT ?? 5433),
  dbUser: process.env.DB_USER ?? 'sig_admin',
  dbPassword: process.env.DB_PASSWORD ?? 'sig_uagrm_2026',
  dbName: process.env.DB_NAME ?? 'sig_uagrm',
  jwtSecret: process.env.JWT_SECRET ?? 'sig_uagrm_centros_internos_2026_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  uploadDir: process.env.UPLOAD_DIR ?? '../uploads/fotos',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:4200,https://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
});
