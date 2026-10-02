# Frontend de MeepleWorld

Proyecto Flutter vacío, exclusivamente para Android e iOS. La aplicación muestra una superficie blanca sin texto, controles, navegación ni integración con el backend. La identidad visual, componentes, estilos, temas y animaciones se definirán cuando el responsable termine el diseño.

La base se creó con Flutter 3.47.5 del canal estable y Dart 3.13.4. Las dependencias y su resolución se mantienen en `pubspec.yaml` y `pubspec.lock`; este directorio no utiliza npm. Los iconos y recursos nativos generados por Flutter son provisionales.

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

Después de modificar el registro, ejecuta `flutter pub get` desde `frontend/` y reinicia por completo la aplicación para cargar las fuentes nuevas. Las fuentes están disponibles como recursos locales; su asignación a textos y al tema global queda pendiente del diseño. La aplicación conserva su superficie vacía.

## Herramientas

- Flutter del canal estable, con su SDK de Dart incluido. Consulta la [instalación oficial](https://docs.flutter.dev/install/manual).
- Android Studio, JDK compatible y Android SDK. Esta base usa API 24 como mínimo, API 36 para compilación/destino y NDK 28.2.13676358, según los valores de Flutter 3.47.5.
- Para iOS: macOS, Xcode completo, sus herramientas/licencias configuradas y un simulador o dispositivo. La plantilla declara iOS 15 como mínimo. CocoaPods permite incorporar plugins que lo requieran.

Comprueba el entorno:

```sh
flutter doctor -v
```

En la instalación local del 1 de octubre de 2026 se instalaron Flutter/Dart, Android Studio, Android Command-line Tools, SDK Platform 36, Build-Tools 36.0.0, Platform-Tools, NDK 28.2.13676358 y CMake 3.22.1. Java 21 y CocoaPods 1.16.2 ya estaban disponibles; Flutter utiliza el JDK incluido en Android Studio para compilar. Flutter está en `/opt/homebrew/share/flutter` y el SDK Android en `/Users/enrique/Library/Android/sdk`; estas rutas describen esa computadora y no deben copiarse a configuración versionada.

Android se desarrolla y verifica en un dispositivo físico conectado por USB; no se utilizan emuladores Android. Activa las opciones de desarrollador y la depuración USB en el teléfono, conéctalo con un cable de datos y acepta su solicitud de autorización para esta computadora cuando aparezca.

Xcode completo sigue pendiente. Para habilitar iOS, instala [Xcode desde App Store](https://apps.apple.com/app/xcode/id497799835), configura sus herramientas y completa las licencias/componentes siguiendo la [guía de Flutter para iOS](https://docs.flutter.dev/platform-integration/ios/setup). Los archivos `ios/` están generados, pero no se ha verificado una compilación iOS. Los avisos de `flutter doctor` sobre Chrome o escritorio no corresponden a los destinos de este proyecto.

## Ejecutar

Desde `frontend/`:

```sh
flutter pub get
flutter devices
flutter run -d <id-del-dispositivo>
```

Selecciona el dispositivo Android físico o un destino iOS disponible. Para comprobar la conexión USB de Android:

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

## Backend e integraciones pendientes

La API existente conserva sus endpoints y contrato en [backend/openapi.yaml](../backend/openapi.yaml); el frontend todavía no los consume. No es necesario iniciar el backend para ejecutar esta base vacía.

Al implementar el cliente, habrá que definir la URL de API, adaptar la renovación de sesiones al almacenamiento seguro móvil e integrar las funcionalidades acordadas. El teléfono físico necesita una dirección del backend alcanzable desde el dispositivo o una redirección de puerto ADB configurada explícitamente durante el desarrollo. Ningún secreto de backend debe incorporarse a la aplicación.
