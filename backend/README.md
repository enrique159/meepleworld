# Backend de MeepleWorld

API inicial construida con NestJS 12, TypeORM y MySQL. El frontend consume las rutas disponibles de cuentas, perfiles, catálogo/biblioteca, mesas y anuncios. Chat, Socket.IO, BGG, reputación, moderación y proveedores de correo/push reales siguen pendientes.

## Preparar MySQL

Crea una base de datos y un usuario local:

```sql
CREATE DATABASE meepleworld_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'meepleworld'@'127.0.0.1' IDENTIFIED BY 'cambia-esta-clave-local';
GRANT ALL PRIVILEGES ON meepleworld_dev.* TO 'meepleworld'@'127.0.0.1';
```

## Instalar y arrancar

Desde `backend/`:

```sh
npm install
cp .env.example .env
```

Edita `.env`: cambia la contraseña de MySQL y genera `JWT_ACCESS_SECRET` con al menos 32 caracteres aleatorios. En otra terminal:

```sh
npm run migration:run
npm run start:dev
```

La API queda en `http://localhost:3000/api/v1`; el health check es `GET /api/v1/health`. La interfaz web corre en `http://localhost:8080` y Vite redirige `/api/v1` al backend.

El usuario debe confirmar el correo antes de iniciar sesión. En desarrollo, abre el buzón local con `cat .local/mailbox.jsonl` y envía el token mediante `POST /api/v1/auth/verify-email`. Los mensajes de recuperación usan el mismo archivo. El archivo contiene tokens activos y está excluido de Git.

`MAIL_DRIVER=filesystem` es una simulación local: los mensajes con enlaces de verificación y recuperación se escriben en `backend/.local/mailbox.jsonl`, excluido de Git. No es un proveedor de correo ni debe habilitarse en producción. Para Android o un dispositivo físico configura `VITE_API_BASE_URL` con una URL alcanzable desde el dispositivo y agrega ese origen a `CORS_ORIGINS`.

## Endpoints iniciales

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/verification/resend`, `/password/forgot`, `/password/reset`, `GET /me`
- `GET /api/v1/users/:id`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- `GET /api/v1/games`, `GET /api/v1/games/:id`, `POST /api/v1/games`
- `GET /api/v1/library`, `POST /api/v1/library`, `DELETE /api/v1/library/:gameId`
- `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/tables/:id/location`, `POST /api/v1/tables`, `PATCH /api/v1/tables/:id`, `POST /api/v1/tables/:id/cancel`
- `POST /api/v1/tables/:id/participations`, `GET /api/v1/tables/:id/participations`, `POST /api/v1/tables/:id/participations/:participationId/offer`, `/accept`, `/reject`, `DELETE /api/v1/tables/:id/participations/:participationId`
- `GET /api/v1/marketplace/listings`, `GET /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings`, `PATCH /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings/:id/close`

Las rutas de escritura requieren bearer access token y correo verificado. La renovación usa cookie HttpOnly rotada, integrada en la sesión web del frontend; el cliente nativo todavía debe validarse con almacenamiento seguro. Errores REST responden `{ code, message, requestId }`.

El contrato OpenAPI está en [openapi.yaml](openapi.yaml).

## Migraciones y comprobaciones

```sh
npm run migration:show
npm run migration:run
npm run migration:revert
npm run typecheck
npm run build
```

El esquema se administra solo mediante migraciones; TypeORM mantiene `synchronize: false`.
