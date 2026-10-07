# Frontend de MeepleWorld

Proyecto Flutter exclusivamente para Android e iOS, con layout principal, cinco vistas provisionales y layout de autenticación básico. Registro e inicio de sesión consumen la API real; la sesión se guarda mediante renovación segura y se restaura al arrancar. El contenido de producto y las acciones visuales de Inicio siguen pendientes. La pantalla inicial y Crear cuenta aplican sus diseños aprobados; Iniciar sesión conserva su formulario básico.

Las decisiones técnicas, el alcance autorizado y las instrucciones de implementación se mantienen en las [reglas del frontend](../.github/frontend/rules.md).

La base se creó con Flutter 3.47.5 del canal estable y Dart 3.13.4. Las dependencias y su resolución se mantienen en `pubspec.yaml` y `pubspec.lock`; este directorio no utiliza npm. Android utiliza el icono oficial de MeepleWorld; el icono iOS y los recursos de arranque siguen siendo provisionales.

## Icono oficial de Android

Los originales entregados se conservan junto a `pubspec.yaml`: [app-icon.png](app-icon.png) es la referencia de composición de 1024 × 1024 px, [app-icon-illustration.svg](app-icon-illustration.svg) contiene la ilustración con su degradado y [app-icon-illustration-monocrome.svg](app-icon-illustration-monocrome.svg) contiene la silueta blanca con ojos transparentes. El fondo del icono normal es blanco puro (`#FFFFFF`). No son recursos de la interfaz Flutter y no necesitan registrarse en `flutter.assets`.

Los recursos nativos están en `android/app/src/main/res/`:

- `drawable/ic_launcher_foreground.xml` conserva el trazado, la regla de relleno `evenOdd` y el degradado vertical original de `#C790EA` a `#515184`.
- `drawable/ic_launcher_monochrome.xml` conserva la misma geometría y sus huecos, con relleno blanco para que Android aplique el color del tema.
- `values/colors.xml` define el fondo blanco.
- `mipmap-anydpi-v26/ic_launcher.xml` combina fondo y primer plano desde Android 8; `mipmap-anydpi-v33/ic_launcher.xml` incorpora la capa monocromática desde Android 13.
- Los cinco `mipmap-*/ic_launcher.png` reproducen la referencia en 48, 72, 96, 144 y 192 px para Android 7, que sigue dentro del mínimo API 24.

Ambos vectores usan un lienzo de 108 × 108 dp. La ilustración se centra con escala `0.0703125` y traslación `(27.0703125, 28.79296875)`, para reproducir el tamaño relativo del original dentro del área visible central de 72 × 72 dp. Su contenido queda dentro de la zona segura central de 66 dp. El sistema aplica la máscara del launcher; las capas no incluyen esquinas redondeadas ni sombras exteriores. Los iconos con colores personalizados requieren que el usuario active los iconos temáticos en un launcher compatible; el fondo de esa apariencia lo determina Android, mientras el icono normal conserva el blanco. Consulta la [guía de iconos adaptativos](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).

[branding/android/google_play_icon.png](branding/android/google_play_icon.png) es la exportación para la ficha de Google Play: cuadrada, 512 × 512 px, PNG de 32 bits, sRGB y fondo blanco opaco, sin máscara ni sombra exterior. Es independiente del icono instalado. Consulta las [especificaciones de Google Play](https://developer.android.com/distribute/google-play/resources/icon-design-specifications). La firma y publicación en tiendas siguen pendientes; este cambio no incorpora variantes ni iconos oficiales de iOS.

## Arquitectura

La organización separa `lib/app/` (composición, router y layouts), `lib/core/` (componentes, cliente HTTP y almacenamiento seguro) y `lib/features/` (Auth, Inicio, Mesas, Marketplace, Mensajes y Perfil). Auth usa MVVM con `ChangeNotifier` y `ListenableBuilder`, modelos inmutables, servicio API y repositorio inyectados por constructor; no incorpora un gestor de estado externo.

Los nombres de pantallas usan el sufijo `Screen`, con archivos como `home_screen.dart`; `home_header.dart` está dentro de los widgets de Inicio. Los archivos y carpetas usan `snake_case` y los tipos `UpperCamelCase`. Las responsabilidades, límites de dependencia, convenciones están en [arquitectura del frontend](../.github/frontend/rules.md#arquitectura-organización-y-nombres).

Las capas de estado y datos existen en `features/auth`. Los demás módulos siguen siendo visuales; no hay casos de uso ni suite de frontend. Los apartados siguientes describen las rutas y los componentes actuales.

## Layout principal y rutas

`lib/main.dart` inicia `MeepleWorldApp`, definida en `lib/app/meeple_world_app.dart` con `WidgetsApp.router`. La configuración está en `lib/app/router/app_router.dart` y usa [`go_router`](https://pub.dev/packages/go_router), actualmente resuelto a 18.0.2. Las cinco rutas pertenecen a una `ShellRoute` que envuelve sus páginas en `MainShell`, sin transiciones. Las constantes están en `lib/app/router/app_routes.dart` y cada pantalla tiene su archivo en `lib/features/<feature>/presentation/screens/`:

| Sección | Ruta | Nombre de ruta |
| --- | --- | --- |
| Inicio (con sesión) | `/` | `home` |
| Mesas | `/mesas` | `tables` |
| Marketplace | `/marketplace` | `marketplace` |
| Mensajes | `/mensajes` | `messages` |
| Mi Perfil | `/mi-perfil` | `profile` |

Las cinco vistas principales comparten fondo y menú; Inicio conserva los componentes visuales aprobados y las otras cuatro el título provisional. Mi Perfil añade Cerrar sesión. Auth utiliza una `ShellRoute` independiente con zonas seguras, scroll y ancho máximo de 480, sin menú principal. En bienvenida, inicio de sesión y comprobación de sesión, el fondo cubre toda la pantalla con un `LinearGradient` diagonal de `#EA90BB` arriba a la izquierda a `#9090EA` abajo a la derecha; las barras del sistema son transparentes y usan iconos blancos. El encabezado compartido muestra el logo SVG blanco, «MeepleWorld» y «Encuentra grupos de amigos con quién jugar» antes del contenido; el logo se conserva en `assets/custom/meepleworld_logo.svg`. La pantalla inicial presenta «Crea tu cuenta» con degradado horizontal `#9D40E1` → `#5F4BD1` y «Ya tengo una cuenta» con `GlassButton` y su variante de borde para fondos con color; ambos botones quedan al fondo de la vista. Cada acción abre una vista independiente. Crear cuenta usa la variante clara de `AuthShell`, con fondo radial `#DFC6FE` → `#F3E6EF`, iconos oscuros en las barras del sistema y sin el encabezado de bienvenida. Iniciar sesión conserva su formulario estándar.

`lib/app/shell/main_shell.dart` reserva las zonas seguras y el espacio del menú para el contenido, y configura iconos oscuros en las barras del sistema. `lib/app/shell/widgets/main_background.dart` dibuja el fondo con un `RadialGradient` de Flutter, sin imágenes: `#DFC6FE` en 0% y `#F3E6EF` en 100%, ambos totalmente opacos. El centro está en la esquina superior derecha; el eje mayor llega a la inferior izquierda y el eje menor mide la mitad. Esa proporción aproxima la elipse de la referencia recibida y se adapta al tamaño y orientación de la pantalla. El fondo ocupa toda la superficie, incluidas las zonas detrás de las barras del sistema. `AuthShell` conserva el `LinearGradient` en bienvenida, inicio de sesión y comprobación de sesión; Crear cuenta reutiliza `MainBackground` dentro del mismo layout de autenticación.

Al arrancar o abrir una ruta, se comprueba/restaura la sesión antes de acceder al layout principal. Sin sesión se abre la pantalla inicial `/auth`, donde Crear cuenta aparece primero e Iniciar sesión abre la ruta `/auth/iniciar-sesion`; registrarse no crea una sesión automáticamente. Una renovación inválida limpia credenciales y usuario; un fallo de conexión muestra Reintentar y conserva la renovación segura. El backend todavía tiene lecturas anónimas pendientes de proteger, aunque la navegación móvil ya exige sesión.

## Autenticación y API

| Vista | Ruta |
| --- | --- |
| Inicio de autenticación | `/auth` |
| Iniciar sesión | `/auth/iniciar-sesion` |
| Crear cuenta | `/auth/crear-cuenta` |
| Comprobar/restaurar sesión | `/auth/sesion` |

Crear cuenta solicita nombre visible, correo, contraseña de 12–128 caracteres y confirmación, en ese orden. El nombre visible no es el `username`, que sigue generando el servidor. La vista muestra «Crea tu cuenta», la descripción aprobada y un botón de regreso de 52 píxeles; agrupa los campos y «Siguiente» al fondo, con scroll al abrir el teclado o aumentar el texto. Los dos controles de ojo muestran u ocultan cada contraseña de manera independiente. «Siguiente» valida la coincidencia antes de enviar el registro existente; la confirmación no se envía a la API. El regreso conserva la navegación previa y tiene `/auth` como destino alternativo al abrir directamente la ruta. Los formularios validan campos, deshabilitan envíos repetidos, conservan lo escrito ante errores y muestran el resultado del backend. Tras registrarse, se vuelve a Iniciar sesión con el correo rellenado y el mensaje de verificación correspondiente. En desarrollo y test la cuenta nueva ya queda verificada; después de entrar, Inicio muestra su nombre real.

`AuthApiService` implementa sign up, sign in, refresh y logout sobre el contrato REST. `http` 1.6.0 envía JSON, aplica timeout de 15 segundos y no sigue redirecciones de credenciales. `flutter_secure_storage` 11.2.0 conserva únicamente la renovación, mediante Keystore/Keychain; los access tokens permanecen en memoria. La sesión coordina una sola renovación, la rota antes del vencimiento y comprueba el estado al volver del segundo plano. Mi Perfil permite cerrarla. Si falla el cierre remoto, se elimina la credencial local y se informa de que la revocación remota no pudo confirmarse. No hay cookies ni CORS. [Paquete de almacenamiento](https://pub.dev/packages/flutter_secure_storage), [cliente HTTP](https://pub.dev/packages/http).

Configura `API_BASE_URL` desde `frontend/`. Para un teléfono físico en la misma red del equipo, sustituye la IP de ejemplo por la del equipo:

```sh
flutter run -d <id-del-dispositivo> --dart-define=API_BASE_URL=http://192.168.1.100:3000/api/v1
```

Para un Android físico por USB, puedes configurar explícitamente el puerto y usar la URL predeterminada:

```sh
adb -s <id-del-dispositivo> reverse tcp:3000 tcp:3000
flutter run -d <id-del-dispositivo> --dart-define=API_BASE_URL=http://127.0.0.1:3000/api/v1
```

Arranca primero el backend con su configuración y migraciones aplicadas. `localhost` en el teléfono no apunta al equipo sin esa redirección. Cambiar un `dart-define` requiere volver a arrancar la app; hot reload no actualiza la URL. Fuera de debug, `API_BASE_URL` debe usar HTTPS. Android permite HTTP únicamente en su manifest debug y iOS mediante `Runner/Info-Debug.plist`; release/profile conservan ATS. El permiso de red local de iOS tiene una descripción de desarrollo. Las tres configuraciones Runner usan `Runner.entitlements` para Keychain y Android desactiva backup de datos locales. No incluir secretos en parámetros de compilación.

Para comprobarlo manualmente: abre la pantalla inicial de autenticación, prueba Crear cuenta y Ya tengo una cuenta, registra nombre/correo/contraseña/confirmación con «Siguiente», inicia sesión y comprueba el saludo; cierra y vuelve a abrir la app para revisar la restauración, y usa Cerrar sesión en Mi Perfil. Comprueba también correo duplicado, contraseña incorrecta y falta de conexión. Estos comandos y recorridos describen la comprobación completa de la integración. La entrega inicial de autenticación del 6 de octubre no ejecutó el frontend; la verificación del diseño de Crear cuenta se registra por separado. Las pantallas y enlaces de verificación y recuperación y el proveedor real de correo siguen pendientes.

## Menú flotante y contenedor de vidrio

El color predeterminado de textos e iconos en toda la app es `#343136`, centralizado en `lib/core/ui/styles/app_colors.dart` como `AppColors.foreground`. La raíz lo aplica a `WidgetsApp.router.textStyle` e `IconTheme`, incluyendo HugeIcons. Los componentes heredan el color y solo lo sobrescriben cuando el diseño especifica una excepción, como el texto y el icono blancos de Crear mesa o el degradado original del SVG de ubicación.

`lib/app/shell/widgets/main_bottom_navigation_bar.dart` mantiene el menú fijo en la parte inferior, con 24 píxeles lógicos de margen lateral y 16 sobre el límite inferior de la zona segura. Su ancho máximo es de 400; el diámetro de los botones se adapta al ancho, entre 48 y 72. Los cinco iconos siempre están visibles; solo la sección activa tiene el círculo blanco. La selección se obtiene de la ruta actual mediante `MainSection`, y los toques usan `context.go` para cambiar de sección sin acumular pestañas en la pila de navegación. Cada botón expone su etiqueta y selección a accesibilidad, sin añadir texto visible al diseño.

La dependencia [`hugeicons`](https://pub.dev/packages/hugeicons), resuelta a 1.2.0, aporta `strokeRoundedHome02`, `strokeRoundedTableRound`, `strokeRoundedStore01`, `strokeRoundedMessageSquare` y `strokeRoundedUser`. Se dibujan con `HugeIcon` a 28 píxeles lógicos, color predeterminado `#343136` y trazo de 1.7.

`lib/core/ui/widgets/glass_container.dart` permite reutilizar la superficie aprobada en futuros componentes:

- Fondo blanco al 30% de opacidad.
- Blur del contenido de fondo mediante `BackdropFilter` con sigma 8 en ambos ejes, recortado al contenedor.
- Borde de 1 píxel lógico con degradado lineal desde la esquina superior izquierda a la inferior derecha. `GlassBorderStyle.lightBackground` usa `#F1E7FC` → `#DFC7FE` por defecto; `GlassBorderStyle.coloredBackground` usa `#F1E7FC` → `#7676C3` y se aplica a «Ya tengo una cuenta».
- Parámetros `child`, `borderRadius`, `padding`, `borderStyle` y `backgroundColor`; `borderStyle: null` omite el borde sin alterar los valores predeterminados de los componentes existentes; el menú usa radio de cápsula y padding de 6. `GlassButton` también acepta `borderStyle` para reutilizar ambas variantes.

El borde se pinta únicamente sobre el contorno, sin aplicar su degradado al interior. `lib/core/ui/widgets/glass_button.dart` reutiliza esta superficie para los botones de la cabecera, con forma de cápsula, altura predeterminada de 56, altura ajustable para auth y etiqueta semántica. No se han incorporado animaciones.

## Campos de texto de vidrio

`lib/core/ui/widgets/glass_text_input.dart` define `GlassTextInput`, reutilizable fuera de auth. Tiene forma de cápsula, altura mínima de 62 píxeles lógicos, fondo blanco al 50%, blur de sigma 8 en ambos ejes y ningún borde. Admite `prependIcon` y `appendIcon` opcionales; el primero hereda `#5F4BD1`, el segundo conserva el color global. El placeholder usa `#B6A1D1` y Jeko Regular a 16; el texto escrito hereda `#343136`. Las excepciones de color están centralizadas en `AppColors`.

El componente admite controlador, validador, tipo de teclado, acciones, autofill y texto oculto; participa en `Form` y presenta errores accesibles debajo de la cápsula. Los placeholders pueden ocupar dos líneas y la altura crece con el tamaño de texto del sistema. Crear cuenta lo utiliza con HugeIcons de usuario, correo y contraseña, y botones accesibles para mostrar/ocultar. `AuthPrimaryButton` comparte el degradado y la altura mínima de 72 entre la bienvenida y «Siguiente». No se añadieron dependencias ni animaciones.

## Cabecera de Inicio

`lib/features/home/presentation/widgets/home_header.dart` muestra tres botones sobre el mismo fondo, con 24 píxeles lógicos de margen lateral y 16 de margen superior dentro de la zona segura:

- Una cápsula a la izquierda con el icono personalizado `assets/custom/location_filled.svg` y «La Paz» con el archivo Jeko Semi Bold a 18. El SVG mantiene su degradado original y el texto usa elipsis si el ancho disponible es pequeño.
- Dos botones circulares a la derecha, de 56 de diámetro, con `HugeIcons.strokeRoundedSearch01` y `HugeIcons.strokeRoundedNotification01`, tamaño 24, trazo 1.7 y etiquetas accesibles «Buscar» y «Notificaciones».

El SVG está registrado en `pubspec.yaml` y se carga con [`flutter_svg`](https://pub.dev/packages/flutter_svg), resuelto a 2.3.0 y declarado como dependencia directa; HugeIcons ya lo utilizaba de forma transitiva. La ciudad es un dato visual provisional, sin geolocalización ni consulta a la API. Los tres botones carecen de acciones conectadas y se anuncian como deshabilitados a accesibilidad; los flujos de selección de ciudad, búsqueda y notificaciones siguen pendientes.

El texto de ciudad usa el alias `JekoSemiBold`, registrado con el archivo `Jeko Semi Bold.ttf`. Los archivos Jeko inspeccionados declaran internamente peso 400, incluso Medium, Semi Bold y Bold; el alias con un único archivo evita que la cabecera resuelva una variante más fina al resolver la familia tipográfica. El registro de la familia general `Jeko` se conserva.

## Saludo y accesos de Inicio

Las cinco tarjetas se reducen visualmente a escala `0.95` al presionarlas, con transición de 150 ms y curva `easeOutCubic`. Al soltar regresan suavemente a su tamaño, completando el efecto también en toques rápidos; al cancelar el gesto se restaura la escala. El layout y el área táctil permanecen fijos y la preferencia del sistema de desactivar animaciones se respeta. Este cambio no incorpora acciones de producto. Su revisión visual queda a cargo del responsable; no se compiló ni ejecutó para este ajuste.

`HomeScreen` recibe `userName` desde la sesión real y muestra «Hola» seguido del nombre visible, con Jeko Semi Bold a 28. El saludo reemplaza el título de Inicio y la pantalla permite desplazarse sin mover el menú inferior.

`HomeQuickActions` compone un grid de dos columnas con márgenes laterales de 32 y separación de 12. Crear mesa ocupa las dos primeras filas de la izquierda; Ver mapa y Mi ludoteca están a su derecha; Mis amigos y Marketplace quedan en la última fila. La altura se calcula según el ancho y el tamaño de texto del sistema, permitiendo que las etiquetas se ajusten sin recortarse.

`HomeQuickActionCard` mantiene radio de 28 y usa padding de 9 (antes 16). Todas las etiquetas usan el archivo Jeko Regular con peso explícito `FontWeight.w400`: los accesos de color a 18 y Crear mesa a 22. La altura mínima de las tarjetas se redujo y sigue creciendo cuando el tamaño de texto del sistema lo requiere. Los cuatro accesos de color tienen un círculo de 48 con blanco al 20% y un HugeIcon a 24, trazo 1.7:

| Acceso | HugeIcons | Fondo |
| --- | --- | --- |
| Ver mapa | `strokeRoundedMapsLocation02` | `#EEB85F` |
| Mi ludoteca | `strokeRoundedDice` | `#8FB2EC` |
| Mis amigos | `strokeRoundedAiCoEditing` | `#EC8DBD` |
| Marketplace | `strokeRoundedStore01` | `#9590ED` |
| Crear mesa | `strokeRoundedPlus` | Fotografía y degradado morado |

Crear mesa utiliza [la fotografía vertical local](assets/images/create_table_background.jpg), recreada con ImageGen a partir de la referencia entregada en 1024 × 1536 (2:3), con `BoxFit.cover`. Flutter añade el degradado morado, el texto blanco Jeko Regular a 22, peso 400 y el icono de suma; el archivo no contiene esos elementos. Su [procedencia y prompt](assets/images/README.md) están documentados junto al recurso. El JPEG está registrado explícitamente en `pubspec.yaml`.

Las cinco tarjetas reciben callbacks opcionales y todavía no tienen acciones conectadas. Accesibilidad las identifica con su nombre como botones deshabilitados, conservando el diseño visible. Mis amigos es únicamente un acceso visual; las relaciones de amistad continúan fuera del alcance de la primera versión. Estos accesos no incorporan rutas ni consumo de contenido; la autenticación se integra por separado.

## Fuentes tipográficas

Las tarjetas utilizan el alias `JekoRegular`, registrado con un único archivo `Jeko Regular.ttf`, y peso explícito 400. Esto garantiza la variante Regular aunque los archivos entregados compartan metadatos internos de peso. La cabecera y el saludo conservan `JekoSemiBold`.

Los 19 archivos de Jeko están en `assets/fonts/`, junto a `lib/`, y se registran en la sección `flutter.fonts` de `pubspec.yaml`. Las rutas parten de ese archivo, según la [guía oficial de fuentes de Flutter](https://docs.flutter.dev/cookbook/design/fonts). Esta declaración incluye las fuentes en la aplicación; no es necesario repetirlas en `flutter.assets` ni configurarlas por separado en Android e iOS.

La familia `Jeko` incluye estos pesos, cada uno con su archivo normal y su cursiva (`FontStyle.italic`):

| Variante | Peso en Flutter |
| --- | --- |
| Thin | `FontWeight.w100` |
| Extra Light | `FontWeight.w200` |
| Light | `FontWeight.w300` |
| Regular | `FontWeight.w400` |
| Medium | `FontWeight.w500` |
| Semi Bold | `FontWeight.w600` |
| Bold | `FontWeight.w700` |
| Extra Bold | `FontWeight.w800` |
| Black | `FontWeight.w900` |

Para usarla en un widget cuando se implementen las pantallas:

```dart
const Text(
  'MeepleWorld',
  style: TextStyle(
    fontFamily: 'Jeko',
    fontWeight: FontWeight.w700,
    fontStyle: FontStyle.italic,
  ),
)
```

El archivo `Jeko Italic Variable.ttf` se conserva y está disponible mediante `fontFamily: 'JekoItalicVariable'`, con `FontWeight.w400` y `FontStyle.italic`. Aunque su nombre dice «Variable», el archivo entregado no contiene la tabla `fvar` de ejes de variación; se registra como una fuente fija independiente y no admite pesos variables mediante `FontVariation`.

Después de modificar el registro, ejecuta `flutter pub get` desde `frontend/` y reinicia por completo la aplicación para cargar las fuentes nuevas. Los títulos provisionales ya utilizan Jeko. Su aplicación al resto de textos y al tema global queda pendiente del diseño.

## Herramientas

- Flutter del canal estable, con su SDK de Dart incluido. Consulta la [instalación oficial](https://docs.flutter.dev/install/manual).
- Android Studio, JDK compatible y Android SDK. Esta base usa API 24 como mínimo, API 36 para compilación/destino y NDK 28.2.13676358, según los valores de Flutter 3.47.5.
- Para iOS: macOS, Xcode completo, sus herramientas/licencias configuradas y un simulador o dispositivo. La plantilla declara iOS 15 como mínimo. CocoaPods permite incorporar plugins que lo requieran.

Comprueba el entorno:

```sh
flutter doctor -v
```

En la instalación local del 1 de octubre de 2026 se instalaron Flutter/Dart, Android Studio, Android Command-line Tools, SDK Platform 36, Build-Tools 36.0.0, Platform-Tools, NDK 28.2.13676358 y CMake 3.22.1. Java 21 y CocoaPods 1.16.2 ya estaban disponibles; Flutter utiliza el JDK incluido en Android Studio para compilar. Flutter está en `/opt/homebrew/share/flutter` y el SDK Android en `/Users/enrique/Library/Android/sdk`; estas rutas describen esa computadora y no deben copiarse a configuración versionada.

Para depurar y verificar Android, busca primero un Google Pixel u otro teléfono físico conectado por USB. Si no hay uno disponible por USB, usa el teléfono físico que ya está configurado para depuración por Wi-Fi; no se utilizan emuladores Android. Para USB, activa las opciones de desarrollador y la depuración USB en el teléfono, conéctalo con un cable de datos y acepta su solicitud de autorización para esta computadora cuando aparezca. Para Wi-Fi, usa la conexión inalámbrica ya configurada y el identificador que muestre `flutter devices`; no es necesario volver a emparejarla.

Xcode completo sigue pendiente. Para habilitar iOS, instala [Xcode desde App Store](https://apps.apple.com/app/xcode/id497799835), configura sus herramientas y completa las licencias/componentes siguiendo la [guía de Flutter para iOS](https://docs.flutter.dev/platform-integration/ios/setup). Los archivos `ios/` están generados, pero no se ha verificado una compilación iOS. Los avisos de `flutter doctor` sobre Chrome o escritorio no corresponden a los destinos de este proyecto.

## Ejecutar

Desde `frontend/`:

```sh
flutter pub get
flutter devices
flutter run -d <id-del-dispositivo>
```

Selecciona primero el dispositivo Android físico por USB; si no hay uno, el teléfono físico conectado por Wi-Fi. También puede usarse un destino iOS disponible. Para comprobar las conexiones Android:

```sh
adb devices -l
```

Abre este directorio como proyecto Flutter en un editor con soporte Dart/Flutter. La solicitud para instalar los plugins Dart/Flutter en Android Studio fue rechazada y su instalación queda pendiente. Se administran desde Settings → Plugins; consulta la [guía del editor](https://docs.flutter.dev/tools/android-studio). La CLI de Flutter está disponible para trabajar desde la terminal.

## Comprobar y compilar

```sh
dart format --output=none --set-exit-if-changed lib
flutter analyze
flutter build apk --debug
```

El APK de desarrollo se genera en `build/app/outputs/flutter-apk/app-debug.apk`. La plantilla Android usa firma de depuración; la firma y publicación en tiendas siguen pendientes.

Con Xcode y el soporte de simulador configurados:

```sh
flutter build ios --simulator
```

No hay suite Dart de pruebas; auth ya incorpora comportamiento real. Por petición del responsable, esta entrega solo comprueba formato y análisis estático: no se crean ni ejecutan pruebas ni se compila, instala o abre la app. La comprobación de registro, acceso, persistencia, errores y cierre será manual por el responsable. Los registros siguientes corresponden a entregas anteriores y no acreditan el nuevo flujo de auth.

Verificación del layout y rutas del 2 de octubre de 2026: `dart format --output=none --set-exit-if-changed lib` y `flutter analyze` pasaron; `flutter build apk --debug` generó el APK. Al no haber un teléfono por USB, se compiló, instaló y ejecutó la versión final en el Pixel 8a físico por la conexión Wi-Fi ya configurada. Una captura del dispositivo permitió comprobar el fondo radial a pantalla completa y los iconos oscuros del sistema; ADB confirmó el proceso activo y el arranque no mostró errores de Flutter. Los enlaces locales de la documentación y `git diff --check` también pasaron. No se ha verificado iOS.

Verificación del menú flotante del 2 de octubre de 2026: formato y `flutter analyze` pasaron; `flutter build apk --debug` generó el APK y `flutter run --debug --no-resident` lo instaló y ejecutó en el Pixel 8a físico por Wi-Fi, al no haber un teléfono conectado por USB. Se tocaron Mesas, Marketplace, Mensajes, Mi Perfil e Inicio, y la jerarquía de accesibilidad confirmó en cada paso una única sección seleccionada y los cinco botones visibles. Las capturas de Inicio y Mi Perfil permitieron revisar el menú, el borde, el círculo activo y las zonas seguras. La app quedó activa en Inicio; la revisión de logs de Flutter no mostró errores. Los enlaces locales y `git diff --check` pasaron. Las vistas siguen vacías y la verificación iOS continúa pendiente por falta de Xcode completo.

Verificación de los títulos del 2 de octubre de 2026: formato y `flutter analyze` pasaron. `flutter run --debug --no-resident` compiló el APK, lo instaló y ejecutó en el Pixel 8a físico por Wi-Fi. Se comprobó que Inicio, Mesas, Marketplace, Mensajes y Mi Perfil muestran su título y que coincide con la selección del menú. La captura de Inicio permitió revisar su presentación centrada; la app quedó en esa sección. Los enlaces locales y `git diff --check` pasaron. iOS sigue sin verificar por falta de Xcode completo.

Verificación del icono Android del 4 de octubre de 2026: formato, `flutter analyze`, `flutter build apk --debug`, XML y enlaces locales pasaron. El APK se instaló y ejecutó en el Pixel 8a físico por Wi-Fi con Android 17 (API 37), al no haber un teléfono por USB. La ficha de información de MeepleWorld mostró el icono adaptativo con la ilustración, el degradado, los ojos y el fondo blanco correctos. El XML compilado de API 33 incluye fondo, primer plano y monocromo. La comparación de una renderización vectorial con la referencia confirmó la composición; el contorno queda a un máximo de 30.22 dp del centro, dentro de la zona segura de radio 33 dp. Se verificaron los cinco tamaños PNG y la exportación Google Play de 44 161 bytes, RGBA de 8 bits, alfa opaco y perfil sRGB. Las vistas de colores personalizados son simulaciones; no se modificaron las preferencias del launcher ni se verificó en el teléfono un cambio de color. Android 7 e iOS no se verificaron en dispositivos.

## Backend e integraciones pendientes

Verificación del saludo y accesos del 4 de octubre de 2026: formato, `flutter analyze` y `flutter build apk --debug` pasaron. La versión final se instaló y ejecutó con `flutter run --debug --no-resident` en el Pixel 8a físico por Wi-Fi; el arranque con ancho inicial de cero no produjo excepciones. La captura de Inicio confirmó las cinco tarjetas, las etiquetas sin cortes, la tipografía Regular, el padding reducido, la imagen vertical con overlay y el color común en textos e iconos, conservando el blanco de Crear mesa. La jerarquía de accesibilidad confirmó las cinco etiquetas y su estado deshabilitado. Se revisaron enlaces locales y `git diff --check`. La app quedó en Inicio; iOS continúa sin verificar porque no hay Xcode completo.

La API existente conserva sus endpoints y contrato en [backend/openapi.yaml](../backend/openapi.yaml); el frontend todavía no los consume. No es necesario iniciar el backend para ejecutar el layout principal.

Al implementar el cliente, habrá que definir la URL de API, adaptar la renovación de sesiones al almacenamiento seguro móvil e integrar las funcionalidades acordadas. El teléfono físico necesita una dirección del backend alcanzable desde el dispositivo o una redirección de puerto ADB configurada explícitamente durante el desarrollo. Ningún secreto de backend debe incorporarse a la aplicación.
