# Backend de MeepleWorld

API inicial construida con NestJS 12, TypeORM y MySQL. Las rutas de cuentas, perfiles, catálogo/biblioteca, mesas y anuncios están disponibles; el nuevo frontend Flutter permanece vacío y su integración está pendiente. Chat, Socket.IO, BGG, reputación, moderación y proveedores de correo/push reales siguen pendientes.

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

La API queda en `http://localhost:3000/api/v1`; el health check es `GET /api/v1/health`. El frontend Flutter aún no consume la API y no hay servidor web del frontend.

El usuario debe confirmar el correo antes de iniciar sesión. En desarrollo, abre el buzón local con `cat .local/mailbox.jsonl` y envía el token mediante `POST /api/v1/auth/verify-email`. Los mensajes de recuperación usan el mismo archivo. El archivo contiene tokens activos y está excluido de Git.

`MAIL_DRIVER=filesystem` es una simulación local: los mensajes con enlaces de verificación y recuperación se escriben en `backend/.local/mailbox.jsonl`, excluido de Git. No es un proveedor de correo ni debe habilitarse en producción. Al integrar Flutter, la URL de la API deberá ser alcanzable desde el dispositivo Android físico, mediante la red local o una redirección de puerto ADB configurada explícitamente para desarrollo. La configuración del cliente y los enlaces de verificación/recuperación para móviles siguen pendientes.

## Endpoints iniciales

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/verification/resend`, `/password/forgot`, `/password/reset`, `GET /me`
- `GET /api/v1/users/:id`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- `GET /api/v1/games`, `GET /api/v1/games/:id`, `POST /api/v1/games`
- `GET /api/v1/library`, `POST /api/v1/library`, `DELETE /api/v1/library/:gameId`
- `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/tables/:id/location`, `POST /api/v1/tables`, `PATCH /api/v1/tables/:id`, `POST /api/v1/tables/:id/cancel`
- `POST /api/v1/tables/:id/participations`, `GET /api/v1/tables/:id/participations`, `POST /api/v1/tables/:id/participations/:participationId/offer`, `/accept`, `/reject`, `DELETE /api/v1/tables/:id/participations/:participationId`
- `GET /api/v1/marketplace/listings`, `GET /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings`, `PATCH /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings/:id/close`

Las rutas de escritura requieren bearer access token y correo verificado. La renovación actual usa una cookie HttpOnly rotada; la adaptación del contrato y el almacenamiento seguro para el cliente Flutter están pendientes. Errores REST responden `{ code, message, requestId }`.

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
