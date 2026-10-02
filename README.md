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

El repositorio contiene un frontend Flutter en `frontend/`, con plataformas Android e iOS, layout principal y enrutamiento inicial, y un backend NestJS con entidades y API REST inicial para cuentas, perfiles, catálogo/biblioteca, mesas y anuncios. La integración del cliente móvil con esa API está pendiente.

La obligación de iniciar sesión para todas las consultas ya está definida como regla de producto. El backend inicial aún permite consultas anónimas de perfiles, catálogo, mesas y anuncios; proteger esas rutas y actualizar su contrato OpenAPI sigue pendiente.

La verificación automática al registrar cuentas fuera de producción también está acordada y pendiente de implementación. El registro actual todavía exige confirmar el correo en todos los entornos que admite el backend.

La ruta `/` muestra provisionalmente el layout principal sin contenido, con el fondo radial aprobado (`#DFC6FE` → `#F3E6EF`). La navegación usa `go_router`; el layout de autenticación y la comprobación de sesión móvil están pendientes. La identidad visual y las demás pantallas siguen en preparación por el responsable del producto. El correo real, mapa, chat, Socket.IO, BGG, notificaciones, reputación y moderación siguen pendientes.

Las fuentes Jeko entregadas para la identidad visual ya están registradas como recursos locales del frontend. Su uso está documentado en la [guía del frontend](frontend/README.md); la aplicación aún no las aplica a pantallas ni a un tema global.

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
- [Guía técnica e instrucciones para agentes](.github/agent_instructions.md).
- [Guía de instalación y arranque del frontend](frontend/README.md).
