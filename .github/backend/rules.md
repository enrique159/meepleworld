# MeepleWorld: reglas del backend

Estado: API REST inicial con autenticación móvil mediante tokens JSON y registro por entorno implementados; acceso obligatorio en todas las lecturas e integraciones indicadas pendientes. Última actualización documental: 6 de octubre de 2026.

Estas reglas se aplican a `backend/` y a sus contratos, datos e integraciones. Leer también [AGENTS.md](../../AGENTS.md), la [definición del producto](../../documentation/idea_design.md) y el [README del backend](../../backend/README.md). Para cambios que afecten al cliente móvil, consultar las [reglas del frontend](../frontend/rules.md). Inspeccionar el estado real antes de implementar: las capacidades previstas no implican que ya existan.

## Decisiones y alcance

| Área | Base acordada |
| --- | --- |
| Proyecto | NestJS independiente con `package.json` y `package-lock.json`; ejecutar npm desde `backend/`. Sin npm workspaces ni `package.json` raíz. |
| Lenguaje y runtime | TypeScript con comprobaciones estrictas; el repositorio no fija versiones de Node.js ni npm. |
| Framework | NestJS 12 con ESM y adaptador HTTP Express. |
| Persistencia | MySQL 8.4 LTS local, TypeORM, `@nestjs/typeorm` y controlador `mysql2`; sin Docker ni Docker Compose. |
| Contratos | API REST bajo `/api/v1`, documentada con OpenAPI; Socket.IO para chat está pendiente. |
| Acceso | Cuenta activa, correo verificado y sesión válida para toda la plataforma, incluidas las lecturas; excepciones explícitas para flujos de acceso y health check. Adaptación del backend inicial pendiente. |
| Verificación de correo | Confirmación por correo en producción; verificación automática de cuentas nuevas en `development` y `test`. Implementado para cuentas nuevas; proveedor real de producción pendiente. |
| Pruebas | Suites focalizadas de autenticación y `username` con el runner de Node.js y MySQL temporal opcional. Vitest/Supertest para el resto y la configuración de lint siguen pendientes. |

MySQL 8.4 LTS sustituye la propuesta inicial de 8.3 por decisión del proyecto. NestJS 12 publica sus paquetes en ESM y su configuración de proyectos ESM utiliza Vitest; consultar la [guía de NestJS 12](https://docs.nestjs.com/migration-guide). Usar `type: module` y resolución `NodeNext`; respetar las extensiones de importación de su salida ESM. No introducir otro gestor de paquetes, ORM o framework sin actualizar la decisión y la documentación.

El lanzamiento inicial es en México, en español y con importes en MXN. Los pagos y las entregas se acuerdan entre usuarios; no procesar pagos ni cuotas. Mantener la autorización y las reglas de negocio en servicios del backend, incluyendo HTTP, Socket.IO, tareas de fondo y moderación. No exponer entidades ni secretos al frontend.

## Organización

```text
backend/
├── package.json
├── package-lock.json
├── src/
│   ├── auth/                # registro, verificación, sesiones y acceso
│   ├── users/               # perfiles
│   ├── games/               # catálogo y biblioteca
│   ├── tables/              # mesas y participaciones
│   ├── marketplace/         # anuncios
│   └── database/            # entidades, DataSource y migraciones
└── .env.example
```

Los contratos de la API deben ser independientes del ORM y del código del servidor; no crear un tercer proyecto para compartir entidades del backend. Mantener [openapi.yaml](../../backend/openapi.yaml) actualizado al cambiar comportamiento o contratos.

## Backend y contratos

La API inicial usa `/api/v1`, DTOs con validación estricta y proyecciones de respuesta independientes de las entidades. Incluye autenticación con Argon2id/JWT y sesiones renovables, perfiles públicos/privados, catálogo y biblioteca, mesas con cupos y ubicación protegida, y anuncios del marketplace. El correo local es un adaptador simulado en un archivo excluido de Git; un proveedor real, Socket.IO/chat, BGG, reportes, reputación, notificaciones y cargas de imágenes aún están pendientes.

La obligación de autenticar todas las lecturas es una regla acordada pendiente de implementación. Actualmente aceptan consultas anónimas `GET /users/:id`, `GET /games`, `GET /games/:id`, `GET /tables`, `GET /tables/:id`, `GET /marketplace/listings` y `GET /marketplace/listings/:id`, bajo `/api/v1`. El OpenAPI actual refleja ese comportamiento; al proteger las rutas, actualizar también sus requisitos de seguridad y respuestas de error. En el producto previsto, «público» describe contenido compartido con usuarios autenticados, no endpoints anónimos.

Construir un monolito modular. Los módulos previstos son autenticación, usuarios, catálogo, bibliotecas, mesas y participaciones, marketplace y operaciones declaradas, conversaciones, notificaciones, reputación, moderación e integraciones. Cada módulo tendrá controladores para transporte, servicios para reglas y repositorios TypeORM para persistencia.

### API REST

- Prefijo `/api/v1`; contratos de solicitud, respuesta y error independientes de entidades TypeORM, documentados mediante `@nestjs/swagger`.
- Exigir autenticación, cuenta activa y correo verificado por defecto en todos los endpoints de producto, incluidos `GET`, mediante una protección central del backend. Declarar las excepciones de acceso explícitamente; no confiar únicamente en restricciones de navegación del cliente.
- DTOs tipados con validación en ejecución. Rechazar cantidades no enteras, valores fuera del dominio, propiedades no permitidas y estados incompatibles.
- Separar respuestas compartidas con la comunidad autenticada de datos privados y de administración. Nunca serializar directamente entidades que contengan credenciales, direcciones privadas o tokens.
- Paginar listados, mensajes e historial; limitar el tamaño de página y admitir filtros documentados. En chat ordenar de forma estable para recuperar mensajes después de una desconexión.
- Autorizar por cuenta activa, correo verificado, propiedad y relación con el recurso. El rol administrador no sustituye la verificación de una intervención autorizada.
- Responder con códigos HTTP coherentes: `401` sin autenticación válida, `403` sin permiso, `404` recurso no disponible, `409` conflicto de cupo o estado y `400` entrada inválida. Incluir un código de error estable, un mensaje comprensible y un identificador de petición; no exponer trazas o consultas SQL.

Las únicas excepciones previstas al bearer access token son estas rutas bajo `/api/v1`; ninguna permite consultar contenido de producto:

| Rutas | Condición de acceso |
| --- | --- |
| `POST /auth/register`, `POST /auth/login` | Sin sesión previa; validar registro o credenciales y limitar intentos. El inicio de sesión exige cuenta activa y correo verificado. |
| `POST /auth/verify-email`, `POST /auth/verification/resend`, `POST /auth/password/forgot`, `POST /auth/password/reset` | Sin sesión previa; exigir el token de un solo uso cuando corresponda y limitar intentos y envíos. |
| `POST /auth/refresh` | Sin access token vigente, pero con credencial de renovación válida y sesión no revocada; comprobar cuenta activa y correo verificado. |
| `GET /health` | Comprobación operativa sin contenido de usuarios, mesas o anuncios. |

`GET /auth/me` y `POST /auth/logout` siguen requiriendo autenticación. Al adaptar OpenAPI, declarar bearer como requisito predeterminado y sobrescribirlo explícitamente solo en estas excepciones, documentando la credencial propia de renovación. Responder `401` ante credenciales ausentes, inválidas, expiradas o revocadas y `403` ante una cuenta no activa, correo sin verificar o falta de permiso sobre un recurso.

El contrato deberá representar por separado lugares solicitados, lugares ofrecidos parcialmente y lugares confirmados. El número siempre incluirá al titular. Para mesas, distinguir modalidad abierta o con aprobación y ubicación pública o exclusiva de confirmados. Estas son capacidades del contrato previsto, no endpoints implementados.

### Socket.IO

Autenticar conexiones con sesión válida, cuenta activa y correo verificado, y autorizar por conversación cada unión a sala, lectura y envío. No confiar en identificadores de usuario o salas enviados por el cliente como prueba de permiso. Revalidar sesión, cuenta y pertenencia al enviar; una conexión previa no conserva permisos revocados. Desconectar al cerrar o revocar la sesión e impedir nuevas entregas cuando la autenticación deje de ser válida.

Persistir el mensaje antes de confirmar su recepción. Asociar un identificador de envío del cliente para deduplicar reintentos y devolver el resultado previo cuando corresponda. Los eventos complementarán el historial REST. Evitar que reconectar duplique listeners, conversaciones o mensajes.

Las salas de mesa contendrán al anfitrión y titulares confirmados. Al cancelar o retirar participación, expulsar sus conexiones y negar historial y nuevos mensajes. Finalizar o cancelar una mesa dejará el chat en solo lectura para miembros que conserven permiso; una cancelación general revocará los permisos de los asistentes conforme a las participaciones canceladas. Para chats privados de anuncios, comprobar interlocutores y bloqueos en el servidor.

## Modelo conceptual de datos

La migración inicial de `backend/` crea usuarios, sesiones y tokens de un solo uso, juegos, biblioteca, mesas, relaciones con juegos, participaciones y anuncios. El resto del modelo siguiente sigue siendo una base prevista; no implica que ya existan todas esas entidades o recorridos.

| Entidad o conjunto | Relaciones y responsabilidad |
| --- | --- |
| Usuario y perfil | Correo único normalizado, `username` único normalizado, hash de contraseña, verificación, estado, nombre visible, avatar y ciudad. Permisos administrativos separados de la propiedad de una mesa. |
| Sesión y tokens de cuenta | Varias sesiones por usuario, renovación revocable y tokens de verificación o recuperación de un solo uso. Guardar hashes de tokens sensibles. |
| Juego | Registro local con nombre, metadatos e identificador BGG opcional y único cuando exista. |
| Entrada de biblioteca | Relación usuario-juego única, procedencia manual o BGG y datos de importación sin credenciales BGG del usuario. |
| Mesa y juegos de mesa | Anfitrión, horario, zona horaria, grupo inicial, cupo ofrecido, modalidad, cuota, amenidades, estado y juegos asociados. |
| Ubicación de mesa | Dirección y coordenadas exactas, ubicación aproximada para la comunidad autenticada, ciudad y política de visibilidad. |
| Participación | Mesa y titular, estado, lugares solicitados, propuesta parcial y lugares confirmados. El historial registra cancelaciones y revisiones. |
| Anuncio | Autor, tipo venta o búsqueda, juego, condición, precio o presupuesto, ciudad, imágenes y estado. |
| Operación declarada | Anuncio, conversación, comprador, vendedor y confirmación de cada parte. Habilita reputación tras confirmación bilateral. |
| Conversación, miembros y mensajes | Relación con una mesa o anuncio, participantes autorizados, historial persistente e identificadores de deduplicación. |
| Notificación y dispositivo | Aviso interno persistente por usuario, lectura, destino y registros push revocables por dispositivo. |
| Calificación | Autor, destinatario, contexto mesa u operación, puntuación de 1 a 5 y comentario. Unicidad por autor, destinatario y experiencia. |
| Bloqueo, reporte y acción administrativa | Relación entre usuarios, referencia al contenido reportado, estado de revisión y registro de intervención. |
| Importación BGG | Usuario solicitante, nombre BGG, estado, resumen, momento de actualización y error controlado. |

Usar InnoDB y `utf8mb4`. Mantener índices para relaciones, estados y filtros por ciudad, fecha y juego. Las asociaciones no deben depender del nombre de un juego como identificador. Evitar borrados en cascada que destruyan evidencia de participaciones, calificaciones u operaciones.

Mantener `synchronize: false` en todos los entornos y modificar el esquema exclusivamente con migraciones TypeORM versionadas. Separar credenciales y base de pruebas de la base de desarrollo. Las semillas serán explícitas, reproducibles y con datos ficticios.

## Invariantes de negocio

### Identificador de usuario

`users.username` es `VARCHAR(32) NOT NULL` con índice único `uq_users_username` y collation `utf8mb4_unicode_ci`. El UUID sigue identificando las relaciones y la autenticación. Al registrar, generar `user` + `Date.now()` en milisegundos + cinco dígitos mediante `crypto.randomInt`, rellenando con ceros; reintentar hasta cinco veces ante un conflicto de ese índice y devolver `503` si no se logra asignar uno. La transacción debe revertir la cuenta y su token antes de cada reintento; no reintentar por errores ajenos al username. El registro no acepta un username elegido por el cliente.

`PATCH /users/me` permite cambiarlo por un valor de 3–32 caracteres ASCII (`a-z`, `0-9`, `_`), sin espacios interiores; recortar espacios exteriores y convertir a minúsculas antes de validar. Omitirlo conserva el valor actual; `null` y cadena vacía son inválidos. Actualizar solo los campos enviados en una misma sentencia, y traducir el conflicto de unicidad a `409` con código `USERNAME_TAKEN` sin cambios parciales. Se puede guardar el propio username; todas las cuentas, incluso suspendidas o cerradas, participan en la unicidad. Al cambiarlo, el nombre previo queda disponible; no conservar alias históricos.

Incluirlo en registro, login, renovación, sesión actual y perfiles propios/compartidos. `GET /users/username/:username` realiza una consulta exacta normalizada con `AccessTokenGuard` y `VerifiedEmailGuard`, y solo entrega perfiles de cuentas activas y verificadas, sin correo ni credenciales. La consulta por UUID conserva su contrato actual y la protección global de las lecturas iniciales sigue pendiente. No añadir búsqueda parcial ni amistades por esta funcionalidad.

La migración `AddUserUsername1791072000000` agrega la columna y el índice, rellena los registros anteriores por lotes y después exige `NOT NULL`. Conserva UUID y `updated_at`, reintenta colisiones y puede reanudar el relleno después de una interrupción. Aplicarla con el backend detenido antes de iniciar la nueva versión; revertirla elimina los usernames y exige volver al código compatible. No ejecutar migraciones de pruebas contra la base de desarrollo ni datos ajenos.

### Cupo y confirmaciones

El cupo ofrecido son los lugares adicionales al grupo inicial. La disponibilidad equivale a ese cupo menos la suma de lugares de participaciones confirmadas; el tamaño total equivale al grupo inicial más el cupo ofrecido. Una participación de tres lugares ocupa tres, no uno. No contar al anfitrión nuevamente como una solicitud.

Confirmaciones, aceptación de ofertas, cancelaciones y cambios de capacidad usarán una transacción con bloqueo de la mesa. Dentro de ella, comprobar estado y hora, permisos, participación vigente y disponibilidad actual. Toda modificación que afecte cupo debe bloquear la misma mesa; hacer atómica la actualización de participación y cupo. La cancelación repetida no liberará dos veces los mismos lugares.

Solicitudes y ofertas pendientes no descuentan disponibilidad. La aprobación completa confirma la cantidad solicitada si hay cupo. Una propuesta parcial positiva y menor que la cantidad solicitada solo confirma tras aceptación explícita del titular y nueva comprobación. Si falla por cupo, devolver `409` y conservarla sin confirmar; no reducirla automáticamente. Antes de crear una nueva propuesta, comprobar que el grupo solicitado y la mesa siguen vigentes.

Mantener una sola participación vigente por usuario y mesa, con una representación que permita conservar historial y volver a solicitar tras cancelar. Los reintentos devolverán el resultado de la operación previa cuando sean equivalentes; no crear confirmaciones o avisos duplicados. Expirar pendientes al inicio y rechazar incorporaciones a mesas iniciadas, finalizadas, canceladas o retiradas.

### Privacidad y permisos

Exigir sesión válida antes de entregar contenido de producto, incluso perfiles y proyecciones compartidas con la comunidad. Que la dirección tenga visibilidad `public` significa que la ven los usuarios autenticados; `confirmed-only` exige además ser anfitrión, asistente confirmado o administrador en una revisión autorizada.

Filtrar la dirección privada, coordenadas exactas e instrucciones privadas antes de serializar y emitir eventos. También proteger recursos de mapa, distancias, logs y payloads push. Usar la ubicación aproximada compartida con la comunidad autenticada para filtros y distancias de una mesa privada; no generar aproximaciones aleatorias repetidas que puedan promediarse para reconstruir el punto real.

Al cambiar participación o visibilidad, invalidar cachés y revocar acceso a datos exactos y chat cuando corresponda. Las cachés no deben permitir consultar contenido sin sesión ni eludir permisos; no usar cachés públicas para respuestas privadas. Comprobar propiedad de anuncios, interlocutores y rol del usuario por recurso, tanto en HTTP como en Socket.IO.

### Horario, dinero y reputación

Guardar instantes en UTC y la zona horaria IANA de la mesa. Convertir desde el horario local al publicar y no tomar la zona horaria del servidor como fuente de verdad. La hora de cierre de incorporaciones se validará en el servidor.

Guardar importes con `DECIMAL` de precisión explícita y moneda `MXN`; transmitirlos como cadenas decimales en la API. No convertirlos a coma flotante para cálculos. Cero representa mesa gratuita; cuotas positivas son por persona, y presupuesto omitido en búsquedas no equivale a cero.

Habilitar calificaciones de mesa solo después de finalizar, entre anfitrión y titulares confirmados al cierre. Para ventas, exigir confirmaciones de comprador y vendedor vinculados a la misma operación. Impedir autoevaluación y duplicados. Cancelación y conversación por sí solas no habilitan reputación. Calcular los agregados de mesas y marketplace por separado y mantenerlos coherentes al moderar una calificación.

## Autenticación y protección de datos

La autenticación es obligatoria para consultar y operar en la plataforma. Registro, verificación y recuperación permiten obtener o recuperar el acceso; no habilitan navegación anónima. Una cuenta sin correo verificado o suspendida no puede acceder al contenido. La renovación exige su credencial válida y no sustituye las comprobaciones de estado de cuenta y sesión.

### Verificación de correo según el entorno

La decisión depende exclusivamente de `NODE_ENV` validado en el backend, cuyos valores admitidos son `development`, `test` y `production`. Al registrar una cuenta, aplicar estas reglas dentro de la transacción de creación:

| Entorno | Comportamiento previsto del registro |
| --- | --- |
| `production` | Guardar `emailVerifiedAt: null`, generar un token de verificación de un solo uso y preparar su envío por correo. Responder `emailVerified: false` y `verificationEmailQueued: true`; impedir el inicio de sesión hasta confirmar el correo. |
| `development` o `test` | Guardar `emailVerifiedAt` con el instante de creación de la cuenta, sin generar token ni enviar correo de verificación. Responder `emailVerified: true` y `verificationEmailQueued: false`; permitir iniciar sesión con las credenciales recién registradas. |

Esta regla se aplica al crear cuentas nuevas. El registro no emite una sesión; el usuario debe iniciar sesión. Mantener las comprobaciones de correo verificado, cuenta activa y sesión en los guards y servicios: fuera de producción se persiste la verificación, no se omite la autorización. El cliente se guía por la respuesta de registro y no elige ni envía el entorno o el estado de verificación. La recuperación de contraseña conserva sus tokens y flujo de correo en ambos casos.

La verificación por entorno está implementada para cuentas nuevas y documentada en OpenAPI. No altera cuentas anteriores sin verificar. La configuración sigue rechazando producción mientras solo exista correo local; habilitarla exige un proveedor real.

### Sesiones y credenciales

Usar Argon2id para contraseñas. La API emitirá tokens de acceso de corta duración y renovaciones con rotación y revocación, registrando sesiones para distintos dispositivos. Como valores iniciales de configuración, usar 15 minutos para acceso y 30 días para renovación; validar expiración, firma y cuenta activa.

Guardar únicamente el hash del token de renovación en el servidor. Rotar al renovar, detectar reutilización y revocar la sesión comprometida. Cerrar sesión elimina la renovación; recuperación de contraseña y suspensión revocan sesiones. Proteger operaciones también con el estado vigente de la cuenta, sin depender solo del contenido de un JWT todavía válido.

La API usa transporte móvil sin cookies: `POST /auth/login` y `/auth/refresh` devuelven `{ accessToken, refreshToken, expiresIn, refreshExpiresIn, user }` en JSON y `Cache-Control: no-store`. Las duraciones son segundos; la renovación se recibe exclusivamente en un DTO JSON `{ refreshToken }`, con formato y propiedades estrictos. El cierre conserva bearer válido y revoca la sesión; si el acceso expiró, el cliente renueva primero. CORS está desactivado, sin lista de orígenes ni política de cookies. Exigir HTTPS fuera del desarrollo local; conservar rotación, hashes, expiración y revocación. Los requisitos del cliente se mantienen en las [reglas del frontend](../frontend/rules.md#sesiones-integraciones-y-configuración-pendientes).

Usar tokens de verificación cuando corresponda y tokens de recuperación de un solo uso, con expiración y hashes en el servidor. Evitar revelar si un correo existe en la respuesta de recuperación. Limitar intentos de acceso, registro, envío de correo e importación. No registrar contraseñas, tokens, mensajes privados completos ni coordenadas privadas en logs. Las acciones administrativas requieren autorización y auditoría.

## Integraciones y adaptadores

### BoardGameGeek

Consumir XML API desde el backend con el token propio de MeepleWorld, a través de `Authorization: Bearer ...`, usando `https://boardgamegeek.com` sin el prefijo `www`. El token no debe llegar al frontend. La aplicación necesita registro, aprobación y condiciones de uso compatibles con su finalidad; no se asume que esa autorización ya exista.

Importar la colección pública de juegos poseídos para el usuario BGG indicado. No pedir su contraseña BGG, presentar la importación como inicio de sesión BGG ni acreditar titularidad. Usar identificadores BGG para actualizar juegos y relaciones de biblioteca; no eliminar registros manuales o ausentes en importaciones posteriores.

Encapsular el cliente XML con caché, timeout, límites de concurrencia y reintentos finitos con espera creciente. Tratar respuestas de preparación de colección, límites de uso y fallos temporales como estados controlados, sin bloquear indefinidamente una petición HTTP. Persistir el trabajo de importación y permitir consultar su estado; el proceso puede ejecutarse dentro del backend sin introducir otro proyecto. Deshabilitar entidades externas y DTD en el parser XML. Validar toda la colección antes de aplicar cambios a la biblioteca en una transacción para evitar importaciones parciales.

### Archivos, correo y push

Definir adaptadores de almacenamiento de imágenes, envío de correo y entrega push para desacoplar dominio y proveedor. Los proveedores de producción están pendientes. En desarrollo se admitirán archivos locales fuera del código fuente y adaptadores de prueba para correo y push, identificados como simulados y sin afirmar que se entregó un mensaje real.

Validar imágenes por tipo real y tamaño, generar nombres propios y no ejecutar contenido subido. Las imágenes de perfiles o anuncios compartidas con la comunidad requerirán autorización para su entrega; los recursos privados exigirán además el permiso específico. Al elegir almacenamiento, evitar URLs permanentes de acceso anónimo para contenido de MeepleWorld y definir su entrega autenticada o temporal tras comprobar permisos. Las credenciales del proveedor de almacenamiento pertenecerán al backend.

Persistir notificaciones internas después de confirmar la operación de negocio y procesar su entrega externa por separado, con un registro recuperable de entregas pendientes. Un fallo de correo o push no revertirá una asistencia confirmada. Los dispositivos tendrán registro y baja de tokens push; cerrar sesión desvinculará el dispositivo de la cuenta. Los avisos push serán genéricos y abrirán recursos solo después de comprobar permiso vigente.

## Configuración

El backend valida su configuración al iniciar y tiene [backend/.env.example](../../backend/.env.example).

| Proyecto | Variables previstas | Uso |
| --- | --- | --- |
| Backend | `NODE_ENV`, `PORT`, `APP_PUBLIC_URL` | Entorno, puerto y base reservada para enlaces de cuenta; no es configuración CORS. |
| Backend | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión MySQL local y entornos separados. |
| Backend | `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_DAYS` | Firma y duración de sesiones; secreto independiente por entorno. |
| Backend | `MAIL_DRIVER`, `LOCAL_MAILBOX_PATH` | El adaptador local simulado guarda mensajes fuera del control de versiones. |
| Backend futuro | `BGG_ENABLED`, `BGG_API_TOKEN`, `STORAGE_DRIVER`, `LOCAL_UPLOAD_PATH`, `PUSH_DRIVER` | Integraciones externas pendientes de configurar. |

`NODE_ENV=production` exige confirmación de correo. Con `NODE_ENV=development` o `NODE_ENV=test`, las cuentas nuevas se crean con correo verificado automáticamente. No añadir una bandera independiente para omitir la verificación en producción. `CORS_ORIGINS`, `AUTH_COOKIE_SECURE` y `AUTH_COOKIE_SAME_SITE` se retiraron de la configuración y del ejemplo.

Los nombres específicos de credenciales de hosting, archivos, correo y push se documentarán cuando se elijan sus proveedores. Los adaptadores reales deberán rechazar configuración incompleta; solo desarrollo y pruebas permitirán adaptadores simulados. El modo BGG deshabilitado debe comunicar su indisponibilidad y conservar la biblioteca manual.

Nunca versionar `.env`, credenciales push, certificados, contraseñas o tokens. No entregar secretos del backend al cliente móvil. La URL de API y los enlaces de cuenta deberán ser alcanzables desde los dispositivos físicos; `localhost` dentro del dispositivo no apunta al backend del equipo.

## Desarrollo y compilación

Mantener `package-lock.json` y ejecutar los comandos desde `backend/`. MySQL 8.4 LTS se ejecuta localmente; los puertos de desarrollo son 3000 para NestJS y 3306 para MySQL. El backend conserva su instalación independiente, migración inicial, servidor de desarrollo y comprobaciones de tipos. Los pasos de configuración y arranque están en [backend/README.md](../../backend/README.md).

| Comando | Propósito y estado |
| --- | --- |
| `npm install` | Instalar dependencias y actualizar el lockfile del backend. |
| `npm ci` | Instalar de forma reproducible desde `backend/package-lock.json`. |
| `npm run start:dev` | Servir NestJS en modo desarrollo. |
| `npm run typecheck` | Comprobar tipos del backend. |
| `npm run migration:show` | Mostrar migraciones pendientes y aplicadas. |
| `npm run migration:run` | Aplicar migraciones a la base configurada. |
| `npm run migration:revert` | Revertir la última migración, cuando sea reversible y esté autorizado. |
| `npm run build` | Compilar el backend. |
| `npm run lint` | Pendiente: definir y configurar ESLint. |
| `npm test` | Compilar y ejecutar las suites de autenticación y `username` con Node.js. La integración MySQL se omite si no se indica `MEEPLEWORLD_TEST_MYSQL_SOCKET`. |

## Verificación

Ejecutar tipos, compilación y pruebas configuradas para cambios del backend. Las suites de autenticación y `username` verifican comportamiento con adaptadores controlados y datos ficticios; autenticación añade un servidor HTTP temporal y la integración opcional usa MySQL temporal. No cargan `.env` ni usan datos de desarrollo. Ver [backend/README.md](../../backend/README.md#pruebas-de-username). ESLint y Vitest/Supertest siguen pendientes; no presentar sus comandos como disponibles.

Los siguientes escenarios guían las pruebas de las capacidades correspondientes; su inclusión no acredita que exista una suite ni que todas las funciones estén implementadas:

- Con MySQL de pruebas y migraciones reales: competencia por el último lugar, grupos con acompañantes, aprobación parcial sin cupo, reintentos y cancelación doble. No usar SQLite como sustituto para verificar bloqueos de MySQL.
- API y Socket.IO: rechazo de lecturas de producto sin sesión válida, excepciones de acceso explícitas, cuenta sin verificar o suspendida, permisos de autor y asistente, omisión de coordenadas privadas en proyecciones compartidas y revocación durante una conexión abierta.
- Biblioteca: importación repetida, conservación de juegos manuales, colección inválida, timeout y falta de autorización BGG. Usar respuestas controladas en pruebas, no depender de su servicio real.
- Reputación: mesa finalizada con participación elegible, mesa cancelada, acompañante sin cuenta, operación unilateral, autoevaluación y duplicados.
- Sesiones: verificación, recuperación de un solo uso, renovación rotada, reutilización, cierre de sesión, autorización tras revocación.
- Registro por entorno: en `development` y `test`, verificación persistida al crear la cuenta, respuesta `emailVerified: true`/`verificationEmailQueued: false`, ausencia de token y envío de verificación e inicio de sesión inmediato. En producción, cuenta sin verificar y acceso denegado hasta consumir el token. Usar un adaptador de correo controlado en pruebas y comprobar que la recuperación funciona en ambos casos.

Distinguir API implementada, comportamiento previsto y adaptadores simulados. Flutter integra únicamente los endpoints de autenticación; el contenido de producto sigue pendiente. No afirmar que correo, BGG o push funcionan sin integrar y verificar su entrega o consumo real.
