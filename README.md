# MeepleWorld

MeepleWorld es una plataforma en desarrollo para personas que disfrutan los juegos de mesa y quieren encontrar con quién jugar, descubrir nuevos juegos y ampliar su círculo de amigos.

Su propuesta principal son las **mesas**: encuentros que una persona organiza en su ciudad y publica para que otros puedan asistir. El anfitrión indica cuándo se juega, qué juegos propone, cuántos lugares ofrece y qué amenidades estarán disponibles. Cada mesa puede ser abierta o requerir aprobación, y puede tener una cuota opcional acordada con el anfitrión.

Para acceder a MeepleWorld será obligatorio crear una cuenta e iniciar sesión con el correo verificado. En producción, el usuario deberá confirmarlo mediante correo; fuera de producción, se marcará como verificado automáticamente al crear la cuenta. También se requerirá una sesión válida para explorar mesas y anuncios, consultar el catálogo o ver perfiles. Sin sesión estarán disponibles únicamente los flujos de registro, acceso, verificación y recuperación de cuenta.

## Qué podrás hacer

- Encontrar mesas cercanas en un mapa o en un listado.
- Organizar encuentros y solicitar lugares para ti y tus acompañantes.
- Registrar tu biblioteca de juegos manualmente o importar tu colección pública de BoardGameGeek (BGG).
- Publicar juegos en venta o búsquedas de juegos que quieras conseguir.
- Conversar con vendedores y compradores, y coordinarte con los asistentes de una mesa.
- Consultar la reputación de otros usuarios y reportar problemas de convivencia.

Los pagos y las entregas se acordarán directamente entre usuarios. El anfitrión elegirá si la dirección de su mesa se comparte con todos los usuarios autenticados o únicamente con asistentes confirmados. El contenido denominado público será visible dentro de la comunidad autenticada.

## Disponibilidad prevista

El lanzamiento inicial está pensado para **México**, en **español**, con precios en **pesos mexicanos (MXN)**. MeepleWorld tendrá aplicaciones móviles para Android e iOS desarrolladas con Flutter. La web queda fuera del alcance.

## Estado del proyecto

El repositorio contiene un frontend Flutter en `frontend/`, con layout principal, cinco vistas provisionales y un layout de autenticación básico con registro e inicio de sesión conectados a la API. El backend NestJS incluye cuentas, perfiles, catálogo/biblioteca, mesas y anuncios. La app restaura y renueva sesiones con almacenamiento seguro; el contenido de producto aún no consume la API.

La obligación de iniciar sesión para todas las consultas ya está definida como regla de producto. El backend inicial aún permite consultas anónimas de perfiles, catálogo, mesas y anuncios; proteger esas rutas y actualizar su contrato OpenAPI sigue pendiente.

El registro ya verifica automáticamente el correo de las cuentas nuevas en desarrollo y pruebas, sin generar token ni enviar verificación. En producción sigue siendo necesaria la confirmación por correo; el proveedor real está pendiente y el servidor rechaza ese entorno mientras solo exista el adaptador local.

El backend ya asigna a cada cuenta un `username` único con `user` + timestamp en milisegundos + cinco dígitos aleatorios. Permite personalizarlo al editar el perfil y consultar un perfil por ese nombre exacto con sesión y correo verificado. La migración también asigna usernames a las cuentas existentes; debe aplicarse antes de arrancar la nueva versión. La edición, búsqueda y compartir perfiles en la app, y las relaciones de amistad, siguen pendientes.

Con una sesión válida, `/` abre Inicio con el fondo radial aprobado (`#DFC6FE` → `#F3E6EF`), menú inferior flotante, cabecera y cinco accesos visuales. El saludo usa el nombre visible de la cuenta real. «La Paz» sigue siendo provisional y la cabecera y las tarjetas no tienen acciones conectadas. Sin sesión se abre `/auth`, con «Crea tu cuenta» primero y «Ya tengo una cuenta» después; cada botón lleva a su vista independiente dentro del layout de autenticación. Crear cuenta aplica el diseño aprobado con nombre, correo, contraseña y confirmación, campos de vidrio y botón «Siguiente». Mi Perfil añade Cerrar sesión. El correo real, mapa, chat, Socket.IO, BGG, notificaciones, reputación y moderación siguen pendientes; Mis amigos continúa como acceso visual.

El código Flutter está organizado por funcionalidades: `app` compone arranque, router y los dos layouts; `core` reúne componentes, cliente HTTP y almacenamiento seguro; `features/auth` implementa modelos, servicios, repositorio y modelos de vista para registro y sesiones. La arquitectura está documentada en las [reglas del frontend](.github/frontend/rules.md).

Las 18 variantes de Jeko entregadas para la identidad visual están registradas como recursos locales del frontend, cada una con una familia independiente; se conserva también la familia general `Jeko`. Su uso está documentado en la [guía del frontend](frontend/README.md); los títulos provisionales usan Jeko, sin un tema global.

Android ya utiliza el icono oficial de MeepleWorld: ilustración con su degradado original sobre blanco puro, capas adaptativas y versión monocromática para los colores personalizados del sistema en launchers compatibles. También están generados los PNG para versiones anteriores y el archivo para Google Play. Los originales y recursos se documentan en la [guía del icono](frontend/README.md#icono-oficial-de-android); el icono oficial de iOS y la publicación en tiendas siguen pendientes.

### Arranque rápido del frontend

Ejecuta el proyecto desde su propio directorio:

```sh
cd frontend
flutter pub get
flutter devices
flutter run -d <id-del-dispositivo>
```

Los requisitos de Android/iOS y las comprobaciones disponibles están en la [guía del frontend](frontend/README.md). El frontend usa Flutter/Dart y el backend usa Node.js/npm; cada uno mantiene sus dependencias y lockfile. El repositorio no fija versiones de Node.js ni npm ni usa npm workspaces. El backend se ejecuta desde `backend/`; consulta su [README](backend/README.md) para configurar MySQL y arrancarlo.

## Documentación

- [Idea, alcance y reglas del producto](documentation/idea_design.md).
- [Punto de entrada para agentes](AGENTS.md).
- [Índice de instrucciones técnicas](.github/agent_instructions.md).
- [Reglas e instrucciones del backend](.github/backend/rules.md).
- [Reglas e instrucciones del frontend](.github/frontend/rules.md).
- [Guía de instalación y arranque del frontend](frontend/README.md).
