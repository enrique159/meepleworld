# Instrucciones para agentes de MeepleWorld

Estas instrucciones se aplican a todo el repositorio. Este archivo es el punto de entrada; la guía técnica detallada se mantiene en `.github/agent_instructions.md` y las reglas de producto en `documentation/idea_design.md`.

## Lectura previa

Antes de modificar el proyecto, leer:

1. [Definición del producto](documentation/idea_design.md): alcance, recorridos, permisos y reglas de negocio.
2. [Guía técnica](.github/agent_instructions.md): arquitectura, versiones, datos, integraciones y verificación.
3. [README](README.md): presentación y estado general del proyecto.

Inspeccionar el estado real del repositorio antes de ejecutar comandos. El frontend es un proyecto Flutter vacío para Android e iOS, pendiente de identidad visual, pantallas e integración con la API. El backend NestJS conserva sus entidades y endpoints iniciales para cuentas, perfiles, catálogo/biblioteca, mesas y anuncios; la guía técnica distingue lo implementado de lo previsto.

## Decisiones del proyecto

- Mantener el nombre **MeepleWorld** y la documentación en español.
- Mantener los proyectos `frontend` y `backend` independientes: Flutter con `pubspec.yaml` y `pubspec.lock`; NestJS con `package.json` y `package-lock.json`. No usar npm workspaces ni un `package.json` en la raíz.
- Frontend: Flutter y Dart, canal estable, exclusivamente para Android e iOS. La web queda fuera del alcance.
- Verificar Android en un dispositivo físico conectado por USB; no usar emuladores Android.
- Mantener el frontend vacío hasta que el responsable termine la identidad visual y el diseño de pantallas; no adelantar componentes, estilos, temas ni animaciones de producto.
- Backend: NestJS 12 con ESM, TypeORM, `mysql2` y MySQL 8.4 LTS; API REST bajo `/api/v1`. Socket.IO para chat queda pendiente.
- No fijar versiones de Node.js ni npm en la raíz del repositorio; cada proyecto se ejecuta desde su propio directorio. Usar MySQL local, sin Docker.
- Lanzamiento inicial en México, en español y con importes en MXN. Los pagos y las entregas se acuerdan entre usuarios.

Las instrucciones explícitas del usuario tienen prioridad sobre estas decisiones. Cualquier cambio acordado de arquitectura o producto debe reflejarse en la documentación correspondiente.

## Reglas de implementación

- Implementar el alcance solicitado, conservando las reglas detalladas de la definición del producto y la guía técnica.
- Mantener la autorización y las reglas de negocio en el backend, incluyendo HTTP, Socket.IO y tareas de fondo.
- Confirmar lugares con transacciones; las solicitudes y ofertas parciales pendientes no reservan cupo. Una aprobación parcial requiere aceptación del titular y nueva comprobación de disponibilidad.
- Proteger direcciones y coordenadas privadas en respuestas, mapas, eventos, notificaciones y logs. Revocar permisos cuando cambia la participación.
- Habilitar reputación solo para experiencias elegibles: mesas finalizadas y operaciones de marketplace confirmadas por ambas partes.
- Usar migraciones versionadas y mantener `synchronize: false`. Separar las bases de desarrollo y pruebas.
- Proteger credenciales y datos personales. Consumir BGG desde el backend y utilizar datos ficticios y adaptadores controlados en pruebas.
- Mantener la guía técnica como referencia detallada. Al cambiar una decisión resumida aquí, actualizar también este archivo.

## Verificación y entrega

Para cambios documentales, revisar coherencia, formato y enlaces. Cuando existan las aplicaciones, ejecutar las comprobaciones de tipos, lint, pruebas y compilación que correspondan al cambio; verificar funcionalidades móviles en sus plataformas.

Actualizar documentación y contratos cuando cambien comportamiento, configuración o pasos de desarrollo. Al entregar, indicar qué cambió, cómo se verificó y qué queda pendiente. Distinguir siempre entre funcionalidades previstas, implementadas y simuladas.
