# MeepleWorld: reglas del frontend

Estado: Flutter Android/iOS con layout principal y cinco vistas provisionales, layout de acceso básico y autenticación conectada a la API. Contenido de producto e integraciones restantes pendientes. Última actualización documental: 7 de octubre de 2026.

Estas reglas se aplican a `frontend/`, incluidos sus proyectos nativos Android e iOS. Leer también [AGENTS.md](../../AGENTS.md), la [definición del producto](../../documentation/idea_design.md) y el [README del frontend](../../frontend/README.md). Para cambios de contratos o integración, consultar las [reglas del backend](../backend/rules.md). Inspeccionar el estado real antes de implementar: las capacidades previstas no implican que ya existan.

## Decisiones y alcance autorizado

| Área | Base acordada |
| --- | --- |
| Proyecto | Flutter independiente con `pubspec.yaml` y `pubspec.lock`; ejecutar Flutter desde `frontend/`. Sin npm ni paquete raíz. |
| Lenguaje y SDK | Dart y Flutter del canal estable; el requisito de Dart se declara en `frontend/pubspec.yaml`. |
| Plataformas | Exclusivamente Android e iOS; web y aplicaciones de escritorio fuera del alcance. |
| Navegación | `go_router` 18.0.2, con `ShellRoute` independientes para los layouts principal y de autenticación; redirección según sesión. |
| Arquitectura | Organización por funcionalidad (`features`), composición en `app` y elementos compartidos en `core`, implementada para los componentes actuales; presentación con MVVM al incorporar estado y servicios. |
| Iconos | HugeIcons mediante `hugeicons`; 1.2.0 en el lockfile. |
| Mapas previstos | Mapbox para mapa y visualización de mesas; listado complementario. Paquetes aún no incorporados. |
| Pruebas previstas | Sin suite Dart. En la entrega de autenticación, el responsable pidió no crear ni ejecutar pruebas de frontend; comprobará manualmente los recorridos. |
| Depuración Android | Teléfono físico: primero USB; si no hay uno, el ya configurado por Wi-Fi. No usar emuladores Android. |

Implementar únicamente el alcance autorizado: layout principal y sus componentes aprobados, cinco vistas provisionales e icono Android; además, un layout de autenticación con pantalla inicial y opciones separadas para Crear cuenta e Iniciar sesión, más formularios básicos conectados a la API. La pantalla inicial conserva el logo, título y descripción aprobados, con Crear cuenta primero y los botones alineados al fondo. Crear cuenta aplica el diseño aprobado del 7 de octubre: nombre visible encima del correo, contraseña de 12–128 caracteres y confirmación, con campos de vidrio y botón «Siguiente» que completa el registro existente. La confirmación solo se valida en el cliente; el servidor sigue generando el username. Iniciar sesión mantiene el estilo estándar sin diseño definitivo. Mi Perfil añade un cierre de sesión básico. Inicio recibe el nombre visible real de la cuenta; «La Paz» sigue siendo provisional. Las acciones de cabecera y tarjetas y el contenido de producto siguen pendientes. Mis amigos no autoriza relaciones de amistad. No añadir diseños, temas globales ni animaciones de producto; el tema Material básico se limita al layout auth.

Autenticación usa `ChangeNotifier`/`ListenableBuilder` de Flutter para MVVM e inyección por constructores; no incorpora un gestor de estado externo. `http` 1.6.0 aporta el transporte y `flutter_secure_storage` 11.2.0 el almacenamiento seguro; `flutter_localizations` del SDK localiza los controles a `es_MX`. No introducir otro gestor de paquetes o framework sin actualizar la decisión. Mantener MeepleWorld y la interfaz en español, con México y MXN. Los pagos se acuerdan entre usuarios.

## Arquitectura, organización y nombres

### Organización del proyecto

MeepleWorld organiza el código primero por funcionalidad y después por responsabilidad. `app` compone la aplicación, `core` contiene piezas compartidas y `features` mantiene juntas las pantallas, sus componentes, su estado y su acceso a datos. Esto permite trabajar en Inicio, Mesas o Marketplace sin repartir sus archivos entre carpetas globales.

La presentación seguirá MVVM cuando incorpore comportamiento: las pantallas y widgets representan la interfaz, los modelos de vista gestionan su estado y los repositorios exponen los datos. La separación entre interfaz y datos sigue las [recomendaciones de arquitectura de Flutter](https://docs.flutter.dev/app-architecture/recommendations). La distribución concreta de carpetas y los sufijos de archivos que siguen son convenciones de este repositorio.

```text
frontend/
├── pubspec.yaml
├── pubspec.lock
├── analysis_options.yaml
├── assets/
│   ├── custom/
│   ├── fonts/
│   └── images/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── meeple_world_app.dart
│   │   ├── router/
│   │   │   ├── app_router.dart
│   │   │   └── app_routes.dart
│   │   └── shell/
│   │       ├── main_shell.dart
│   │       ├── auth_shell.dart
│   │       ├── navigation/
│   │       │   └── main_section.dart
│   │       └── widgets/
│   │           ├── main_background.dart
│   │           └── main_bottom_navigation_bar.dart
│   ├── core/
│   │   ├── network/            # configuración, cliente HTTP y errores
│   │   ├── storage/            # renovación en almacenamiento seguro
│   │   └── ui/
│   │       ├── styles/
│   │       │   └── app_colors.dart
│   │       └── widgets/
│   │           ├── glass_button.dart
│   │           ├── glass_container.dart
│   │           ├── glass_text_input.dart
│   │           └── section_placeholder.dart
│   └── features/
│       ├── auth/
│       │   ├── data/
│       │   │   ├── models/
│       │   │   ├── repositories/
│       │   │   └── services/
│       │   └── presentation/
│       │       ├── screens/
│       │       ├── view_models/
│       │       └── widgets/
│       ├── home/
│       │   └── presentation/
│       │       ├── screens/
│       │       │   └── home_screen.dart
│       │       └── widgets/
│       │           ├── home_header.dart
│       │           ├── home_quick_actions.dart
│       │           └── home_quick_action_card.dart
│       ├── tables/
│       │   └── presentation/screens/tables_screen.dart
│       ├── marketplace/
│       │   └── presentation/screens/marketplace_screen.dart
│       ├── messages/
│       │   └── presentation/screens/messages_screen.dart
│       └── profile/
│           └── presentation/screens/profile_screen.dart
├── test/                    # cuando exista una suite
├── integration_test/        # cuando existan pruebas de recorridos
├── android/
└── ios/
```

Este árbol describe la organización implementada de los componentes existentes; las carpetas de pruebas se incorporarán cuando haya una suite. Crear únicamente directorios con código real. Las futuras funcionalidades, como notificaciones, tendrán su propio módulo cuando se implemente su diseño; una funcionalidad puede incluir varias pantallas.

Los proyectos nativos permanecen dentro del frontend. Android e iOS están generados; su compilación y ejecución requieren las herramientas de cada plataforma. El identificador de aplicación de desarrollo es `com.meepleworld.app`; firma y publicación en tiendas están pendientes. Los modelos Dart se basarán en contratos independientes del ORM y del código del servidor; las dependencias y los recursos permanecerán en `frontend/`.

### Responsabilidades y dependencias

| Área | Responsabilidad |
| --- | --- |
| `main.dart` | Punto de entrada mínimo; delega el arranque y la composición. |
| `app/` | Widget raíz, router, composición de dependencias, ciclo de vida global y shell de navegación. |
| `app/shell/` | Estructura común de las rutas: zonas seguras, fondo, menú inferior y selección de sección. |
| `core/ui/` | Componentes visuales compartidos y sus estilos autorizados, independientes de una funcionalidad. |
| `core/network/`, `core/storage/` | Infraestructura transversal de HTTP y almacenamiento seguro ya utilizada por auth. Los servicios con endpoints de una funcionalidad pertenecen a esa funcionalidad. |
| `features/<feature>/presentation/screens/` | Widgets raíz que abre el router; componen la pantalla y conectan sus eventos. |
| `features/<feature>/presentation/widgets/` | Componentes propios de la funcionalidad, como `HomeHeader`; reciben datos y callbacks. |
| `features/<feature>/presentation/view_models/` | Estado de pantalla, coordinación de acciones y transformación de datos para la interfaz cuando exista ese comportamiento. |
| `features/<feature>/presentation/states/` | Estados de interfaz inmutables cuando su tamaño o complejidad justifique separarlos del modelo de vista. |
| `features/<feature>/data/` | Modelos, repositorios y servicios de la funcionalidad cuando haya acceso a datos. |
| `features/<feature>/domain/use_cases/` | Casos de uso opcionales para reglas complejas o coordinación reutilizada entre modelos de vista. |

Reglas de dependencia:

- `app` puede importar `features` y `core`; concentra la creación e inyección de dependencias mediante constructores. Las bibliotecas de estado o inyección siguen pendientes de elección.
- `core` mantiene independencia de `app` y `features`. Un componente compartido recibe valores y callbacks, sin conocer rutas, repositorios o tipos de una pantalla concreta.
- Las pantallas y widgets delegan las acciones de producto en su modelo de vista. El acceso HTTP, almacenamiento, credenciales y reglas de negocio permanecen fuera de sus métodos `build`.
- Los modelos de vista consumen contratos de repositorio y, cuando sean necesarios, casos de uso. La implementación del repositorio usa servicios de datos y recibe sus dependencias por constructor.
- El código compartido entre funcionalidades se expone mediante contratos explícitos. Una funcionalidad no importa pantallas, widgets ni modelos de vista internos de otra; la navegación entre ellas se coordina en `app`.
- Una pieza se incorpora a `core` por su responsabilidad transversal o reutilización real. `HomeHeader` pertenece a Inicio; `GlassButton` y `GlassContainer` pertenecen a la interfaz compartida.
- Los casos de uso son opcionales. Una pantalla puramente visual, como las actuales, puede componerse con widgets y callbacks sin crear modelos de vista, repositorios ni estados vacíos.

El acceso a datos usa `data/models/` para modelos inmutables, `data/repositories/` para contratos e implementaciones y `data/services/` para adaptadores de API. Incorporar DTO separados solo cuando el formato lo justifique; en autenticación, `AuthApiService` traduce JSON a `AuthUser`, `AuthSession` y `RegistrationResult`. Los modelos de vista reciben modelos de aplicación; los casos de uso seguirán siendo opcionales. Esta separación ya existe para auth; las demás funcionalidades aún no consumen la API.

### Convenciones de nombres y archivos

Usar inglés para nombres de código y carpetas, conservando español en la interfaz y la documentación. Seguir [Effective Dart](https://dart.dev/effective-dart/style): archivos y carpetas en `snake_case`, clases y enums en `UpperCamelCase`, miembros y variables en `lowerCamelCase`. Elegir nombres que expresen la responsabilidad y evitar abreviaturas ambiguas.

| Elemento | Archivo de ejemplo | Tipo principal |
| --- | --- | --- |
| Pantalla abierta por una ruta | `home_screen.dart` | `HomeScreen` |
| Componente propio de una funcionalidad | `home_header.dart` | `HomeHeader` |
| Componente visual compartido | `glass_button.dart` | `GlassButton` |
| Composición global de las rutas | `main_shell.dart` | `MainShell` |
| Modelo de vista | `home_view_model.dart` | `HomeViewModel` |
| Estado de interfaz | `home_ui_state.dart` | `HomeUiState` |
| Modelo de aplicación | `game_table.dart` | `GameTable` |
| DTO de API | `game_table_dto.dart` | `GameTableDto` |
| Contrato de repositorio | `table_repository.dart` | `TableRepository` |
| Implementación remota | `remote_table_repository.dart` | `RemoteTableRepository` |
| Adaptador de endpoints | `table_api_service.dart` | `TableApiService` |
| Caso de uso, cuando sea necesario | `request_table_seats_use_case.dart` | `RequestTableSeatsUseCase` |
| Prueba | `home_screen_test.dart` | Grupos y casos que describen comportamiento |

- Usar el sufijo `Screen` para las pantallas de rutas y reservar `widgets/` para sus componentes. Las cinco pantallas existentes siguen esta convención: `HomeScreen`, `TablesScreen`, `MarketplaceScreen`, `MessagesScreen` y `ProfileScreen`.
- El nombre del archivo corresponde al tipo público principal. Mantener un tipo principal por archivo; los detalles pequeños que solo utiliza ese componente pueden permanecer privados en él.
- Los widgets usan nombres concretos como `HomeHeader`, `TableCard` o `GlassButton`. El sufijo genérico `Widget` no aporta información cuando ya se conoce la función.
- Mantener componentes locales junto a su funcionalidad. Organizar familias de componentes en subcarpetas cuando su cantidad lo justifique; evitar archivos generales como `widgets.dart`, `helpers.dart` o `utils.dart` que mezclen responsabilidades.
- Usar imports `package:meepleworld/...` entre módulos (`app`, `core` y funcionalidades) e imports relativos para archivos dentro de un mismo módulo. Mantenerlos explícitos y evitar exportaciones globales que oculten dependencias.
- Las pruebas reflejan las rutas de `lib/` bajo `test/`, con sufijo `_test.dart`; los recorridos móviles van en `integration_test/`. Cubrir comportamiento real y proporcional al cambio.
- Los nuevos recursos propios usan nombres descriptivos en `snake_case`, como `location_filled.svg`. Conservar las rutas de los recursos entregados, incluidos los archivos tipográficos, hasta una migración explícita que actualice su registro y referencias.

### Estado actual y mantenimiento

La organización incluye `features/auth` con modelos, servicio API, contrato/repositorio y modelos de vista; `app` compone el cliente HTTP, almacenamiento, sesión y router. `core/network` y `core/storage` reúnen infraestructura transversal. Las cinco funcionalidades visuales conservan sus pantallas y widgets.

La presentación de producto sigue provisional. Auth implementa comportamiento mediante MVVM; Crear cuenta usa campos de vidrio y el formulario de Iniciar sesión conserva controles Material básicos. No hay casos de uso ni suite de frontend: el responsable hará la comprobación manual de esta entrega.

Todo cambio de organización deberá actualizar archivos, clases, imports, router y documentación en el mismo cambio, conservando las decisiones de diseño y comportamiento. Revisar formato, análisis, compilación y navegación móvil según las comprobaciones del proyecto. Los nuevos componentes seguirán las responsabilidades y convenciones de este apartado.

## Layout, navegación y reglas de implementación

La columna de acciones de `AuthHomeScreen` alinea sus botones al final del espacio disponible en la ruta `/auth`, con 24 píxeles lógicos de margen inferior dentro de la zona segura.

Las cinco tarjetas de Inicio tienen autorizado un efecto de presión con escala `0.95`, transición de 150 ms y curva `easeOutCubic`. `HomeQuickActionCard` mantiene únicamente el estado visual de presión: al soltar vuelve a escala 1 después de completar el efecto de un toque rápido; cancelar el gesto restaura la escala y desmontar el widget cancela el temporizador. La animación respeta la opción del sistema de desactivar animaciones y conserva el área táctil y el layout del grid. Este feedback visual está disponible aunque los callbacks de producto sigan pendientes; no conecta flujos ni modifica su semántica de acción deshabilitada.

El color predeterminado de todos los textos e iconos de MeepleWorld es `#343136`. `AppColors.foreground`, en `lib/core/ui/styles/app_colors.dart`, centraliza el valor; `MeepleWorldApp` lo aplica mediante `WidgetsApp.router.textStyle` e `IconTheme`. Los textos, los iconos estándar de Flutter y HugeIcons heredan este color. No introducir colores particulares sin una excepción del diseño; Crear mesa y el encabezado/botones de autenticación conservan sus textos blancos, el botón Crear cuenta usa un degradado horizontal `#9D40E1` → `#5F4BD1`, y el SVG original de ubicación conserva su degradado especificado. El saludo, los títulos provisionales y el menú inferior utilizan ahora el color común. `AppColors.authGradientStart`, `authAccent` e `inputPlaceholder` centralizan las excepciones aprobadas: degradado `#9D40E1` → `#5F4BD1`, iconos prepend `#5F4BD1` y placeholders `#B6A1D1`.

El frontend arranca con `WidgetsApp.router`, el color global heredado y localización `es_MX`. `go_router` mantiene dos `ShellRoute`: `MainShell` para `/`, `/mesas`, `/marketplace`, `/mensajes` y `/mi-perfil`; `AuthShell` para `/auth`, `/auth/iniciar-sesion`, `/auth/crear-cuenta` y `/auth/sesion`. Las vistas principales solo se abren con sesión comprobada; al arrancar se intenta restaurar la renovación y, sin sesión, se abre la pantalla inicial de autenticación. Esta ofrece Crear cuenta primero, con degradado horizontal, e Iniciar sesión en un `GlassButton`; ambos abren formularios en rutas propias y quedan alineados al fondo de `/auth`. `AuthShell` usa el fondo degradado aprobado, zonas seguras, scroll para teclado y ancho máximo de 480, sin menú principal. La ruta `/auth/crear-cuenta` activa `formLayout`: reutiliza el fondo radial claro de `MainBackground`, configura barras del sistema con iconos oscuros y sustituye el branding por el contenido propio. Usa márgenes laterales de 34, superior de 16 e inferior de 24 dentro de la zona segura; el contenido tiene altura mínima del viewport y scroll para teclado y texto ampliado. El botón de la bienvenida usa `context.push` para conservar el regreso; la flecha vuelve a la página anterior o a `/auth` si no hay una. Los controles estándar y el tema local conservan `AppColors.foreground`; el diseño definitivo de Iniciar sesión sigue pendiente. El router, el cliente HTTP, la sesión y los temporizadores se liberan al desmontar la app.

`MainShell`, en `lib/app/shell/main_shell.dart`, configura las barras del sistema con iconos oscuros, reserva las zonas seguras y deja espacio para el menú inferior fijo. `MainBackground` ocupa toda la superficie con un `RadialGradient`: `#DFC6FE` en 0% y `#F3E6EF` en 100%, opacos. Su centro está en la esquina superior derecha; una transformación orienta el eje mayor hacia la inferior izquierda y deja el menor a la mitad del mayor, aproximando la referencia recibida. La geometría se recalcula con los límites de la superficie.

`MainBottomNavigationBar`, en `lib/app/shell/widgets/main_bottom_navigation_bar.dart`, muestra cinco iconos de HugeIcons: `strokeRoundedHome02`, `strokeRoundedTableRound`, `strokeRoundedStore01`, `strokeRoundedMessageSquare` y `strokeRoundedUser`. Un círculo blanco resalta la ruta activa; cada botón tiene etiqueta semántica en español y estado de selección. El menú se mantiene abajo con márgenes, dentro de la zona segura; cambiar de sección usa `context.go` y no acumula páginas de pestañas ni incorpora animaciones. `MainSection`, en `lib/app/shell/navigation/main_section.dart`, centraliza las etiquetas, rutas e iconos y deriva la selección de la ubicación del router.

`GlassContainer`, en `lib/core/ui/widgets/glass_container.dart`, encapsula blanco al 30%, `BackdropFilter` con `ImageFilter.blur(sigmaX: 8, sigmaY: 8)` y borde interior de 1 píxel lógico. Un `CustomPainter` dibuja el degradado solo en el borde, desde la esquina superior izquierda a la inferior derecha. `GlassBorderStyle`, en `lib/core/ui/styles/glass_border_style.dart`, define `lightBackground` (`#F1E7FC` → `#DFC7FE`, predeterminado) y `coloredBackground` (`#F1E7FC` → `#7676C3`). `GlassContainer` y `GlassButton` aceptan `borderStyle` para elegir la variante; «Ya tengo una cuenta» usa `coloredBackground`. El painter se actualiza al cambiar el estilo. El contenedor también acepta contenido, radio, padding y `backgroundColor` (blanco al 30% por defecto); `borderStyle: null` elimina el painter del borde; el menú lo usa con forma de cápsula. `GlassButton`, en `lib/core/ui/widgets/glass_button.dart`, reutiliza esa superficie con altura predeterminada de 56 (la pantalla inicial de auth la adapta a 72) y etiquetas semánticas; sus acciones son opcionales y accesibilidad lo identifica como deshabilitado cuando no tiene una acción conectada.

`GlassTextInput`, en `lib/core/ui/widgets/glass_text_input.dart`, reutiliza `GlassContainer` con blanco al 50%, blur de sigma 8, cápsula sin borde y altura mínima de 62 píxeles lógicos. Admite widgets `prependIcon` y `appendIcon`; los prepend heredan `AppColors.authAccent` y los append el color global. El placeholder usa `AppColors.inputPlaceholder`, Jeko Regular a 16, y el texto escrito conserva el color común. Participa en `Form`, acepta controlador/validador/autofill y muestra errores accesibles fuera de la cápsula. Permitir hasta dos líneas de placeholder y no fijar una altura que recorte texto ampliado.

`SignUpScreen` muestra «Crea tu cuenta» con Jeko Semi Bold a 28, descripción con Jeko Regular a 16 y botón de regreso de 52. Los campos de nombre, correo, contraseña y confirmación se agrupan abajo con separaciones de 20; los dos ojos alternan cada contraseña de forma independiente. «Siguiente» usa `AuthPrimaryButton`, que comparte el degradado con la bienvenida, altura mínima de 72 y texto blanco. La validación rechaza contraseñas distintas antes de llamar al modelo de vista; conservar datos ante errores y bloquear acciones mientras se registra. El nombre es `displayName`, no un username elegido por el usuario.

`HomeHeader`, en `lib/features/home/presentation/widgets/home_header.dart`, aparece únicamente en Inicio, con márgenes laterales de 24 y superior de 16 dentro de la zona segura. Muestra una cápsula con «La Paz» con el archivo Jeko Semi Bold a 18, y el SVG original `assets/custom/location_filled.svg` a 18, conservando su degradado. A la derecha hay dos botones circulares de 56 con `strokeRoundedSearch01` y `strokeRoundedNotification01`, a 24 y trazo 1.7. El texto y los HugeIcons usan `#343136`; el texto de ciudad se adapta al ancho con elipsis. El SVG se registra en `pubspec.yaml` y se carga con `flutter_svg` 2.3.0, ahora dependencia directa (ya era transitiva de HugeIcons). «La Paz» es un dato visual provisional: no se obtiene del dispositivo ni de la API. Los tres botones aún no tienen acciones; no añadir búsquedas, selección de ciudad, permisos ni notificaciones sin su correspondiente diseño. La cabecera, el saludo, los accesos visuales y las cinco vistas provisionales están autorizados; el contenido de producto y los demás diseños siguen pendientes.

`HomeScreen` muestra el nombre visible de la sesión recibido mediante `userName`, con Jeko Semi Bold a 28 y semántica de encabezado. Usa `SingleChildScrollView`, conserva la cabecera y deja fijo el menú. `HomeQuickActions` mantiene las dos columnas con separación de 12 y márgenes laterales de 32; Crear mesa ocupa dos filas y los otros cuatro accesos conservan sus posiciones y adaptación al texto.

`HomeQuickActionCard`, junto al grid, reutiliza radio de 28, padding de 9 (antes 16), etiquetas Jeko Regular a 18 con peso explícito `FontWeight.w400` e iconos a 24 con trazo 1.7, dentro de círculos de 48 con blanco al 20%. Usa `strokeRoundedMapsLocation02`, `strokeRoundedDice`, `strokeRoundedAiCoEditing` y `strokeRoundedStore01`, con fondos `#EEB85F`, `#8FB2EC`, `#EC8DBD` y `#9590ED`. Crear mesa usa `strokeRoundedPlus`, texto Jeko Regular blanco a 22 con peso 400 y `assets/images/create_table_background.jpg` con `BoxFit.cover` y degradado morado transparente arriba y opaco abajo. La fotografía fue recreada con ImageGen desde la referencia entregada en 1024 × 1536 (2:3); su [procedencia y prompt](../../frontend/assets/images/README.md) se conservan junto al recurso registrado en `pubspec.yaml`. Las cinco tarjetas reciben callbacks opcionales, no tienen acciones conectadas y se anuncian como botones deshabilitados sin atenuar el diseño. No añadir rutas, mapa, biblioteca, publicación ni amistades a partir de estos accesos visuales.

Las fuentes entregadas por el responsable están en `frontend/assets/fonts/` y registradas en `frontend/pubspec.yaml`: `Jeko` con pesos 100–900 normales y cursivos, y `JekoItalicVariable` como fuente fija cursiva independiente, porque el archivo no contiene ejes variables. Los títulos provisionales de las otras cuatro pantallas usan Jeko con peso 600 y tamaño de 24 píxeles lógicos, centrados en el área de contenido mediante `SectionPlaceholder`; el estilo global de primer plano se define en `AppColors` y en la raíz de la aplicación. Los ejemplos de uso y el registro están documentados en [frontend/README.md](../../frontend/README.md).

La cabecera y el saludo usan el alias `JekoSemiBold`, registrado únicamente con `Jeko Semi Bold.ttf` y peso 600. Los archivos Regular, Medium, Semi Bold y Bold inspeccionados tienen peso interno 400; el alias garantiza el archivo Semi Bold sin cambiar el registro general ni los títulos de las otras vistas.

Las cinco tarjetas usan el alias `JekoRegular`, registrado únicamente con `Jeko Regular.ttf` y peso 400, para asegurar el archivo solicitado. La altura corta toma el máximo entre el 60% del ancho y el contenido medido (padding de 9 por lado, círculo de 48, separación de 6 y etiqueta); Crear mesa conserva la altura de dos filas más su separación. La medición admite un ancho inicial de cero durante el arranque móvil.

El backend inicial está implementado en `backend/` con autenticación y recuperación de acceso, perfiles, catálogo/biblioteca, descubrimiento y publicación de mesas, participaciones, ubicación privada y anuncios. El contrato REST se mantiene en [openapi.yaml](../../backend/openapi.yaml). Las cuentas ya reciben un `username` único automático; la API lo entrega en el registro, las sesiones y los perfiles, permite editarlo con `PATCH /users/me` y consultar un perfil exacto con `GET /users/username/:username` (sesión y correo verificado). Al implementar Editar cuenta, mostrarlo separado del nombre visible, aceptar 3–32 letras ASCII/números/guion bajo y presentar el conflicto `409`/`USERNAME_TAKEN` conservando lo escrito. El formulario, la búsqueda y los enlaces compartidos móviles aún no están diseñados ni implementados; el saludo seguirá usando el nombre visible y las relaciones seguirán usando el UUID. El chat, Socket.IO, BGG, amistades, notificaciones, reputación, moderación y mapa siguen pendientes porque no hay contratos implementados para esas funciones.

La regla exige cuenta activa, correo verificado y sesión válida antes de acceder a contenido. El router ya separa auth del layout principal; aún no hay consultas de contenido de producto y la protección de todas las lecturas del backend está pendiente. Si la renovación es inválida, retirar la credencial y el usuario locales y volver a Iniciar sesión. Si hay un error de conexión, ocultar el layout principal y permitir reintentar, conservando la renovación segura. Los enlaces a rutas de producto también pasan por el control de sesión; los enlaces específicos de verificación/recuperación siguen pendientes.

Conservar la separación de presentación, modelos de vista y acceso a servicios ya utilizada en auth. Consumir contratos mediante modelos Dart independientes del ORM. No trasladar JSON, credenciales ni HTTP a los métodos `build`.

Al implementar conexiones y notificaciones, considerar el ciclo de vida móvil: detener listeners al salir, eliminar suscripciones al cerrar sesión y recuperar datos autorizados al reconectar o volver del segundo plano. El transporte en vivo complementará el historial del servidor.

El servidor será la autoridad para cupo, permisos, precios publicados y estados. No calcular confirmaciones definitivas únicamente en el estado del cliente ni mostrar éxito antes de la respuesta. Ante un conflicto, refrescar disponibilidad y explicar la acción necesaria. Evitar duplicar solicitudes mediante botones deshabilitados mientras una operación está en curso y control de reintentos.

El mapa y el listado compartirán filtros y datos de consulta, siempre con sesión válida. Mapbox recibirá únicamente la ubicación permitida por la respuesta del backend. Una mesa privada utilizará el punto aproximado compartido con la comunidad autenticada hasta que el servidor autorice datos exactos. Pedir geolocalización en contexto mediante un adaptador móvil compatible con Flutter; ofrecer siempre selección de ciudad. Los paquetes de mapa y geolocalización aún no están incorporados.

Las aplicaciones móviles respetarán zonas seguras, teclado, navegación de regreso y accesibilidad de Android/iOS. Los formularios y estados tendrán etiquetas semánticas y errores comprensibles. Mostrar fechas en la zona horaria de la mesa, identificarla cuando difiera de la del usuario y formatear dinero como MXN. La adaptación visual se definirá con el diseño del responsable.

La primera versión no tendrá escritura offline ni promesas de sincronización posterior. Mostrar estados de carga, vacío, error y falta de conexión. Recuperar mensajes y notificaciones desde el servidor tras reconectar; no depender exclusivamente de los eventos en vivo.

## Sesiones, integraciones y configuración pendientes

La renovación se guarda con `RefreshTokenStorage` y `flutter_secure_storage` 11.2.0, con cifrado protegido por Keystore en Android y Keychain `unlocked_this_device` en iOS; la clave incluye la URL de API para separar servidores. El acceso permanece en memoria. No almacenar contraseñas ni secretos en preferencias sin cifrar; no registrar tokens. El repositorio persiste cada renovación antes de abrir la sesión; si falla el almacenamiento, intenta revocar la sesión emitida y muestra un error.

Login y refresh devuelven acceso, renovación y sus duraciones en JSON; refresh exige `{ refreshToken }`, sin cookies ni CORS. `AuthSessionViewModel` coordina una sola restauración/renovación, programa la próxima antes del vencimiento y comprueba la sesión al volver del segundo plano. Cerrar sesión exige bearer; si expiró, renovar primero. El cierre elimina la credencial local incluso ante un fallo remoto e informa si no se pudo confirmar la revocación; un fallo del almacenamiento no se presenta como cierre completado. El registro no inicia sesión y la respuesta determina si puede entrar directamente o debe verificar el correo. Desarrollo/test verifican las cuentas nuevas automáticamente; producción conserva confirmación y requiere proveedor real. Las pantallas de verificación y recuperación no se incorporaron.

BGG se consume exclusivamente desde el backend y su token nunca llega a la app. La importación usa la colección pública de juegos poseídos del usuario indicado; no pedir su contraseña BGG ni presentarla como inicio de sesión o prueba de titularidad. Mostrar el logotipo legible **Powered by BGG** enlazado a BGG cuando se presenten sus datos, conforme a su [guía de uso](https://boardgamegeek.com/using_the_xml_api). La aprobación y las credenciales de BGG están pendientes; mantener disponible el registro manual si la integración no está configurada o falla.

Al integrar push, permitir denegar su permiso sin impedir el uso de la app ni retirar los avisos internos. Las vistas previas serán genéricas, sin direcciones ni mensajes privados; abrir un aviso exige comprobar el permiso vigente. Cerrar sesión elimina suscripciones y desvincula el dispositivo de la cuenta. Un fallo de push no deshace una operación confirmada. Los proveedores de producción están pendientes; identificar los adaptadores de desarrollo y pruebas como simulados, sin afirmar que entregaron un mensaje real.

La URL se configura mediante `--dart-define=API_BASE_URL=http://<ip-del-equipo>:3000/api/v1`, sin archivos de secretos del frontend. El valor por defecto es `http://127.0.0.1:3000/api/v1`; para Android físico requiere una redirección ADB explícita o una IP alcanzable. `ApiConfig` exige HTTPS fuera de debug y rechaza credenciales, query y fragmento en la URL. HTTP local solo se habilita en debug: Android mediante su manifest y iOS con `Info-Debug.plist` y descripción del permiso de red local; release/profile conservan ATS. Android declara INTERNET para todos los modos y desactiva backups de credenciales; las tres configuraciones Runner de iOS usan `Runner.entitlements` para Keychain. Cualquier valor compilado es extraíble: no incluir secretos. Ver [configuración y recorrido manual](../../frontend/README.md#autenticación-y-api).

Nunca versionar `.env`, credenciales push, certificados, llaves de firma móvil, contraseñas o tokens. Evitar copiar secretos de backend a Dart, recursos nativos o parámetros de compilación del cliente. La entrega de imágenes de la comunidad requerirá autorización y los recursos privados exigirán además permiso específico; no usar URLs permanentes de acceso anónimo para contenido de MeepleWorld.

## Desarrollo y compilación

Ejecutar Flutter desde `frontend/`. La base móvil se creó con Flutter 3.47.5 del canal estable y Dart 3.13.4; mantener `pubspec.lock` versionado y utilizar las herramientas incluidas en Flutter. No hay servidor web del frontend.

Para Android se necesitan Android Studio, un JDK compatible, SDK Platform 36, Build-Tools, Command-line Tools, NDK y un teléfono físico autorizado. Para depurar el frontend, buscar primero un Google Pixel u otro teléfono por USB; si no hay uno disponible, usar el dispositivo físico que ya tiene depuración por Wi-Fi configurada. No usar emuladores Android. El proyecto usa los valores Android de Flutter: mínimo API 24, compilación/destino 36 y NDK 28.2.13676358 en esta versión. Para iOS se necesitan macOS, Xcode completo con herramientas y licencias configuradas y un simulador o dispositivo; CocoaPods permite incorporar plugins que lo requieran. El proyecto iOS generado declara iOS 15 como mínimo. Ver [instalación de Flutter](https://docs.flutter.dev/install/manual), [configuración Android](https://docs.flutter.dev/platform-integration/android/setup) y [configuración iOS](https://docs.flutter.dev/platform-integration/ios/setup).

Verificar los requisitos de Mapbox y los paquetes elegidos antes de confirmar los destinos mínimos definitivos. La firma y las cuentas de las tiendas están pendientes y deberán configurarse sin incluir secretos en Git. La plantilla Android usa firma de depuración; no representa una configuración de publicación.

Usar `flutter doctor -v` para comprobar la instalación. Generar `ios/` no confirma que Xcode esté instalado ni que iOS compile. Consultar el estado local y las instrucciones de arranque en [frontend/README.md](../../frontend/README.md).

| Comando | Propósito y estado |
| --- | --- |
| `flutter pub get` | Resolver dependencias utilizando `pubspec.lock`. |
| `dart format --output=none --set-exit-if-changed lib` | Comprobar el formato del código Dart. |
| `flutter analyze` | Comprobar tipos y reglas de análisis/lint. |
| `flutter devices` | Listar destinos disponibles; para Android, seleccionar primero un teléfono físico por USB y, si no hay uno, el ya configurado por Wi-Fi. |
| `flutter run -d <id>` | Compilar y ejecutar en el dispositivo móvil seleccionado. |
| `flutter build apk --debug` | Compilar un APK de desarrollo. |
| `flutter build ios --simulator` | Compilar para simulador iOS con Xcode configurado. |
| `flutter test` | Futuro: ejecutar las pruebas cuando existan funcionalidades y suite. |

Los directorios nativos forman parte del frontend; cachés, rutas locales y artefactos de compilación están excluidos de Git mediante sus archivos `.gitignore`. El icono iOS y los recursos de arranque siguen siendo provisionales. El layout principal no necesita una conexión al backend para arrancar.

### Icono oficial de Android

El diseño aprobado está en los tres originales de `frontend/`: `app-icon.png` como referencia de composición, `app-icon-illustration.svg` con degradado vertical `#C790EA` → `#515184` y `app-icon-illustration-monocrome.svg` como silueta blanca con los ojos transparentes. Mantener esos nombres y conservar los originales. El icono normal tiene fondo blanco puro (`#FFFFFF`). No alterar el trazado, los huecos ni los colores al generar recursos.

Android utiliza vectores nativos para primer plano y monocromo, con fondo definido como color. Ambos tienen lienzo de 108 × 108 dp, escala `0.0703125` y traslación `(27.0703125, 28.79296875)`, reproduciendo la composición de referencia en el área visible de 72 × 72 dp; el contenido queda dentro de la zona segura central de 66 dp. Mantener geometría idéntica entre ambas capas y la regla `evenOdd`; el sistema aplica las máscaras. Los recursos `mipmap-anydpi-v26` habilitan el icono adaptativo y `mipmap-anydpi-v33` añaden `<monochrome>` para los colores personalizados en launchers compatibles. El fondo de la apariencia temática lo controla Android y no tiene que ser blanco.

Los PNG `mipmap-*` de 48, 72, 96, 144 y 192 px conservan compatibilidad con API 24–25. La exportación para Google Play está en `frontend/branding/android/google_play_icon.png`: 512 × 512 px, PNG de 32 bits, sRGB, fondo blanco opaco, sin máscara ni sombra exterior. Las fuentes y especificaciones se detallan en el [README del frontend](../../frontend/README.md#icono-oficial-de-android). No añadir dependencias Flutter para recursos que resuelve Android de forma nativa. El icono oficial de iOS sigue pendiente.

## Verificación

Para cambios del frontend, comprobar formato, `flutter analyze`, compilación y ejecución móvil según disponibilidad de herramientas. No hay suite Dart de pruebas; al implementar funcionalidades, cubrir recorridos con efecto real usando datos ficticios y adaptadores controlados, sin depender de servicios reales.

Los siguientes escenarios corresponden a funcionalidades futuras y no acreditan su implementación ni la existencia de una suite:

- Frontend y recorridos: acceso obligatorio antes de ver contenido o abrir enlaces, filtros consistentes, ciudad manual sin geolocalización, aceptación de oferta con error `409`, acceso al chat, ausencia de conexión y push denegado.
- Sesiones: registro guiado por la respuesta del backend, verificación y recuperación, renovación, cierre de sesión y revocación; volver al flujo de acceso y retirar credenciales, datos protegidos, listeners y suscripciones cuando termine la sesión.
- Privacidad: retirar dirección exacta e instrucciones privadas del estado local cuando cambie la participación o se revoque el permiso; no mostrar datos no autorizados en mapas ni notificaciones.
- Biblioteca: importación repetida y fallida, conservación de juegos manuales y presentación de indisponibilidad de BGG usando respuestas controladas.

Registrar por separado análisis estático, APK compilado, ejecución Android y verificación iOS. Para la entrega de autenticación del 6 de octubre, no crear ni ejecutar pruebas de frontend, compilar ni instalar la app: el responsable comprobará los recorridos manualmente. Auth consume registro, login, refresh y logout; el resto de la API sigue sin integración móvil. No afirmar que iOS, correo real ni push funcionan sin comprobarlos.
