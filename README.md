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

El repositorio contiene un frontend Flutter en `frontend/`, con plataformas Android e iOS, layout principal y navegación entre cinco vistas provisionales, y un backend NestJS con entidades y API REST inicial para cuentas, perfiles, catálogo/biblioteca, mesas y anuncios. La integración del cliente móvil con esa API está pendiente.

La obligación de iniciar sesión para todas las consultas ya está definida como regla de producto. El backend inicial aún permite consultas anónimas de perfiles, catálogo, mesas y anuncios; proteger esas rutas y actualizar su contrato OpenAPI sigue pendiente.

La verificación automática al registrar cuentas fuera de producción también está acordada y pendiente de implementación. El registro actual todavía exige confirmar el correo en todos los entornos que admite el backend.

La ruta `/` abre Inicio dentro del layout principal, con el fondo radial aprobado (`#DFC6FE` → `#F3E6EF`) y un menú inferior flotante para Inicio, Mesas, Marketplace, Mensajes y Mi Perfil. Inicio muestra la cabecera con «La Paz», búsqueda y notificaciones, el saludo provisional «Hola, Enrique» y cinco accesos: Crear mesa, Ver mapa, Mi ludoteca, Mis amigos y Marketplace. Crear mesa ocupa dos filas y usa una fotografía recreada en formato vertical con un degradado morado; las otras tarjetas usan los colores e iconos del diseño. La ciudad y el nombre son provisionales, y los botones de la cabecera y los accesos todavía no tienen acciones conectadas. Las otras cuatro vistas mantienen su título identificador. La navegación usa `go_router` e iconos de HugeIcons; el contenedor de vidrio del menú es reutilizable. El layout de autenticación, la comprobación de sesión móvil y el contenido de producto están pendientes. El correo real, mapa, chat, Socket.IO, BGG, notificaciones, reputación y moderación siguen pendientes; Mis amigos es únicamente un acceso visual y no incorpora relaciones de amistad.

El código Flutter está organizado por funcionalidades: `app` compone el arranque, el router y el shell principal; `core` reúne los componentes compartidos; `features` contiene las pantallas y widgets de cada módulo. La arquitectura y las convenciones de nombres están documentadas en las [reglas del frontend](.github/frontend/rules.md#arquitectura-organización-y-nombres).

Las fuentes Jeko entregadas para la identidad visual ya están registradas como recursos locales del frontend. Su uso está documentado en la [guía del frontend](frontend/README.md); los títulos provisionales usan Jeko, sin un tema global.

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
