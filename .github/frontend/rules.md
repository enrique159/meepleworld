# MeepleWorld: reglas del frontend

Estado: Flutter con layout principal y navegación entre cinco vistas provisionales para Android e iOS; contenido de producto, autenticación e integración con la API pendientes. Última actualización documental: 4 de octubre de 2026.

Estas reglas se aplican a `frontend/`, incluidos sus proyectos nativos Android e iOS. Leer también [AGENTS.md](../../AGENTS.md), la [definición del producto](../../documentation/idea_design.md) y el [README del frontend](../../frontend/README.md). Para cambios de contratos o integración, consultar las [reglas del backend](../backend/rules.md). Inspeccionar el estado real antes de implementar: las capacidades previstas no implican que ya existan.

## Decisiones y alcance autorizado

| Área | Base acordada |
| --- | --- |
| Proyecto | Flutter independiente con `pubspec.yaml` y `pubspec.lock`; ejecutar Flutter desde `frontend/`. Sin npm ni paquete raíz. |
| Lenguaje y SDK | Dart y Flutter del canal estable; el requisito de Dart se declara en `frontend/pubspec.yaml`. |
| Plataformas | Exclusivamente Android e iOS; web y aplicaciones de escritorio fuera del alcance. |
| Navegación | `go_router`, con `ShellRoute` para el layout principal; 18.0.2 en el lockfile. |
| Arquitectura | Organización por funcionalidad (`features`), composición en `app` y elementos compartidos en `core`, implementada para los componentes actuales; presentación con MVVM al incorporar estado y servicios. |
| Iconos | HugeIcons mediante `hugeicons`; 1.2.0 en el lockfile. |
| Mapas previstos | Mapbox para mapa y visualización de mesas; listado complementario. Paquetes aún no incorporados. |
| Pruebas previstas | `flutter_test` e `integration_test` cuando se implementen funcionalidades; no hay suite Dart. |
| Depuración Android | Teléfono físico: primero USB; si no hay uno, el ya configurado por Wi-Fi. No usar emuladores Android. |

Implementar únicamente el diseño autorizado por el responsable: layout principal, fondo radial, menú inferior flotante con HugeIcons, contenedor y botones de vidrio reutilizables, cabecera de Inicio y cinco vistas provisionales con un título identificador (Inicio, Mesas, Marketplace, Mensajes y Mi Perfil). Por ahora `/` abre Inicio con su título y una cabecera con la ciudad provisional «La Paz», búsqueda y notificaciones; sus acciones, el contenido de producto y la sesión siguen pendientes. Las demás rutas muestran únicamente su título y el layout de autenticación queda pendiente. No adelantar contenido de pantallas, otros componentes, estilos, temas ni animaciones de producto.

Todavía no se han elegido paquetes de estado ni integraciones. No introducir otro gestor de paquetes o framework sin actualizar la decisión y la documentación. Mantener el nombre MeepleWorld y la interfaz en español, con lanzamiento inicial en México e importes en MXN. Los pagos y las entregas se acuerdan entre usuarios.

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
│   └── fonts/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── meeple_world_app.dart
│   │   ├── router/
│   │   │   ├── app_router.dart
│   │   │   └── app_routes.dart
│   │   └── shell/
│   │       ├── main_shell.dart
│   │       ├── navigation/
│   │       │   └── main_section.dart
│   │       └── widgets/
│   │           ├── main_background.dart
│   │           └── main_bottom_navigation_bar.dart
│   ├── core/
│   │   └── ui/
│   │       └── widgets/
│   │           ├── glass_button.dart
│   │           ├── glass_container.dart
│   │           └── section_placeholder.dart
│   └── features/
│       ├── home/
│       │   └── presentation/
│       │       ├── screens/
│       │       │   └── home_screen.dart
│       │       └── widgets/
│       │           └── home_header.dart
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

Este árbol describe la organización implementada de los componentes existentes; las carpetas de pruebas se incorporarán cuando haya una suite. Crear únicamente directorios con código real. Las futuras funcionalidades, como autenticación o notificaciones, tendrán su propio módulo cuando se implemente su diseño; una funcionalidad puede incluir varias pantallas.

Los proyectos nativos permanecen dentro del frontend. Android e iOS están generados; su compilación y ejecución requieren las herramientas de cada plataforma. El identificador de aplicación de desarrollo es `com.meepleworld.app`; firma y publicación en tiendas están pendientes. Los modelos Dart se basarán en contratos independientes del ORM y del código del servidor; las dependencias y los recursos permanecerán en `frontend/`.

### Responsabilidades y dependencias

| Área | Responsabilidad |
| --- | --- |
| `main.dart` | Punto de entrada mínimo; delega el arranque y la composición. |
| `app/` | Widget raíz, router, composición de dependencias, ciclo de vida global y shell de navegación. |
| `app/shell/` | Estructura común de las rutas: zonas seguras, fondo, menú inferior y selección de sección. |
| `core/ui/` | Componentes visuales compartidos y sus estilos autorizados, independientes de una funcionalidad. |
| `core/network/`, `core/storage/` | Infraestructura transversal de HTTP y almacenamiento cuando esas integraciones existan. Los servicios con endpoints de una funcionalidad pertenecen a esa funcionalidad. |
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

Cuando se implemente acceso a datos, utilizar `data/models/` para modelos inmutables de la aplicación, `data/repositories/` para contratos e implementaciones y `data/services/` para adaptadores de API o plataforma. Incorporar `data/dtos/` cuando el formato externo necesite su propio modelo y conversión. Los modelos de vista reciben modelos de aplicación; el JSON y los DTO quedan dentro de los adaptadores de datos. Los casos de uso acceden a contratos de repositorio, sin depender de widgets ni de servicios concretos. Estas capas son previstas; hoy el cliente no consume la API.

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

La organización por funcionalidades está implementada para los 17 archivos Dart actuales. `app` compone el router y `MainShell`; `core/ui/widgets/` contiene las piezas compartidas; las cinco funcionalidades tienen sus pantallas y la cabecera de Inicio pertenece a los widgets de `home`. Las anteriores carpetas globales fueron retiradas.

La presentación actual sigue siendo visual y provisional. Los modelos de vista, estados, repositorios, servicios, casos de uso y suite de pruebas se incorporarán cuando exista comportamiento que los necesite; todavía no hay integración con la API ni gestor de estado elegido.

Todo cambio de organización deberá actualizar archivos, clases, imports, router y documentación en el mismo cambio, conservando las decisiones de diseño y comportamiento. Revisar formato, análisis, compilación y navegación móvil según las comprobaciones del proyecto. Los nuevos componentes seguirán las responsabilidades y convenciones de este apartado.

## Layout, navegación y reglas de implementación

El frontend `frontend/` arranca con el nombre MeepleWorld y `WidgetsApp.router`. `lib/app/router/app_router.dart` configura `go_router`: `/` (Inicio), `/mesas`, `/marketplace`, `/mensajes` y `/mi-perfil` pertenecen a una `ShellRoute` cuyo layout es `MainShell`. Las rutas y sus nombres se definen en `lib/app/router/app_routes.dart`; cada una abre su pantalla de `lib/features/<feature>/presentation/screens/` con un título identificador mediante `NoTransitionPage`. El router se conserva durante la vida de la app y se libera al desmontarla. El layout de autenticación se añadirá en otro grupo de rutas. No contiene contenido de producto, estado de negocio, servicios HTTP, temas personalizados ni integraciones.

`MainShell`, en `lib/app/shell/main_shell.dart`, configura las barras del sistema con iconos oscuros, reserva las zonas seguras y deja espacio para el menú inferior fijo. `MainBackground` ocupa toda la superficie con un `RadialGradient`: `#DFC6FE` en 0% y `#F3E6EF` en 100%, opacos. Su centro está en la esquina superior derecha; una transformación orienta el eje mayor hacia la inferior izquierda y deja el menor a la mitad del mayor, aproximando la referencia recibida. La geometría se recalcula con los límites de la superficie.

`MainBottomNavigationBar`, en `lib/app/shell/widgets/main_bottom_navigation_bar.dart`, muestra cinco iconos de HugeIcons: `strokeRoundedHome02`, `strokeRoundedTableRound`, `strokeRoundedStore01`, `strokeRoundedMessageSquare` y `strokeRoundedUser`. Un círculo blanco resalta la ruta activa; cada botón tiene etiqueta semántica en español y estado de selección. El menú se mantiene abajo con márgenes, dentro de la zona segura; cambiar de sección usa `context.go` y no acumula páginas de pestañas ni incorpora animaciones. `MainSection`, en `lib/app/shell/navigation/main_section.dart`, centraliza las etiquetas, rutas e iconos y deriva la selección de la ubicación del router.

`GlassContainer`, en `lib/core/ui/widgets/glass_container.dart`, encapsula blanco al 30%, `BackdropFilter` con `ImageFilter.blur(sigmaX: 8, sigmaY: 8)` y borde interior de 1 píxel lógico. Un `CustomPainter` dibuja el degradado de `#F1E7FC` (superior izquierda) a `#DFC7FE` (inferior derecha) solo en el borde. Acepta contenido, radio y padding para reutilizar el estilo; el menú lo usa con forma de cápsula. `GlassButton`, en `lib/core/ui/widgets/glass_button.dart`, reutiliza esa superficie con altura de 56 y etiquetas semánticas; sus acciones son opcionales y accesibilidad lo identifica como deshabilitado cuando no tiene una acción conectada.

`HomeHeader`, en `lib/features/home/presentation/widgets/home_header.dart`, aparece únicamente en Inicio, con márgenes laterales de 24 y superior de 16 dentro de la zona segura. Muestra una cápsula con «La Paz» con el archivo Jeko Semi Bold a 18, y el SVG original `assets/custom/location_filled.svg` a 18, conservando su degradado. A la derecha hay dos botones circulares de 56 con `strokeRoundedSearch01` y `strokeRoundedNotification01`, a 24 y trazo 1.7. El texto y los HugeIcons usan `#343136`; el texto de ciudad se adapta al ancho con elipsis. El SVG se registra en `pubspec.yaml` y se carga con `flutter_svg` 2.3.0, ahora dependencia directa (ya era transitiva de HugeIcons). «La Paz» es un dato visual provisional: no se obtiene del dispositivo ni de la API. Los tres botones aún no tienen acciones; no añadir búsquedas, selección de ciudad, permisos ni notificaciones sin su correspondiente diseño. Estos componentes y las cinco vistas provisionales con sus títulos están autorizados; el contenido y los demás diseños siguen pendientes.

Las fuentes entregadas por el responsable están en `frontend/assets/fonts/` y registradas en `frontend/pubspec.yaml`: `Jeko` con pesos 100–900 normales y cursivos, y `JekoItalicVariable` como fuente fija cursiva independiente, porque el archivo no contiene ejes variables. Los títulos provisionales usan Jeko con peso 600 y tamaño de 24 píxeles lógicos, centrados en el área de contenido mediante `SectionPlaceholder`; no existe un tema global. Los ejemplos de uso y el registro están documentados en [frontend/README.md](../../frontend/README.md).

La cabecera usa el alias `JekoSemiBold`, registrado únicamente con `Jeko Semi Bold.ttf` y peso 600. Los archivos Regular, Medium, Semi Bold y Bold inspeccionados tienen peso interno 400; el alias garantiza el archivo Semi Bold en la ciudad sin cambiar el registro general ni los títulos de las otras vistas.

El backend inicial está implementado en `backend/` con autenticación y recuperación de acceso, perfiles, catálogo/biblioteca, descubrimiento y publicación de mesas, participaciones, ubicación privada y anuncios. El contrato REST se mantiene en [openapi.yaml](../../backend/openapi.yaml). El chat, Socket.IO, BGG, notificaciones, reputación, moderación y mapa siguen pendientes porque no hay contratos implementados para esas funciones.

La regla de producto exige cuenta activa, correo verificado y sesión válida para entrar a cualquier vista de contenido, incluidas las consultas de mesas, anuncios, catálogo y perfiles. El contenido denominado público solo es visible para usuarios autenticados. La apertura actual de las cinco rutas sin sesión es una presentación provisional autorizada del layout y sus vistas con título; no representa autenticación ni consume contenido de la API. El layout de acceso y los controles de sesión siguen pendientes. Antes de incorporar mesas, anuncios, catálogo, biblioteca, mapa o perfiles, comprobar o restaurar la sesión, también desde enlaces. Sin sesión mostrar únicamente los flujos de registro, acceso, verificación y recuperación. Si la renovación falla por expiración o revocación, volver al flujo de acceso y retirar el estado local de la cuenta y el contenido protegido.

Al comenzar la implementación móvil, separar presentación, estado y acceso a servicios; elegir entonces las dependencias necesarias. Consumir los contratos de la API mediante modelos Dart independientes del ORM. La autenticación móvil y el almacenamiento seguro de credenciales siguen pendientes.

Al implementar conexiones y notificaciones, considerar el ciclo de vida móvil: detener listeners al salir, eliminar suscripciones al cerrar sesión y recuperar datos autorizados al reconectar o volver del segundo plano. El transporte en vivo complementará el historial del servidor.

El servidor será la autoridad para cupo, permisos, precios publicados y estados. No calcular confirmaciones definitivas únicamente en el estado del cliente ni mostrar éxito antes de la respuesta. Ante un conflicto, refrescar disponibilidad y explicar la acción necesaria. Evitar duplicar solicitudes mediante botones deshabilitados mientras una operación está en curso y control de reintentos.

El mapa y el listado compartirán filtros y datos de consulta, siempre con sesión válida. Mapbox recibirá únicamente la ubicación permitida por la respuesta del backend. Una mesa privada utilizará el punto aproximado compartido con la comunidad autenticada hasta que el servidor autorice datos exactos. Pedir geolocalización en contexto mediante un adaptador móvil compatible con Flutter; ofrecer siempre selección de ciudad. Los paquetes de mapa y geolocalización aún no están incorporados.

Las aplicaciones móviles respetarán zonas seguras, teclado, navegación de regreso y accesibilidad de Android/iOS. Los formularios y estados tendrán etiquetas semánticas y errores comprensibles. Mostrar fechas en la zona horaria de la mesa, identificarla cuando difiera de la del usuario y formatear dinero como MXN. La adaptación visual se definirá con el diseño del responsable.

La primera versión no tendrá escritura offline ni promesas de sincronización posterior. Mostrar estados de carga, vacío, error y falta de conexión. Recuperar mensajes y notificaciones desde el servidor tras reconectar; no depender exclusivamente de los eventos en vivo.

## Sesiones, integraciones y configuración pendientes

En móviles, guardar la renovación mediante un adaptador de almacenamiento seguro basado en Keychain/Keystore; no usar preferencias sin cifrar para secretos. Elegir y verificar un paquete Flutter compatible antes de implementar ese adaptador y ajustar el transporte del backend cuando corresponda. Mantener el acceso en memoria y eliminar credenciales al cerrar sesión.

La API actual entrega la renovación mediante cookie HttpOnly; la adaptación del transporte al cliente móvil debe acordarse con el backend. El cliente se guía por la respuesta de registro y no elige ni envía el entorno o el estado de verificación. En producción el correo requiere confirmación; en desarrollo y pruebas el backend deberá verificarlo al crear la cuenta, sin token ni envío de verificación. Esa adaptación sigue pendiente. El registro no crea una sesión: después se debe iniciar sesión. La recuperación conserva su flujo de correo en ambos casos.

BGG se consume exclusivamente desde el backend y su token nunca llega a la app. La importación usa la colección pública de juegos poseídos del usuario indicado; no pedir su contraseña BGG ni presentarla como inicio de sesión o prueba de titularidad. Mostrar el logotipo legible **Powered by BGG** enlazado a BGG cuando se presenten sus datos, conforme a su [guía de uso](https://boardgamegeek.com/using_the_xml_api). La aprobación y las credenciales de BGG están pendientes; mantener disponible el registro manual si la integración no está configurada o falla.

Al integrar push, permitir denegar su permiso sin impedir el uso de la app ni retirar los avisos internos. Las vistas previas serán genéricas, sin direcciones ni mensajes privados; abrir un aviso exige comprobar el permiso vigente. Cerrar sesión elimina suscripciones y desvincula el dispositivo de la cuenta. Un fallo de push no deshace una operación confirmada. Los proveedores de producción están pendientes; identificar los adaptadores de desarrollo y pruebas como simulados, sin afirmar que entregaron un mensaje real.

El frontend no tiene configuración de API ni archivos de entorno. Los nombres del cliente se definirán al implementar sus servicios; cualquier valor incluido en la aplicación debe considerarse extraíble y no contener secretos. Las URLs usadas en dispositivos físicos deberán alcanzar el equipo de desarrollo; `localhost` dentro del dispositivo no apunta al backend del equipo.

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

Los directorios nativos forman parte del frontend; cachés, rutas locales y artefactos de compilación están excluidos de Git mediante sus archivos `.gitignore`. Los iconos y recursos de arranque generados son provisionales y no definen la identidad visual. El layout principal no necesita una conexión al backend para arrancar.

## Verificación

Para cambios del frontend, comprobar formato, `flutter analyze`, compilación y ejecución móvil según disponibilidad de herramientas. No hay suite Dart de pruebas; al implementar funcionalidades, cubrir recorridos con efecto real usando datos ficticios y adaptadores controlados, sin depender de servicios reales.

Los siguientes escenarios corresponden a funcionalidades futuras y no acreditan su implementación ni la existencia de una suite:

- Frontend y recorridos: acceso obligatorio antes de ver contenido o abrir enlaces, filtros consistentes, ciudad manual sin geolocalización, aceptación de oferta con error `409`, acceso al chat, ausencia de conexión y push denegado.
- Sesiones: registro guiado por la respuesta del backend, verificación y recuperación, renovación, cierre de sesión y revocación; volver al flujo de acceso y retirar credenciales, datos protegidos, listeners y suscripciones cuando termine la sesión.
- Privacidad: retirar dirección exacta e instrucciones privadas del estado local cuando cambie la participación o se revoque el permiso; no mostrar datos no autorizados en mapas ni notificaciones.
- Biblioteca: importación repetida y fallida, conservación de juegos manuales y presentación de indisponibilidad de BGG usando respuestas controladas.

Registrar por separado APK compilado, ejecución en dispositivo físico Android (USB o Wi-Fi) y verificación iOS. No afirmar que iOS fue verificado si falta Xcode ni que push funciona sin haber integrado y probado su entrega. El frontend no consume ningún endpoint; las funcionalidades REST existentes siguen en el backend.
