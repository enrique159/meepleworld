# Instrucciones para agentes de MeepleWorld

Estas instrucciones se aplican a todo el repositorio. Este archivo es el punto de entrada; las reglas detalladas se mantienen por proyecto.

## Lectura previa

Antes de modificar el proyecto, inspeccionar el estado real del repositorio y leer:

1. [Definición del producto](documentation/idea_design.md): alcance, recorridos, permisos y reglas de negocio.
2. [README](README.md): presentación y estado general del proyecto.
3. Las reglas del área afectada: [backend](.github/backend/rules.md) o [frontend](.github/frontend/rules.md). Leer ambas cuando el cambio afecte contratos, integración o decisiones compartidas.

El [índice técnico](.github/agent_instructions.md) orienta la consulta; las instrucciones específicas tienen su fuente en los dos archivos `rules.md`.

## Reglas comunes de trabajo

- Mantener el nombre **MeepleWorld** y la documentación en español. Las instrucciones explícitas del usuario tienen prioridad sobre estas reglas.
- En la interfaz, usar `#343136` como color predeterminado de textos e iconos en toda la app, salvo una excepción especificada por el diseño, como el blanco de Crear mesa. Centralizar el valor y heredar el estilo global según las reglas del frontend.
- Mantener `frontend` y `backend` independientes, con sus dependencias y lockfiles en su propio directorio. No usar npm workspaces ni un `package.json` en la raíz; no fijar allí versiones de Node.js ni npm.
- Implementar el alcance solicitado y conservar las decisiones acordadas. Consultar al responsable si una necesidad exige cambiar stack, cupo, privacidad, pagos o alcance; resolver decisiones rutinarias sin pedir aprobación repetida.
- Preferir cambios acotados, migraciones revisables y pruebas proporcionales que cubran comportamiento real. No exigir pruebas que solo reflejen el texto de la documentación. No modificar datos ajenos ni usar servicios reales para pruebas sin autorización aplicable.
- Proteger credenciales y datos personales; no incluir secretos en código, documentación, pruebas, commits ni logs. Usar datos ficticios y configuración de ejemplo.
- Actualizar la definición del producto, las reglas del proyecto afectado y los contratos OpenAPI cuando cambien comportamiento, arquitectura, configuración o pasos de desarrollo. Actualizar este archivo cuando cambie una regla común.

## Verificación y entrega

Para cambios documentales, revisar coherencia, formato y enlaces. Para código, ejecutar las comprobaciones de tipos, lint, pruebas y compilación que correspondan al cambio y estén configuradas; verificar funcionalidades móviles según las reglas del frontend.

Al entregar, indicar qué cambió, cómo se verificó y qué queda pendiente. Distinguir siempre funcionalidades implementadas, previstas y simuladas; no declarar funcional una integración con credenciales ausentes o simuladas.
