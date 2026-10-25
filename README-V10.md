# Flowgorithm Studio v10 — Academia Visual (v8 + v9 + v10 en un ZIP)

## Qué incluye de verdad

La nueva versión se construye sobre v7 (motor, simulador y 100 ejercicios de los 11 mundos). Añade:

- **v8 · Práctica adaptativa local:** 24 microretos de predicción, corrección y orden de bloques, distribuidos en seis habilidades. Respuestas verificables, pistas y repaso programado (1, 3, 7, 14, 30 días tras aciertos sucesivos; tras fallo, una hora). El sistema usa resultados locales, no IA remota.
- **v9 · Del diagrama al código:** al seleccionar un bloque aparece una equivalencia didáctica en Python, JavaScript, C, C++ o Java; el código completo continúa en su generador independiente. Galería de cinco proyectos integradores enlazados a las prácticas 096–100.
- **v10 · Academia y aulas locales:** múltiples perfiles en un mismo navegador, avance separado por alumno, asignación de ejercicios por perfil, exportación de notas en CSV y copia de seguridad/importación de progreso en JSON. Compatible con móvil y escritorio; PWA instalable y con recursos precargados sin conexión cuando se sirve por HTTPS o localhost y se realiza una compilación de producción.
- **Corrección de Declarar:** la declaración por defecto sigue siendo escalar; solo se muestra el tamaño al activar «¿Es un arreglo de varios valores?». Ejemplo: `Integer edad` es un único número; `Integer edad[5]` son cinco casillas.
- **Entrenador contextual de depuración:** pistas para variables no declaradas, índices, ciclos y expresiones. No reemplaza al profesor ni garantiza identificar todas las causas.

Los 100 ejercicios conservan sus validadores existentes. Las 85 pruebas de la v7 verificadas anteriormente en Mac siguen incluidas y se añaden nuevas pruebas para microretos, perfiles y puente de código.

## Instalación desde v7, con respaldo

Cierra la Terminal del servidor anterior con Ctrl+C. Descarga `Flowgorithm-Studio-v10-Academia.zip` y usa:

```bash
cd ~/Proyectos
cp -R Flowgorithm-Studio "Flowgorithm-Studio-respaldo-v7-$(date +%Y%m%d-%H%M)"
unzip -o ~/Downloads/Flowgorithm-Studio-v10-Academia.zip -d ~/Proyectos
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
```

Si `npm run verify` es correcto, usa **un único comando para Mac y teléfono**:

```bash
npm run dev:lan
```

En el Mac, abre la dirección **Local** (habitualmente `http://localhost:5173`). En el teléfono, con ambos dispositivos en la **misma red Wi-Fi**, abre la dirección **Network** que aparezca en la Terminal, por ejemplo `http://192.168.x.x:5173/`. La IP anterior es orientativa y NO debe copiarse: usa la que muestre tu Mac. Mantén el Mac encendido y la Terminal abierta. Si no conecta, revisa Wi-Fi y permisos del firewall de macOS.

Si no aparece `Network`, usa `ipconfig getifaddr en0` para consultar la IP del Wi-Fi y pon `http://<esa-ip>:5173/` en el navegador del teléfono.

### Modo sin conexión / PWA

Para preparar los archivos del modo offline:

```bash
npm run build
npm run preview:lan
```

- En macOS, **localhost** se considera contexto seguro y permite registrar el service worker, de modo que puedes probar offline después de abrir la versión compilada conectada al menos una vez.
- En el teléfono, **una IP local con HTTP no es un origen seguro**: puedes usar la app mientras haya conexión con el Mac, pero el modo offline/PWA instalable exige servirla bajo **HTTPS** (por ejemplo, al publicar el directorio `dist/` en un hosting HTTPS). No prometemos instalación offline desde `http://192.168...`.
- El progreso se guarda en el navegador/dispositivo que se usa. No se sincroniza automáticamente entre PC y teléfono. Para transferirlo: `Mi progreso → Guardar respaldo JSON` en el dispositivo origen y `Restaurar respaldo` en el destino.

## Dónde está cada cosa

- **Mis clases:** tutoriales introductorios con comprobación de conocimientos.
- **100 desafíos:** ejercicios graduados y sus pruebas con diferentes entradas.
- **Entrenar lógica:** 24 actividades interactivas, puntuación por habilidad y repasos.
- **Proyectos:** práctica final 096–100.
- **Mi progreso:** perfiles separados, estadísticas, tareas locales y respaldo/CSV.
- **Editor → Código visual:** selecciona un bloque y consulta una equivalencia explicada. Algunas son pseudocódigo didáctico; usa `Código generado` para el programa completo.
- **Editor → Así piensa tu algoritmo:** simulación reversible, memoria visual, pasos y decisiones.

## Límites importantes (no es una plataforma en la nube)

- **Sin registro en servidor, roles autenticados, notas centralizadas ni sincronización online.** El módulo docente es una **herramienta local** para un dispositivo o navegador compartido; sus perfiles no deben tratarse como cuentas protegidas.
- **Sin colaboración multiusuario en tiempo real ni corrección mediante IA.** La ayuda del entrenador usa reglas y mensajes de ejecución.
- **Sin soporte completo de todas las características del Flowgorithm de escritorio** (p. ej., gráficos tortuga y matrices nativas). El soporte didáctico de matrices utiliza arreglos lineales y fórmulas de índice.
- Las equivalencias individuales al código son **orientativas**, especialmente en C/C++ y lectura de datos; el generador de código sigue siendo una función separada.
- Los ejercicios del catálogo estaban listos en v6 y siguen disponibles. No se añaden 100 nuevos; se mejoran las maneras de aprender con ellos.
- Una PWA con recursos precargados no significa que los avances se compartan entre dispositivos. Los datos no se envían a un servidor.

## Verificación

`npm run verify` ejecuta ESLint, Vitest y `tsc --noEmit && vite build`, y posteriormente prepara el cache offline del build. Antes de empaquetar se ejecutó TypeScript estático con declaraciones provisionales, y pruebas directas de los nuevos algoritmos de repaso/perfiles; **la verificación real de dependencias React/Vite se debe confirmar en tu Mac** porque no se pudieron instalar por red en el entorno de creación.
