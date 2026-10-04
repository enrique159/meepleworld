# Frontend de MeepleWorld

Proyecto Flutter exclusivamente para Android e iOS, con layout principal y navegación entre cinco vistas provisionales. La ruta `/` abre Inicio con el fondo radial, el menú inferior flotante y la cabecera aprobados. El contenido de las pantallas, las acciones de la cabecera, la autenticación y la integración con el backend están pendientes; los demás componentes, estilos, temas y animaciones se definirán cuando el responsable entregue su diseño.

Las decisiones técnicas, el alcance autorizado y las instrucciones de implementación se mantienen en las [reglas del frontend](../.github/frontend/rules.md).

La base se creó con Flutter 3.47.5 del canal estable y Dart 3.13.4. Las dependencias y su resolución se mantienen en `pubspec.yaml` y `pubspec.lock`; este directorio no utiliza npm. Los iconos y recursos nativos generados por Flutter son provisionales.

## Arquitectura

La organización implementada separa `lib/app/` (arranque, router y shell global), `lib/core/` (componentes e infraestructura compartidos) y `lib/features/` (módulos de Inicio, Mesas, Marketplace, Mensajes y Perfil). Cada funcionalidad separa sus pantallas en `presentation/screens/` y sus componentes en `presentation/widgets/`; estado y acceso a datos se incorporarán cuando exista comportamiento real. La presentación con estado seguirá MVVM y los casos de uso serán opcionales.

Los nombres de pantallas usan el sufijo `Screen`, con archivos como `home_screen.dart`; `home_header.dart` está dentro de los widgets de Inicio. Los archivos y carpetas usan `snake_case` y los tipos `UpperCamelCase`. Las responsabilidades, límites de dependencia, convenciones están en [arquitectura del frontend](../.github/frontend/rules.md#arquitectura-organización-y-nombres).

La refactorización de los 17 archivos Dart existentes está completada; las carpetas globales anteriores fueron retiradas. Las capas de estado, datos y dominio y las carpetas de pruebas se crearán cuando haya código que las necesite. Los apartados siguientes describen esta estructura y sus rutas actuales.

## Layout principal y rutas

`lib/main.dart` inicia `MeepleWorldApp`, definida en `lib/app/meeple_world_app.dart` con `WidgetsApp.router`. La configuración está en `lib/app/router/app_router.dart` y usa [`go_router`](https://pub.dev/packages/go_router), actualmente resuelto a 18.0.2. Las cinco rutas pertenecen a una `ShellRoute` que envuelve sus páginas en `MainShell`, sin transiciones. Las constantes están en `lib/app/router/app_routes.dart` y cada pantalla tiene su archivo en `lib/features/<feature>/presentation/screens/`:

| Sección | Ruta | Nombre de ruta |
| --- | --- | --- |
| Inicio (inicial) | `/` | `home` |
| Mesas | `/mesas` | `tables` |
| Marketplace | `/marketplace` | `marketplace` |
| Mensajes | `/mensajes` | `messages` |
| Mi Perfil | `/mi-perfil` | `profile` |

Todas las vistas muestran su título y comparten fondo y menú; Inicio incorpora además su cabecera. `lib/core/ui/widgets/section_placeholder.dart` centraliza ese título provisional: centrado en el área de contenido restante, con Jeko de 24 píxeles lógicos, peso 600 y color `#1B1B1B`, marcado como encabezado para accesibilidad. El futuro layout de autenticación tendrá un grupo separado; no se han definido rutas ni pantallas de acceso todavía.

`lib/app/shell/main_shell.dart` reserva las zonas seguras y el espacio del menú para el contenido, y configura iconos oscuros en las barras del sistema. `lib/app/shell/widgets/main_background.dart` dibuja el fondo con un `RadialGradient` de Flutter, sin imágenes: `#DFC6FE` en 0% y `#F3E6EF` en 100%, ambos totalmente opacos. El centro está en la esquina superior derecha; el eje mayor llega a la inferior izquierda y el eje menor mide la mitad. Esa proporción aproxima la elipse de la referencia recibida y se adapta al tamaño y orientación de la pantalla. El fondo ocupa toda la superficie, incluidas las zonas detrás de las barras del sistema.

La apertura directa de estas rutas es una presentación provisional autorizada para trabajar el diseño: no crea ni simula una sesión y no consulta contenido protegido. La autenticación móvil, el layout de acceso y la redirección según sesión siguen pendientes. La regla de producto de exigir una sesión válida se aplicará antes de incorporar contenido de la plataforma.

## Menú flotante y contenedor de vidrio

`lib/app/shell/widgets/main_bottom_navigation_bar.dart` mantiene el menú fijo en la parte inferior, con 24 píxeles lógicos de margen lateral y 16 sobre el límite inferior de la zona segura. Su ancho máximo es de 400; el diámetro de los botones se adapta al ancho, entre 48 y 72. Los cinco iconos siempre están visibles; solo la sección activa tiene el círculo blanco. La selección se obtiene de la ruta actual mediante `MainSection`, y los toques usan `context.go` para cambiar de sección sin acumular pestañas en la pila de navegación. Cada botón expone su etiqueta y selección a accesibilidad, sin añadir texto visible al diseño.

La dependencia [`hugeicons`](https://pub.dev/packages/hugeicons), resuelta a 1.2.0, aporta `strokeRoundedHome02`, `strokeRoundedTableRound`, `strokeRoundedStore01`, `strokeRoundedMessageSquare` y `strokeRoundedUser`. Se dibujan con `HugeIcon` a 28 píxeles lógicos, color `#1B1B1B` y trazo de 1.7.

`lib/core/ui/widgets/glass_container.dart` permite reutilizar la superficie aprobada en futuros componentes:

- Fondo blanco al 30% de opacidad.
- Blur del contenido de fondo mediante `BackdropFilter` con sigma 8 en ambos ejes, recortado al contenedor.
- Borde de 1 píxel lógico con degradado lineal `#F1E7FC` en la esquina superior izquierda y `#DFC7FE` en la inferior derecha.
- Parámetros `child`, `borderRadius` y `padding`; el menú usa radio de cápsula y padding de 6.

El borde se pinta únicamente sobre el contorno, sin aplicar su degradado al interior. `lib/core/ui/widgets/glass_button.dart` reutiliza esta superficie para los botones de la cabecera, con forma de cápsula, altura de 56 y una etiqueta semántica. No se han incorporado animaciones.

## Cabecera de Inicio

`lib/features/home/presentation/widgets/home_header.dart` muestra tres botones sobre el mismo fondo, con 24 píxeles lógicos de margen lateral y 16 de margen superior dentro de la zona segura:

- Una cápsula a la izquierda con el icono personalizado `assets/custom/location_filled.svg` y «La Paz» con el archivo Jeko Semi Bold a 18. El SVG mantiene su degradado original y el texto usa elipsis si el ancho disponible es pequeño.
- Dos botones circulares a la derecha, de 56 de diámetro, con `HugeIcons.strokeRoundedSearch01` y `HugeIcons.strokeRoundedNotification01`, tamaño 24, trazo 1.7 y etiquetas accesibles «Buscar» y «Notificaciones».

El SVG está registrado en `pubspec.yaml` y se carga con [`flutter_svg`](https://pub.dev/packages/flutter_svg), resuelto a 2.3.0 y declarado como dependencia directa; HugeIcons ya lo utilizaba de forma transitiva. La ciudad es un dato visual provisional, sin geolocalización ni consulta a la API. Los tres botones carecen de acciones conectadas y se anuncian como deshabilitados a accesibilidad; los flujos de selección de ciudad, búsqueda y notificaciones siguen pendientes.

El texto de ciudad usa el alias `JekoSemiBold`, registrado con el archivo `Jeko Semi Bold.ttf`. Los archivos Jeko inspeccionados declaran internamente peso 400, incluso Medium, Semi Bold y Bold; el alias con un único archivo evita que la cabecera resuelva una variante más fina al resolver la familia tipográfica. El registro de la familia general `Jeko` se conserva.

## Fuentes tipográficas

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

No hay suite Dart de pruebas ni funcionalidades de producto. Las pruebas se incorporarán cuando exista comportamiento que verificar. Verificación local del 1 de octubre de 2026: formato y `flutter analyze` pasaron; `flutter build apk --debug` generó el APK y `flutter doctor -v` confirmó las herramientas Android y sus licencias. La app se compiló, instaló y ejecutó mediante `flutter run` en un Pixel 8a físico con Android 17 (API 37), autorizado por USB. Tras volver a abrirla, ADB confirmó su proceso activo y `MainActivity` en primer plano. La compilación iOS sigue pendiente.

Verificación del layout y rutas del 2 de octubre de 2026: `dart format --output=none --set-exit-if-changed lib` y `flutter analyze` pasaron; `flutter build apk --debug` generó el APK. Al no haber un teléfono por USB, se compiló, instaló y ejecutó la versión final en el Pixel 8a físico por la conexión Wi-Fi ya configurada. Una captura del dispositivo permitió comprobar el fondo radial a pantalla completa y los iconos oscuros del sistema; ADB confirmó el proceso activo y el arranque no mostró errores de Flutter. Los enlaces locales de la documentación y `git diff --check` también pasaron. No se ha verificado iOS.

Verificación del menú flotante del 2 de octubre de 2026: formato y `flutter analyze` pasaron; `flutter build apk --debug` generó el APK y `flutter run --debug --no-resident` lo instaló y ejecutó en el Pixel 8a físico por Wi-Fi, al no haber un teléfono conectado por USB. Se tocaron Mesas, Marketplace, Mensajes, Mi Perfil e Inicio, y la jerarquía de accesibilidad confirmó en cada paso una única sección seleccionada y los cinco botones visibles. Las capturas de Inicio y Mi Perfil permitieron revisar el menú, el borde, el círculo activo y las zonas seguras. La app quedó activa en Inicio; la revisión de logs de Flutter no mostró errores. Los enlaces locales y `git diff --check` pasaron. Las vistas siguen vacías y la verificación iOS continúa pendiente por falta de Xcode completo.

Verificación de los títulos del 2 de octubre de 2026: formato y `flutter analyze` pasaron. `flutter run --debug --no-resident` compiló el APK, lo instaló y ejecutó en el Pixel 8a físico por Wi-Fi. Se comprobó que Inicio, Mesas, Marketplace, Mensajes y Mi Perfil muestran su título y que coincide con la selección del menú. La captura de Inicio permitió revisar su presentación centrada; la app quedó en esa sección. Los enlaces locales y `git diff --check` pasaron. iOS sigue sin verificar por falta de Xcode completo.

## Backend e integraciones pendientes

La API existente conserva sus endpoints y contrato en [backend/openapi.yaml](../backend/openapi.yaml); el frontend todavía no los consume. No es necesario iniciar el backend para ejecutar el layout principal.

Al implementar el cliente, habrá que definir la URL de API, adaptar la renovación de sesiones al almacenamiento seguro móvil e integrar las funcionalidades acordadas. El teléfono físico necesita una dirección del backend alcanzable desde el dispositivo o una redirección de puerto ADB configurada explícitamente durante el desarrollo. Ningún secreto de backend debe incorporarse a la aplicación.
