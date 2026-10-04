# Backend de MeepleWorld

API inicial construida con NestJS 12, TypeORM y MySQL. Las rutas de cuentas, perfiles, catálogo/biblioteca, mesas y anuncios están disponibles; el frontend Flutter tiene un layout principal con enrutamiento inicial y su integración está pendiente. Chat, Socket.IO, BGG, reputación, moderación y proveedores de correo/push reales siguen pendientes.

La [regla de acceso del producto](../documentation/idea_design.md) exige cuenta activa, correo verificado y sesión válida para toda la plataforma, incluidas las lecturas. Aplicarla a todas las consultas del backend inicial está pendiente; el estado actual se detalla abajo.

También está acordado que el registro verifique automáticamente el correo cuando el backend esté fuera de producción (`NODE_ENV=development` o `NODE_ENV=test`). En producción seguirá exigiéndose confirmación por correo. Esta adaptación todavía está pendiente de implementación.

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

El registro actual aún exige confirmar el correo antes de iniciar sesión en todos los entornos admitidos. Mientras se implementa la regla por entorno, en desarrollo abre el buzón local con `cat .local/mailbox.jsonl` y envía el token mediante `POST /api/v1/auth/verify-email`. Los mensajes de recuperación usan el mismo archivo. El archivo contiene tokens activos y está excluido de Git.

Con el cambio previsto, las cuentas nuevas de desarrollo y pruebas se crearán con `emailVerifiedAt` asignado y el registro responderá `emailVerified: true`, `verificationEmailQueued: false`, sin generar token ni correo de verificación. Después del registro se podrá iniciar sesión directamente; la recuperación seguirá utilizando correo. En producción se mantendrán el token y la confirmación previa al inicio de sesión. La configuración actual rechaza producción hasta disponer de un proveedor de correo real.

`MAIL_DRIVER=filesystem` es una simulación local: los mensajes de recuperación y, mientras el registro no se adapte, los de verificación se escriben en `backend/.local/mailbox.jsonl`, excluido de Git. No es un proveedor de correo ni debe habilitarse en producción. Al integrar Flutter, la URL de la API deberá ser alcanzable desde el dispositivo Android físico, mediante la red local o una redirección de puerto ADB configurada explícitamente para desarrollo. La configuración del cliente y los enlaces de verificación/recuperación para móviles siguen pendientes.

## Endpoints iniciales

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/verification/resend`, `/password/forgot`, `/password/reset`, `GET /me`
- `GET /api/v1/users/:id`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- `GET /api/v1/games`, `GET /api/v1/games/:id`, `POST /api/v1/games`
- `GET /api/v1/library`, `POST /api/v1/library`, `DELETE /api/v1/library/:gameId`
- `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/tables/:id/location`, `POST /api/v1/tables`, `PATCH /api/v1/tables/:id`, `POST /api/v1/tables/:id/cancel`
- `POST /api/v1/tables/:id/participations`, `GET /api/v1/tables/:id/participations`, `POST /api/v1/tables/:id/participations/:participationId/offer`, `/accept`, `/reject`, `DELETE /api/v1/tables/:id/participations/:participationId`
- `GET /api/v1/marketplace/listings`, `GET /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings`, `PATCH /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings/:id/close`

Actualmente, las escrituras de catálogo, biblioteca, mesas y anuncios requieren bearer access token y correo verificado; perfil propio, biblioteca y participaciones tienen lecturas autenticadas. Todavía admiten acceso anónimo `GET /api/v1/users/:id`, `GET /api/v1/games`, `GET /api/v1/games/:id`, `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/marketplace/listings` y `GET /api/v1/marketplace/listings/:id`.

El cambio pendiente deberá proteger todos los endpoints de producto por defecto y devolver `401` ante una consulta sin autenticación válida. Las únicas excepciones al bearer serán los flujos de registro, inicio de sesión, verificación/reenvío y recuperación, la renovación con credencial válida y el health check sin contenido de producto. `GET /api/v1/auth/me` y `POST /api/v1/auth/logout` seguirán autenticados. Los permisos particulares de autor, anfitrión o asistente confirmado se comprobarán además de la sesión. Las [reglas del backend](../.github/backend/rules.md) detallan las excepciones y verificaciones previstas.

La renovación actual usa una cookie HttpOnly rotada; la adaptación del contrato y el almacenamiento seguro para el cliente Flutter están pendientes. Errores REST responden `{ code, message, requestId }`.

El contrato OpenAPI está en [openapi.yaml](openapi.yaml) y refleja el comportamiento implementado. Sus requisitos de seguridad deberán actualizarse al proteger las consultas anónimas y la respuesta de registro deberá distinguir la verificación automática fuera de producción.

## Migraciones y comprobaciones

```sh
npm run migration:show
npm run migration:run
npm run migration:revert
npm run typecheck
npm run build
```

El esquema se administra solo mediante migraciones; TypeORM mantiene `synchronize: false`.
