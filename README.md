# Shark Coach AI

Creame un sitio web con ia donde la ia sea mi coach tiburon que me va a llevar al exito, en mis negocios, mis habitos, mi salud, mi mente. donde me enseñe todos los días cosas, tengo muchos libros te crecimeinto personal, emprendimeinto, finanzas, estoisimo y demás de lso caules tengo muchos recursos y todo lo que deberia ahcer un coach tambien pnl que me recuerde mis metas y todo eso

This project was built with [Lovable](https://lovable.dev).

## Compilación estática para Capacitor / iOS

`npm run build` genera una SPA: TanStack Start crea el documento HTML durante la compilación y las pantallas se ejecutan en el dispositivo, sin SSR en tiempo de ejecución. La carpeta que Capacitor empaqueta es `.output/public`, con un `index.html` real y sus scripts, estilos e imágenes. `capacitor.config.json` declara esa carpeta como `webDir`; no usa `server.url`.

La compilación también puede producir archivos de servidor para el sitio web. **No se incluyen en Capacitor**. El paso final comprueba el HTML y sus archivos locales y falla si falta alguno; nunca sustituye el HTML por una página vacía. `npm run test:static` prueba esa validación.

Para generar el proyecto nativo en macOS:

```sh
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```

Si `ios` ya existe, omite `cap add ios`. El flujo de GitHub Actions también usa esta carpeta estática al generar el IPA sin firma.

**Límite importante:** estático no significa IA sin conexión. Las metas, hábitos y PDFs se guardan localmente; el chat y las lecciones generadas todavía llaman a servicios del sitio (`/api/chat` y funciones de servidor). Dentro de Capacitor no hay esos servicios: para conservar la IA hay que conectar la app a un servicio HTTPS publicado y habilitar el acceso desde la app nativa. Este cambio no configura esa conexión ni incluye claves privadas en el IPA. Las fuentes de Google también requieren conexión y tienen fuentes de respaldo locales.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7b34beee-7958-46e8-b59a-8cc3e90c7e38).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
