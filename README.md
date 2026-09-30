# MeepleWorld

MeepleWorld es una plataforma en desarrollo para personas que disfrutan los juegos de mesa y quieren encontrar con quién jugar, descubrir nuevos juegos y ampliar su círculo de amigos.

Su propuesta principal son las **mesas**: encuentros que una persona organiza en su ciudad y publica para que otros puedan asistir. El anfitrión indica cuándo se juega, qué juegos propone, cuántos lugares ofrece y qué amenidades estarán disponibles. Cada mesa puede ser abierta o requerir aprobación, y puede tener una cuota opcional acordada con el anfitrión.

## Qué podrás hacer

- Encontrar mesas cercanas en un mapa o en un listado.
- Organizar encuentros y solicitar lugares para ti y tus acompañantes.
- Registrar tu biblioteca de juegos manualmente o importar tu colección pública de BoardGameGeek (BGG).
- Publicar juegos en venta o búsquedas de juegos que quieras conseguir.
- Conversar con vendedores y compradores, y coordinarte con los asistentes de una mesa.
- Consultar la reputación de otros usuarios y reportar problemas de convivencia.

Los pagos y las entregas se acordarán directamente entre usuarios. El anfitrión elegirá si la dirección de su mesa es pública o se comparte únicamente con asistentes confirmados.

## Disponibilidad prevista

El lanzamiento inicial está pensado para **México**, en **español**, con precios en **pesos mexicanos (MXN)**. MeepleWorld tendrá una aplicación web y aplicaciones para Android e iOS.

## Estado del proyecto

El repositorio contiene el frontend Ionic/Vue con integración a los endpoints disponibles de cuentas, perfiles, catálogo/biblioteca, mesas y anuncios, además de un backend NestJS con entidades y API REST inicial. El correo real, chat, Socket.IO, BGG, notificaciones, reputación, moderación e iOS siguen pendientes.

### Arranque rápido del frontend

Ejecuta el proyecto desde su propio directorio:

```sh
cd frontend
npm install
npm run dev
```

Los comandos de Android y las comprobaciones disponibles están en la [guía del frontend](frontend/README.md). El repositorio no fija versiones de Node.js ni npm ni usa npm workspaces. El backend se ejecuta desde `backend/`; consulta su README para configurar MySQL y arrancarlo.

## Documentación

- [Idea, alcance y reglas del producto](documentation/idea_design.md).
- [Punto de entrada para agentes](AGENTS.md).
- [Guía técnica e instrucciones para agentes](.github/agent_instructions.md).
- [Guía de instalación y arranque del frontend](frontend/README.md).
