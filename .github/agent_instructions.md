# MeepleWorld: guía técnica e instrucciones para agentes

Estado: arquitectura prevista, previa a la implementación. Última actualización: 29 de septiembre de 2026.

Esta guía define cómo construir los proyectos del monorepo. Las reglas de negocio están en [idea_design.md](../documentation/idea_design.md) y la presentación del producto en el [README](../README.md). Actualmente existen estos documentos; los proyectos, dependencias, scripts, pruebas y servicios descritos aquí todavía deben crearse.

## 1. Decisiones técnicas

| Área | Base acordada |
| --- | --- |
| Monorepo | npm workspaces con dos proyectos: `frontend` y `backend`; raíz privada y un único `package-lock.json`. |
| Entorno | Node.js 24 LTS, mínimo 24.15 para el CLI de NestJS 12; npm compatible con esa versión, fijado al inicializar. |
| Lenguaje | TypeScript con comprobaciones estrictas en ambos proyectos. |
| Frontend | Ionic Framework 9, Vue 3 desde 3.5, Vue Router 5, Vite y Pinia. |
| Móviles | Capacitor 8 para Android e iOS; mismo frontend para web y contenedores nativos. |
| Mapas | Mapbox para mapa y visualización de mesas; listado como vista complementaria. |
| Backend | NestJS 12 con ESM y adaptador HTTP Express. |
| Persistencia | MySQL 8.4 LTS, TypeORM, `@nestjs/typeorm` y controlador `mysql2`. |
| Contratos | API REST bajo `/api/v1`, documentada con OpenAPI; Socket.IO para chat. |
| Pruebas previstas | Vitest en ambos proyectos, Vue Test Utils para componentes, Supertest para API y Playwright para recorridos web. |
| Desarrollo local | Node.js y MySQL instalados localmente; sin Docker ni Docker Compose. |

MySQL 8.4 LTS sustituye la propuesta inicial de 8.3 por decisión del proyecto. Las versiones exactas de dependencias compatibles se fijarán al crear las aplicaciones, conservando las series acordadas y el lockfile raíz. No introducir otro gestor de paquetes, ORM o framework sin actualizar la decisión y la documentación.

Ionic 9 requiere Vue 3.5 y Vue Router 5 en su integración Vue. NestJS 12 publica sus paquetes en ESM y su configuración de proyectos ESM utiliza Vitest. Los requisitos se respaldan en las [notas de Ionic 9](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md) y la [guía de NestJS 12](https://docs.nestjs.com/migration-guide). Usar `type: module` y resolución `NodeNext` en el backend; respetar las extensiones de importación de su salida ESM.

## 2. Organización prevista

```text
meepleworld/
├── AGENTS.md
├── README.md
├── documentation/
│   └── idea_design.md
├── .github/
│   └── agent_instructions.md
├── package.json                 # futuro: raíz privada y workspaces
├── package-lock.json            # futuro: único lockfile
├── frontend/                    # futuro: Ionic + Vue + Capacitor
│   ├── src/
│   │   ├── app/                 # arranque, router y configuración
│   │   ├── features/            # pantallas, componentes y estado por dominio
│   │   ├── shared/              # componentes y utilidades compartidas
│   │   └── services/            # HTTP, Socket.IO y adaptadores de plataforma
│   ├── android/                 # futuro: proyecto nativo Capacitor
│   └── ios/                     # futuro: proyecto nativo Capacitor
└── backend/                     # futuro: NestJS
    └── src/
        ├── modules/             # módulos de negocio
        ├── common/              # filtros, guards y utilidades comunes
        ├── config/              # configuración validada
        └── database/            # DataSource y migraciones
```

Los workspaces se llamarán `frontend` y `backend`. Configurar los comandos desde la raíz y evitar lockfiles anidados. Los proyectos nativos de Capacitor permanecerán dentro del frontend. No crear un tercer proyecto para compartir entidades del backend: los contratos públicos deben ser independientes del ORM y del código del servidor.

## 3. Frontend

Usar componentes Vue de archivo único con Composition API y `<script setup lang="ts">`. Agrupar funcionalidades de acceso, perfiles y biblioteca, mesas, marketplace, chat, notificaciones, reputación y administración. Separar la vista de formularios, el estado Pinia y los servicios HTTP o Socket.IO.

Usar componentes Ionic y su integración de router, incluyendo `IonRouterOutlet`, para conservar navegación y ciclo de vida móvil. Considerar que Ionic puede conservar páginas montadas: actualizar datos al entrar cuando proceda, detener listeners al salir y eliminar suscripciones al cerrar sesión. Los guards de navegación devuelven resultados y no usan el patrón obsoleto `next()`.

El servidor será la autoridad para cupo, permisos, precios publicados y estados. No calcular confirmaciones definitivas únicamente en Pinia ni mostrar éxito antes de la respuesta. Ante un conflicto, refrescar disponibilidad y explicar la acción necesaria. Evitar duplicar solicitudes mediante botones deshabilitados mientras una operación está en curso y control de reintentos.

El mapa y el listado compartirán filtros y datos de consulta. Mapbox recibirá únicamente la ubicación permitida por la respuesta del backend. Una mesa privada utilizará el punto aproximado público hasta que el servidor autorice datos exactos. Pedir geolocalización en contexto mediante Capacitor en móviles y las APIs del navegador en web; ofrecer siempre selección de ciudad.

La web será adaptable y los móviles respetarán zonas seguras, teclado y botón de retroceso. Formularios y estados deben ser accesibles por teclado, tener etiquetas y describir errores. Mostrar fechas en la zona horaria de la mesa, identificarla cuando difiera de la del usuario y formatear dinero como MXN.

La primera versión no tendrá escritura offline ni promesas de sincronización posterior. Mostrar estados de carga, vacío, error y falta de conexión. Recuperar mensajes y notificaciones desde el servidor tras reconectar; no depender exclusivamente de los eventos en vivo.

## 4. Backend y contratos

Construir un monolito modular. Los módulos previstos son autenticación, usuarios, catálogo, bibliotecas, mesas y participaciones, marketplace y operaciones declaradas, conversaciones, notificaciones, reputación, moderación e integraciones. Cada módulo tendrá controladores para transporte, servicios para reglas y repositorios TypeORM para persistencia.

### API REST

- Prefijo `/api/v1`; contratos de solicitud, respuesta y error independientes de entidades TypeORM, documentados mediante `@nestjs/swagger`.
- DTOs tipados con validación en ejecución. Rechazar cantidades no enteras, valores fuera del dominio, propiedades no permitidas y estados incompatibles.
- Separar respuestas públicas de datos privados y de administración. Nunca serializar directamente entidades que contengan credenciales, direcciones privadas o tokens.
- Paginar listados, mensajes e historial; limitar el tamaño de página y admitir filtros documentados. En chat ordenar de forma estable para recuperar mensajes después de una desconexión.
- Autorizar por cuenta activa, correo verificado, propiedad y relación con el recurso. El rol administrador no sustituye la verificación de una intervención autorizada.
- Responder con códigos HTTP coherentes: `401` sin autenticación válida, `403` sin permiso, `404` recurso no disponible, `409` conflicto de cupo o estado y `400` entrada inválida. Incluir un código de error estable, un mensaje comprensible y un identificador de petición; no exponer trazas o consultas SQL.

El contrato deberá representar por separado lugares solicitados, lugares ofrecidos parcialmente y lugares confirmados. El número siempre incluirá al titular. Para mesas, distinguir modalidad abierta o con aprobación y ubicación pública o exclusiva de confirmados. Estas son capacidades del contrato previsto, no endpoints implementados.

### Socket.IO

Autenticar conexiones y autorizar por conversación cada unión a sala, lectura y envío. No confiar en identificadores de usuario o salas enviados por el cliente como prueba de permiso. Revalidar cuenta y pertenencia al enviar; una conexión previa no conserva permisos revocados.

Persistir el mensaje antes de confirmar su recepción. Asociar un identificador de envío del cliente para deduplicar reintentos y devolver el resultado previo cuando corresponda. Los eventos complementarán el historial REST. Evitar que reconectar duplique listeners, conversaciones o mensajes.

Las salas de mesa contendrán al anfitrión y titulares confirmados. Al cancelar o retirar participación, expulsar sus conexiones y negar historial y nuevos mensajes. Finalizar o cancelar una mesa dejará el chat en solo lectura para miembros que conserven permiso; una cancelación general revocará los permisos de los asistentes conforme a las participaciones canceladas. Para chats privados de anuncios, comprobar interlocutores y bloqueos en el servidor.

## 5. Modelo conceptual de datos

El modelo siguiente es una base de dominio; no constituye DDL ni migraciones existentes.

| Entidad o conjunto | Relaciones y responsabilidad |
| --- | --- |
| Usuario y perfil | Correo único normalizado, hash de contraseña, verificación, estado, nombre visible, avatar y ciudad. Permisos administrativos separados de la propiedad de una mesa. |
| Sesión y tokens de cuenta | Varias sesiones por usuario, renovación revocable y tokens de verificación o recuperación de un solo uso. Guardar hashes de tokens sensibles. |
| Juego | Registro local con nombre, metadatos e identificador BGG opcional y único cuando exista. |
| Entrada de biblioteca | Relación usuario-juego única, procedencia manual o BGG y datos de importación sin credenciales BGG del usuario. |
| Mesa y juegos de mesa | Anfitrión, horario, zona horaria, grupo inicial, cupo ofrecido, modalidad, cuota, amenidades, estado y juegos asociados. |
| Ubicación de mesa | Dirección y coordenadas exactas, ubicación aproximada pública, ciudad y política de visibilidad. |
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

## 6. Invariantes de negocio

### Cupo y confirmaciones

El cupo ofrecido son los lugares adicionales al grupo inicial. La disponibilidad equivale a ese cupo menos la suma de lugares de participaciones confirmadas; el tamaño total equivale al grupo inicial más el cupo ofrecido. Una participación de tres lugares ocupa tres, no uno. No contar al anfitrión nuevamente como una solicitud.

Confirmaciones, aceptación de ofertas, cancelaciones y cambios de capacidad usarán una transacción con bloqueo de la mesa. Dentro de ella, comprobar estado y hora, permisos, participación vigente y disponibilidad actual. Toda modificación que afecte cupo debe bloquear la misma mesa; hacer atómica la actualización de participación y cupo. La cancelación repetida no liberará dos veces los mismos lugares.

Solicitudes y ofertas pendientes no descuentan disponibilidad. La aprobación completa confirma la cantidad solicitada si hay cupo. Una propuesta parcial positiva y menor que la cantidad solicitada solo confirma tras aceptación explícita del titular y nueva comprobación. Si falla por cupo, devolver `409` y conservarla sin confirmar; no reducirla automáticamente. Antes de crear una nueva propuesta, comprobar que el grupo solicitado y la mesa siguen vigentes.

Mantener una sola participación vigente por usuario y mesa, con una representación que permita conservar historial y volver a solicitar tras cancelar. Los reintentos devolverán el resultado de la operación previa cuando sean equivalentes; no crear confirmaciones o avisos duplicados. Expirar pendientes al inicio y rechazar incorporaciones a mesas iniciadas, finalizadas, canceladas o retiradas.

### Privacidad y permisos

Filtrar la dirección privada, coordenadas exactas e instrucciones privadas antes de serializar y emitir eventos. También proteger recursos de mapa, distancias, logs y payloads push. Usar la ubicación pública aproximada para filtros y distancias de una mesa privada; no generar aproximaciones aleatorias repetidas que puedan promediarse para reconstruir el punto real.

Al cambiar participación o visibilidad, invalidar cachés y revocar acceso a datos exactos y chat cuando corresponda. No usar cachés públicas para respuestas privadas. Comprobar propiedad de anuncios, interlocutores y rol del usuario por recurso, tanto en HTTP como en Socket.IO.

### Horario, dinero y reputación

Guardar instantes en UTC y la zona horaria IANA de la mesa. Convertir desde el horario local al publicar y no tomar la zona horaria del servidor como fuente de verdad. La hora de cierre de incorporaciones se validará en el servidor.

Guardar importes con `DECIMAL` de precisión explícita y moneda `MXN`; transmitirlos como cadenas decimales en la API. No convertirlos a coma flotante para cálculos. Cero representa mesa gratuita; cuotas positivas son por persona, y presupuesto omitido en búsquedas no equivale a cero.

Habilitar calificaciones de mesa solo después de finalizar, entre anfitrión y titulares confirmados al cierre. Para ventas, exigir confirmaciones de comprador y vendedor vinculados a la misma operación. Impedir autoevaluación y duplicados. Cancelación y conversación por sí solas no habilitan reputación. Calcular los agregados de mesas y marketplace por separado y mantenerlos coherentes al moderar una calificación.

## 7. Autenticación y protección de datos

Usar Argon2id para contraseñas. La API emitirá tokens de acceso de corta duración y renovaciones con rotación y revocación, registrando sesiones para distintos dispositivos. Como valores iniciales de configuración, usar 15 minutos para acceso y 30 días para renovación; validar expiración, firma y cuenta activa.

Guardar únicamente el hash del token de renovación en el servidor. Rotar al renovar, detectar reutilización y revocar la sesión comprometida. Cerrar sesión elimina la renovación; recuperación de contraseña y suspensión revocan sesiones. Proteger operaciones también con el estado vigente de la cuenta, sin depender solo del contenido de un JWT todavía válido.

En web, mantener el acceso en memoria y la renovación en cookie HttpOnly, Secure en producción y con alcance limitado. Configurar SameSite de acuerdo con los dominios del despliegue: `Lax` cuando sean del mismo sitio; un despliegue entre sitios requerirá `None`, HTTPS y protección CSRF explícita. Usar CORS con lista de orígenes permitidos y credenciales solo donde corresponda.

En móviles, guardar la renovación mediante un adaptador de almacenamiento seguro basado en Keychain/Keystore; no usar localStorage ni Capacitor Preferences para secretos. Elegir y verificar un plugin compatible antes de implementar ese adaptador. Mantener el acceso en memoria y eliminar credenciales al cerrar sesión.

Usar tokens de verificación y recuperación de un solo uso, con expiración y hashes en el servidor. Evitar revelar si un correo existe en la respuesta de recuperación. Limitar intentos de acceso, registro, envío de correo e importación. No registrar contraseñas, tokens, mensajes privados completos ni coordenadas privadas en logs. Las acciones administrativas requieren autorización y auditoría.

## 8. Integraciones y adaptadores

### BoardGameGeek

Consumir XML API desde el backend con el token propio de MeepleWorld, a través de `Authorization: Bearer ...`, usando `https://boardgamegeek.com` sin el prefijo `www`. El token no debe llegar al frontend. La aplicación necesita registro, aprobación y condiciones de uso compatibles con su finalidad; no se asume que esa autorización ya exista. Mostrar el logotipo legible **Powered by BGG** enlazado a BGG cuando se presenten sus datos, conforme a su [guía de uso](https://boardgamegeek.com/using_the_xml_api).

Importar la colección pública de juegos poseídos para el usuario BGG indicado. No pedir su contraseña BGG, presentar la importación como inicio de sesión BGG ni acreditar titularidad. Usar identificadores BGG para actualizar juegos y relaciones de biblioteca; no eliminar registros manuales o ausentes en importaciones posteriores.

Encapsular el cliente XML con caché, timeout, límites de concurrencia y reintentos finitos con espera creciente. Tratar respuestas de preparación de colección, límites de uso y fallos temporales como estados controlados, sin bloquear indefinidamente una petición HTTP. Persistir el trabajo de importación y permitir consultar su estado; el proceso puede ejecutarse dentro del backend sin introducir otro proyecto. Deshabilitar entidades externas y DTD en el parser XML. Validar toda la colección antes de aplicar cambios a la biblioteca en una transacción para evitar importaciones parciales.

### Archivos, correo y push

Definir adaptadores de almacenamiento de imágenes, envío de correo y entrega push para desacoplar dominio y proveedor. Los proveedores de producción están pendientes. En desarrollo se admitirán archivos locales fuera del código fuente y adaptadores de prueba para correo y push, identificados como simulados y sin afirmar que se entregó un mensaje real.

Validar imágenes por tipo real y tamaño, generar nombres propios y no ejecutar contenido subido. Las imágenes públicas de perfiles o anuncios tendrán un tratamiento distinto de recursos privados. Las credenciales del proveedor de almacenamiento pertenecerán al backend.

Persistir notificaciones internas después de confirmar la operación de negocio y procesar su entrega externa por separado, con un registro recuperable de entregas pendientes. Un fallo de correo o push no revertirá una asistencia confirmada. Los dispositivos tendrán registro y baja de tokens push; cerrar sesión desvinculará el dispositivo de la cuenta. Los avisos push serán genéricos y abrirán recursos solo después de comprobar permiso vigente.

## 9. Configuración prevista

Estos nombres son el contrato inicial de configuración; todavía no existen archivos `.env` ni un validador. Crear ejemplos sin secretos al inicializar cada proyecto y validar la configuración requerida al arrancar. Todo valor `VITE_*` se incluye en el cliente y debe considerarse público.

| Proyecto | Variables previstas | Uso |
| --- | --- | --- |
| Frontend | `VITE_API_BASE_URL` | URL de la API, incluido `/api/v1`. |
| Frontend | `VITE_WS_URL` | Origen del servidor Socket.IO. |
| Frontend | `VITE_MAPBOX_PUBLIC_TOKEN` | Token público con permisos mínimos y restricciones aplicables. |
| Backend | `NODE_ENV`, `PORT`, `APP_PUBLIC_URL`, `CORS_ORIGINS` | Entorno, puerto, enlaces de cuenta y orígenes permitidos. |
| Backend | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión MySQL local y entornos separados. |
| Backend | `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL` | Firma y duración de sesiones; secreto independiente por entorno. |
| Backend | `AUTH_COOKIE_SECURE`, `AUTH_COOKIE_SAME_SITE` | Política de cookies; `Secure` obligatorio en producción. |
| Backend | `BGG_ENABLED`, `BGG_API_TOKEN` | Habilitación y token secreto de aplicación BGG. |
| Backend | `STORAGE_DRIVER`, `LOCAL_UPLOAD_PATH` | Selección de almacenamiento; directorio local de desarrollo. |
| Backend | `MAIL_DRIVER`, `MAIL_FROM`, `PUSH_DRIVER` | Selección de adaptadores de correo y push. |

Los nombres específicos de credenciales de hosting, archivos, correo y push se documentarán cuando se elijan sus proveedores. Los adaptadores reales deberán rechazar configuración incompleta; solo desarrollo y pruebas permitirán adaptadores simulados. El modo BGG deshabilitado debe comunicar su indisponibilidad y conservar la biblioteca manual.

Nunca versionar `.env`, credenciales push, certificados, llaves de firma móvil, contraseñas o tokens. Las URLs usadas en dispositivos físicos deberán alcanzar el equipo de desarrollo; `localhost` dentro del dispositivo no apunta al backend del equipo. Evitar copiar secretos de backend a configuración de Capacitor o Vite.

## 10. Desarrollo y compilación previstos

La inicialización deberá preparar Node.js 24 LTS desde 24.15, npm y MySQL 8.4 LTS local. Los valores convencionales de desarrollo serán puerto 5173 para Vite, 3000 para NestJS y 3306 para MySQL, configurables y sin depender de ellos en las reglas de negocio.

Para Android se necesitarán Android Studio 2025.2.1 o superior y SDK configurado. La base Capacitor 8 establece Android API 24 como mínimo y SDK de compilación y destino 36. Para iOS se necesitarán macOS, Xcode 26 o superior y sus herramientas de línea de comandos, con Swift Package Manager como base. MeepleWorld fijará iOS 16 como mínimo por los requisitos de Ionic 9. Ver [entorno Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup), [actualización Capacitor 8](https://capacitorjs.com/docs/updating/8-0) y [soporte Ionic 9](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md).

Verificar además que los requisitos de Mapbox y los plugins elegidos sean compatibles antes de fijar definitivamente los destinos. La firma, los identificadores de aplicación y las cuentas de las tiendas están pendientes y deberán configurarse sin incluir secretos en Git.

Los siguientes comandos son **previstos**. No son ejecutables en el estado documental actual; crear sus scripts y dependencias antes de anunciarlos como disponibles.

| Desde la raíz | Propósito futuro |
| --- | --- |
| `npm install` | Instalación inicial y creación del lockfile raíz. |
| `npm ci` | Instalación reproducible una vez que exista el lockfile. |
| `npm run dev --workspace frontend` | Servir el frontend con Vite. |
| `npm run start:dev --workspace backend` | Servir NestJS en modo desarrollo. |
| `npm run migration:run --workspace backend` | Aplicar migraciones a la base configurada. |
| `npm run migration:revert --workspace backend` | Revertir la última migración, cuando sea reversible y esté autorizado. |
| `npm run lint --workspaces` | Comprobar estilo y problemas estáticos. |
| `npm run typecheck --workspaces` | Comprobar tipos sin emitir salida. |
| `npm run test --workspaces` | Ejecutar las pruebas de ambos proyectos. |
| `npm run build --workspaces` | Generar los artefactos web y del servidor. |
| `npm exec --workspace frontend -- cap sync android` | Sincronizar un proyecto Android ya creado, después del build frontend. |
| `npm exec --workspace frontend -- cap sync ios` | Sincronizar un proyecto iOS ya creado, después del build frontend. |

Al inicializar Capacitor, configurar `webDir` con la salida `dist` del frontend y crear Android e iOS una vez. Compilar el frontend antes de sincronizar; finalizar la compilación nativa en Android Studio o Xcode. Los directorios nativos serán parte del proyecto y sus artefactos de compilación serán generados. No presentar `cap sync` como una compilación final o una publicación en tiendas.

## 11. Verificación prevista

Las pruebas de negocio deben cubrir reglas con efecto real. No exigir pruebas que únicamente reflejen el texto de esta documentación. Para esta entrega documental basta revisar coherencia, enlaces y formato.

- Con MySQL de pruebas y migraciones reales: competencia por el último lugar, grupos con acompañantes, aprobación parcial sin cupo, reintentos y cancelación doble. No usar SQLite como sustituto para verificar bloqueos de MySQL.
- API y Socket.IO: permisos de autor y asistente, omisión de coordenadas privadas en todas las proyecciones públicas, revocación durante una conexión abierta y cuenta suspendida.
- Biblioteca: importación repetida, conservación de juegos manuales, colección inválida, timeout y falta de autorización BGG. Usar respuestas controladas en pruebas, no depender de su servicio real.
- Reputación: mesa finalizada con participación elegible, mesa cancelada, acompañante sin cuenta, operación unilateral, autoevaluación y duplicados.
- Frontend y recorridos: filtros consistentes, ciudad manual sin geolocalización, aceptación de oferta con error `409`, acceso al chat, ausencia de conexión y push denegado.
- Sesiones: verificación, recuperación de un solo uso, renovación rotada, reutilización, cierre de sesión y autorización tras revocación.

Cuando existan proyectos, ejecutar los checks pertinentes de tipos, lint, pruebas y compilación antes de entregar cambios. Para funcionalidades de plataforma, verificar también en emulador o dispositivo Android e iOS y registrar la cobertura real. No afirmar que una compilación o entrega push pasó si solo se comprobó la web.

## 12. Forma de trabajo para agentes

1. Leer esta guía, la definición del producto y cualquier instrucción aplicable antes de modificar el proyecto. Inspeccionar la estructura real: esta guía describe un destino, no confirma que ya exista.
2. Implementar dentro del alcance solicitado y mantener las decisiones acordadas. Consultar al responsable si una necesidad exige cambiar stack, reglas de cupo, privacidad, pagos o alcance; resolver decisiones rutinarias de implementación sin pedir aprobación repetida.
3. Mantener reglas de negocio en servicios del backend y contratos tipados; no exponer entidades ni secretos al frontend. Respetar invariantes también en tareas de fondo y moderación.
4. Preferir cambios acotados, migraciones revisables y pruebas proporcionales. No modificar datos ajenos ni usar servicios reales para pruebas sin autorización aplicable.
5. No incorporar claves o credenciales en código, documentación, pruebas, commits o logs. Usar datos ficticios y configuración de ejemplo.
6. Actualizar documentación y OpenAPI cuando cambien comportamiento, contratos, configuración o pasos de instalación. Marcar explícitamente lo implementado, lo previsto y lo pendiente.
7. Informar qué cambió, cómo se verificó y qué limitaciones quedan. No declarar funcional una integración con credenciales ausentes o simuladas.

El archivo [AGENTS.md](../AGENTS.md) de la raíz es el punto de entrada para agentes y establece la lectura de esta guía y de la definición del producto. Mantener aquí las instrucciones técnicas detalladas y actualizar el resumen de AGENTS.md cuando cambie una decisión que también aparezca allí.
