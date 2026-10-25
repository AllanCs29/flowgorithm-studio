# Flowgorithm Studio v11 · Aprender viendo

Esta actualización **parte de la v10 enviada por el usuario**. Mantiene el editor, el motor, las 14 clases iniciales, los desafíos, la práctica, la gestión local de perfiles, la exportación de código y el modo PWA. No modifica el formato de los proyectos ni reinicia deliberadamente el progreso.

## El problema que resuelve

En la clase «Asignar y hacer cuentas», la pregunta hablaba de `total ← total + 2` con `total = 3`, mientras el diagrama lateral mostraba `total ← 7 + 8`. Los dos ejemplos son correctos por separado, pero **no estaban conectados**: quien estudia desde cero podía confundir qué debía responder. En v11 la pregunta expresa el estado inicial, la operación y lo que debe averiguar, y el diagrama de la pregunta **contiene esos mismos valores**. Solo revela el cálculo final después de contestar correctamente.

## Qué cambia en la experiencia de estudio

- **14 recorridos visuales específicos**, uno por cada clase inicial. En vez de una tarjeta de texto estática, cada diagrama representa el ejemplo mediante bloques seleccionables y navegación por estados reales del ejemplo.
- **Resaltado del bloque actual:** cada paso indica qué parte del algoritmo está ocurriendo. Los bloques recorridos se diferencian de los que aún no se han recorrido.
- **Botones táctiles:** `Reiniciar`, `Siguiente paso`, progreso por puntos y `Reproducir / Pausar`. Se puede tocar un bloque directamente. Repeticiones como `Mientras`, `Hacer mientras`, `Para`, acumuladores y factorial reutilizan los mismos bloques y muestran el valor de cada vuelta.
- **Variables como cajitas:** una vista muestra los valores guardados a medida que cambia cada paso. En la clase Declarar hay una explicación con ejemplos de Integer, Real, String y Boolean; otras clases incluyen una mini explicación desplegable.
- **Resultado en pantalla:** se separa la memoria de las variables del texto mostrado en la consola.
- **Decisiones visuales:** las rutas Sí y No se ven separadas. El ejemplo indica qué rama se ha tomado y cuál no se ejecuta.
- **Preguntas más claras:** retroalimentación particular para la pregunta confusa, opción de revisar la explicación y recorrido desbloqueado después de acertar.
- **Diseño móvil:** una columna en pantallas pequeñas, texto legible y controles de ejecución separados de la respuesta.

Estos recorridos son **simulaciones explicativas de ejemplos concretos**, no un segundo intérprete y no sustituyen la ejecución real del editor. Para experimentar con cualquier algoritmo propio, entra al editor y utiliza `Paso a paso`, `Variables` y `Resultado` de la v10.

## Instalación sobre tu v10 en macOS

1. Detén la Terminal donde se ejecuta la versión anterior con `Ctrl+C`.
2. Guarda una copia de tu proyecto local. Desde Terminal:

```bash
cd ~/Proyectos
cp -R Flowgorithm-Studio "Flowgorithm-Studio-respaldo-v10-$(date +%Y%m%d-%H%M)"
```

3. Descarga el ZIP `Flowgorithm-Studio-v11-Aprender-Viendo.zip` y descomprímelo **sobre** el proyecto existente (para conservar archivos que puedas haber añadido localmente):

```bash
unzip -o ~/Downloads/Flowgorithm-Studio-v11-Aprender-Viendo.zip -d ~/Proyectos
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
```

4. Después de que `verify` termine sin errores, en esa misma Terminal ejecuta el comando habitual, válido para **Mac + teléfono**:

```bash
npm run dev:lan
```

En el Mac abre `http://localhost:5173` o la dirección `Local` que indique Vite. En el teléfono conectado a **la misma red Wi-Fi**, abre la dirección `Network` que indique Vite (algo similar a `http://192.168.x.x:5173`). No copies la IP de ejemplo; la tuya será diferente. Mantén la Terminal y el servidor abiertos mientras pruebas. Si no aparece Network, usa `ipconfig getifaddr en0` y abre `http://<IP-QUE-APAREZCA>:5173/`. Revisa los permisos del firewall de macOS si no se conecta.

**Importante:** el progreso de cada navegador sigue siendo local. No se sincroniza automáticamente entre Mac y teléfono. La app v11 no borra intencionalmente los datos de `localStorage`, pero conviene exportar el respaldo JSON desde «Mi progreso» antes de instalar.

## Lista rápida de comprobación

1. En **Mis clases → Nivel 2 → Asignar y hacer cuentas**, llega a la pregunta final. Debe mostrar una variable `total` con valor inicial `3` y el bloque `total ← total + 2`. Debe preguntar cuál es el valor final.
2. En cualquier explicación, pulsa **Siguiente paso**, **Reiniciar**, **Reproducir**, **Pausar** y toca directamente uno de los bloques. Comprueba que el resaltado, la memoria y el resultado cambian coordinadamente.
3. En **Declarar**, comprueba que se explica una **sola** cajita `edad: Integer` y que el recuadro de tipos de datos se puede desplegar.
4. En **Si / Sino**, verifica que solo una de las rutas muestra el resultado. En **Mientras**, verifica que al regresar al rombo el contador ha cambiado.
5. Repite 1–4 en un teléfono. No debería haber desplazamiento horizontal de toda la página ni botones tapados por el pie.
6. Entra al **editor**, ejecuta tu reto de la v10, guarda un archivo de prueba y prueba el panel **Variables** para confirmar que las funciones previas continúan.

## Validación de esta entrega

- Comprobación de TypeScript **del modelo didáctico** `learning.ts`, `courseFlow.ts` y `visualLessons.ts`: OK.
- Comprobación de TypeScript de `LessonScreen.tsx` y `VisualWalkthrough.tsx` con **declaraciones provisionales** de la API de React, por no poder instalar React real aquí: OK. Esto no reemplaza el typecheck de la compilación verdadera.
- Ejecución directa en Node de los 14 recorridos y revisión de sus referencias: OK.
- Se añadió `tests/visual-lessons.test.ts`, que espera ejecutarse con Vitest al hacer `npm run verify` en el Mac.
- **No** se pudo ejecutar el `npm run verify` completo aquí porque el registro npm no estuvo accesible durante la preparación. Tampoco se probó físicamente en Safari/Chrome móvil. Los pasos anteriores son comprobaciones para el Mac y el teléfono del usuario.

## Referencia didáctica

El proyecto mantiene la inspiración de Flowgorithm y utiliza el enlace del usuario a [«Aprendiendo la lógica de la programación. Aprende a programar desde 0»](https://www.youtube.com/playlist?list=PLDLnmbUDWFUtFTqLf_lS99z2gmYU5ouRv) como referencia de orientación. No se han descargado ni verificado todos los videos de esa lista: esta v11 se fundamenta en el problema identificado, los contenidos del curso existente y la progresión concreta de sus ejercicios.
