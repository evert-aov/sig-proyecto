-- 040_usuarios_demo.sql
-- Usuario inicial del equipo Grupo 16 (Centros Internos) para pruebas JWT
-- Credenciales demo: admin@uagrm.edu.bo / AdminSIG2026!

INSERT INTO app_auth.usuario_app (correo, nombre, password_hash, rol, grupo_id, activo)
VALUES (
  'admin@uagrm.edu.bo',
  'Administrador Centros Internos (Grupo 16)',
  '$2b$10$YpoUNe0s0AH0aIZSD7lpFuyqS9NT01HSTtrQWQfbaBJK7Y1R8c076',
  'admin',
  16,
  true
)
ON CONFLICT (correo) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  activo = true;
