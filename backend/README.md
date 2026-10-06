# Backend de MeepleWorld

API inicial construida con NestJS 12, TypeORM y MySQL. Las rutas de cuentas, perfiles, catálogo/biblioteca, mesas y anuncios están disponibles; Flutter integra registro, login, renovación y cierre de sesión. Chat, Socket.IO, BGG, reputación, moderación y proveedores de correo/push reales siguen pendientes.

La [regla de acceso del producto](../documentation/idea_design.md) exige cuenta activa, correo verificado y sesión válida para toda la plataforma, incluidas las lecturas. Aplicarla a todas las consultas del backend inicial está pendiente; el estado actual se detalla abajo.

El registro verifica automáticamente el correo en `development` y `test`, sin token ni envío de verificación. En producción exige confirmación por correo; ese entorno sigue bloqueado hasta contar con un proveedor real.

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

La API queda en `http://localhost:3000/api/v1`; el health check es `GET /api/v1/health`. Flutter consume los endpoints de autenticación. Configura una URL alcanzable desde el dispositivo mediante `API_BASE_URL`, según la [guía del frontend](../frontend/README.md#autenticación-y-api). No hay servidor web ni configuración CORS.

Después de crear una cuenta en desarrollo o pruebas, se puede iniciar sesión directamente. El registro no inicia sesión por sí solo. Las cuentas anteriores sin verificar conservan su estado: el cambio no modifica datos existentes.

`MAIL_DRIVER=filesystem` es una simulación local: los mensajes de recuperación y los reenvíos de verificación que correspondan se escriben en `backend/.local/mailbox.jsonl`, excluido de Git. No es un proveedor real ni está habilitado en producción. Los enlaces de verificación y recuperación móviles y sus pantallas siguen pendientes.

## Endpoints iniciales

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/verification/resend`, `/password/forgot`, `/password/reset`, `GET /me`
- `GET /api/v1/users/:id`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- `GET /api/v1/users/username/:username` (sesión de una cuenta activa y con correo verificado; consulta exacta)
- `GET /api/v1/games`, `GET /api/v1/games/:id`, `POST /api/v1/games`
- `GET /api/v1/library`, `POST /api/v1/library`, `DELETE /api/v1/library/:gameId`
- `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/tables/:id/location`, `POST /api/v1/tables`, `PATCH /api/v1/tables/:id`, `POST /api/v1/tables/:id/cancel`
- `POST /api/v1/tables/:id/participations`, `GET /api/v1/tables/:id/participations`, `POST /api/v1/tables/:id/participations/:participationId/offer`, `/accept`, `/reject`, `DELETE /api/v1/tables/:id/participations/:participationId`
- `GET /api/v1/marketplace/listings`, `GET /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings`, `PATCH /api/v1/marketplace/listings/:id`, `POST /api/v1/marketplace/listings/:id/close`

Actualmente, las escrituras de catálogo, biblioteca, mesas y anuncios requieren bearer access token y correo verificado; perfil propio, biblioteca y participaciones tienen lecturas autenticadas. Todavía admiten acceso anónimo `GET /api/v1/users/:id`, `GET /api/v1/games`, `GET /api/v1/games/:id`, `GET /api/v1/tables`, `GET /api/v1/tables/:id`, `GET /api/v1/marketplace/listings` y `GET /api/v1/marketplace/listings/:id`.

El cambio pendiente deberá proteger todos los endpoints de producto por defecto y devolver `401` ante una consulta sin autenticación válida. Las únicas excepciones al bearer serán los flujos de registro, inicio de sesión, verificación/reenvío y recuperación, la renovación con credencial válida y el health check sin contenido de producto. `GET /api/v1/auth/me` y `POST /api/v1/auth/logout` seguirán autenticados. Los permisos particulares de autor, anfitrión o asistente confirmado se comprobarán además de la sesión. Las [reglas del backend](../.github/backend/rules.md) detallan las excepciones y verificaciones previstas.

Login y renovación devuelven `{ accessToken, refreshToken, expiresIn, refreshExpiresIn, user }` en JSON con `Cache-Control: no-store`; las duraciones están en segundos. `POST /auth/refresh` exige `{ refreshToken }` en JSON, sin bearer vigente. La renovación es opaca, rotativa y revocable; se conserva solo su hash en MySQL. El cliente mantiene el acceso en memoria y la renovación en almacenamiento seguro. No se emiten ni se aceptan cookies de sesión. `POST /auth/logout` sigue requiriendo bearer válido y revoca esa sesión; si el acceso venció, renovar antes de cerrarla. CORS está desactivado y `CORS_ORIGINS`, `AUTH_COOKIE_SECURE` y `AUTH_COOKIE_SAME_SITE` dejaron de usarse. HTTPS es obligatorio para las credenciales fuera del desarrollo local. Errores REST responden `{ code, message, requestId }`.

El contrato OpenAPI está en [openapi.yaml](openapi.yaml) y refleja los tokens móviles y el registro por entorno. Sus requisitos de seguridad deberán actualizarse al proteger las consultas anónimas pendientes.

## Migraciones y comprobaciones

```sh
npm run migration:show
npm run migration:run
npm run migration:revert
npm run typecheck
npm run build
npm test
```

El esquema se administra solo mediante migraciones; TypeORM mantiene `synchronize: false`.

### Username

La migración `AddUserUsername1791072000000` crea `users.username` con índice único, asigna uno a cada cuenta anterior sin alterar su UUID ni fecha de edición y vuelve la columna obligatoria. Detén el backend y ejecuta `npm run migration:run` antes de iniciar esta versión. Revertir esa migración elimina los usernames; requiere volver a un backend compatible con el esquema anterior.

El registro genera `user` + timestamp Unix en milisegundos + cinco dígitos aleatorios, por ejemplo `user179107200000012345`. MySQL garantiza la unicidad y el registro reintenta las colisiones. No se permite elegirlo en `POST /auth/register`. El username aparece en la respuesta de registro, login, renovación, sesión actual y perfiles.

Para personalizarlo, envía `PATCH /api/v1/users/me` con `{ "username": "Enrique_plays" }`. Se recortan espacios exteriores y se guarda `enrique_plays`: entre 3 y 32 letras ASCII, números y guion bajo. No admite `null`, espacios interiores ni otros signos. Si está ocupado, devuelve `409` con `code: "USERNAME_TAKEN"` y no modifica ningún campo del perfil. El UUID interno permanece igual; el nombre anterior deja de resolver el perfil y queda disponible.

`GET /api/v1/users/username/enrique_plays` permite encontrar el perfil compartido por su identificador exacto, con sesión y correo verificado. Solo entrega cuentas activas y verificadas, sin correo ni credenciales; la consulta normaliza mayúsculas y devuelve `404` si el perfil no está disponible. El frontend para editar, buscar y compartir sigue pendiente, así como la búsqueda parcial y las amistades.

### Pruebas de username

`npm test` compila y ejecuta las suites de autenticación y username con el runner de Node.js y datos ficticios. La suite de autenticación cubre registro por entorno, hashing y login, renovación y reutilización, cierre, expiración, suspensión, validación y transporte HTTP mediante un servidor temporal con repositorios controlados. No toca la base de desarrollo. La integración MySQL se omite por defecto. Para ejecutarla, inicia una instancia local temporal y aislada con socket Unix, usuario `root` sin contraseña y sin datos del proyecto, e indica su socket:

```sh
MEEPLEWORLD_TEST_MYSQL_SOCKET=/ruta/temporal/mysql.sock npm test
```

La prueba no carga `.env`: crea una base aleatoria `meepleworld_username_test_*`, ejecuta migraciones, usa datos ficticios y elimina su propia base al terminar. Comprueba el relleno/reanudación/reversión de la migración, unicidad concurrente, normalización, errores HTTP, privacidad y propagación a las sesiones. La instancia temporal debe ser compatible con MySQL 8.4 LTS; en esta entrega se verificó con el binario local disponible, MySQL 8.0.38. ESLint y las suites generales con Vitest/Supertest siguen pendientes.
