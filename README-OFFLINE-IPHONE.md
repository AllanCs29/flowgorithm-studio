# Flowgorithm Studio v14 · App para iPhone sin internet

## Qué se puede hacer
- Abrir desde un icono de la pantalla de inicio del iPhone sin Safari alrededor.
- Estudiar lecciones, hacer simulaciones y ejercicios sin señal, una vez que el dispositivo descargue la app mediante HTTPS.
- El progreso se guarda **en el dispositivo y navegador donde estudies**, no se sincroniza entre Mac e iPhone.
- Para estudiar sin internet, primero abre el enlace HTTPS con internet, espera a ver **«Listo para estudiar sin internet»** en la portada, instálala desde Safari y ábrela una vez desde el icono con internet. Después prueba modo Avión.
- No requiere Google Fonts ni servicios externos para iniciar y presentar las clases.
- iOS puede borrar datos o caches cuando falte espacio; utiliza las opciones de copia de seguridad local para tus proyectos y progreso.

## Mac: compilar y comprobar
```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
```
Si todo pasa, `dist/` contendrá los archivos listos para publicar y el service worker ya incluirá todo el JS y CSS.

### Para seguir desarrollando en Mac y revisar por Wi-Fi
```bash
npm run dev:lan
```
Local: http://localhost:5173, teléfono: URL `Network` mostrada en la terminal. **Esta dirección de desarrollo por HTTP NO instala el modo offline en el iPhone**. Es solamente para desarrollo y pruebas de interfaz.

## Publicar fácilmente gratis con Netlify Drop (HTTPS)
1. En el Mac ejecuta `npm run build`.
2. En Finder abre `~/Proyectos/Flowgorithm-Studio/dist`.
3. Entra a https://app.netlify.com/drop y arrastra **la carpeta dist**, no el ZIP del código fuente.
4. Netlify te devolverá un enlace HTTPS como `https://nombre.netlify.app`.
5. Abre esa URL en Safari en tu iPhone, conectado a internet. Espera a que la portada muestre **Listo para estudiar sin internet**.
6. Safari → Compartir → **Agregar a pantalla de inicio** → activa **Abrir como app web** → Agregar.
7. Abre desde el nuevo icono una vez con internet. Activa modo Avión, cierra la app y vuelve a abrirla: comprueba que las lecciones y los retos funcionen.
8. Para actualizar, compila otra vez y publica el **mismo sitio** en Netlify. Conecta el iPhone para que reciba los nuevos archivos.

Nota: publicar el sitio por HTTPS lo hace accesible a quien tenga su URL, salvo que configures privacidad. No subas proyectos o datos personales al hosting. El progreso se guarda localmente en iPhone y no se publica.

## Opcional: GitHub Pages
El proyecto permite construir para subdirectorios. Configura `BASE_PATH=/nombre-repo/ npm run build` y publica `dist` en ese subdirectorio. Manifest y service worker usan rutas relativas y quedan dentro del mismo scope.

## Problemas frecuentes
- «No preparado»: asegúrate de abrir la versión **compilada** desde HTTPS. No sirve `http://192.168...:5173` para la instalación offline.
- El iPhone pierde el progreso: no borres la app ni sus datos de sitio; la limpieza de Safari/iOS puede eliminar el almacenamiento.
- Instalada pero no carga en modo Avión: abre primero desde el icono y conéctate a internet hasta que muestre «Listo para estudiar sin internet». Luego vuelve a probar.
- Una actualización no aparece: con conexión, cierra y vuelve a abrir la app tras unos minutos.
