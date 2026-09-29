# Frontend de MeepleWorld

Base adaptable para web y Android construida con Ionic Vue, Vue Router, Pinia y Capacitor. Las rutas y pantallas iniciales ya están creadas; las consultas reales, autenticación y demás operaciones esperan al backend.

## Requisitos

- El repositorio no fija versiones de Node.js ni npm. Usa versiones compatibles con las dependencias instaladas en este proyecto.
- Para Android: Android Studio 2025.2.1 o superior, Android SDK Platform 36, Platform Tools y JDK 21.

## Instalar y ejecutar la web

Desde este directorio (`frontend/`):

```sh
npm install
cp .env.example .env
npm run dev
```

Vite sirve la aplicación en `http://localhost:5173`. Las peticiones `/api/v1` y `/socket.io` se redirigen al backend local en el puerto 3000 cuando esté implementado.

## Android

El proyecto nativo está en `android/`. Desde `frontend/`, sincroniza la versión web y abre el proyecto con Android Studio:

```sh
npm run android:sync
npm run android:open
```

Compila y sincroniza después de cada cambio web. El comando genera los recursos de `dist` en Android; la compilación del APK o AAB se realiza en Android Studio.

En un emulador, Android alcanza al host de desarrollo en `10.0.2.2`; para un dispositivo físico configura `VITE_API_BASE_URL` y `VITE_WS_URL` con una dirección alcanzable por el teléfono. Todo valor `VITE_*` termina incluido en el cliente y no debe contener secretos.

## Comprobaciones disponibles

```sh
npm run typecheck
npm run build
```

Ejecuta también estos comandos desde `frontend/`.

La selección de iOS y los plugins móviles de ubicación, almacenamiento seguro y notificaciones push quedan para una etapa posterior.
