# MeepleWorld: índice de instrucciones técnicas

Las reglas técnicas y definiciones antes reunidas en este archivo y en `AGENTS.md` se organizan por proyecto. Última actualización documental: 4 de octubre de 2026.

| Archivo | Contenido y ámbito |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Punto de entrada, lectura previa y reglas comunes de trabajo y entrega para todo el repositorio. |
| [Backend: rules.md](backend/rules.md) | Arquitectura NestJS/MySQL, API REST y Socket.IO, modelo de datos, invariantes, autenticación, integraciones, configuración, migraciones y verificación. |
| [Frontend: rules.md](frontend/rules.md) | Alcance visual autorizado, Flutter Android/iOS, estructura, layout y navegación, integración móvil prevista, sesiones, configuración y verificación en dispositivos. |
| [Definición del producto](../documentation/idea_design.md) | Alcance, permisos, recorridos y reglas de negocio de MeepleWorld. |
| [README](../README.md) | Presentación y estado general del proyecto. |

Leer las reglas del área afectada antes de modificar el proyecto y ambas cuando el cambio afecte contratos o integración. Mantener los detalles en su archivo `rules.md` y las reglas comunes en `AGENTS.md`; este índice conserva los enlaces de consulta existentes.

Las instrucciones distinguen lo implementado de lo previsto y simulado. Consultar [backend/README.md](../backend/README.md) y [frontend/README.md](../frontend/README.md) para configurar y arrancar cada proyecto, e inspeccionar siempre el estado real antes de implementar.
