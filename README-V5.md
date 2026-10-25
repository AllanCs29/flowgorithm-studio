# Flowgorithm Studio v5 — Aprender lógica desde cero

## Qué cambia

Esta versión sustituye la pantalla de bienvenida basada en paneles por una **ruta completa de aprendizaje**, diseñada para que alguien sin conocimientos previos sepa qué hacer desde el primer toque.

### Desde el inicio

1. Aparece una página con la siguiente lección recomendada y el progreso guardado.
2. Entras a una clase corta: tres explicaciones visuales de una sola idea cada una.
3. Respondes una pregunta breve. Si falla, puedes volver a intentarlo sin penalización.
4. Abres un diagrama práctico preparado para el reto; un bloque iluminado indica dónde tocar.
5. Tocas el bloque → Editar, o usas + Pieza → explicación → ubicación → edición.
6. Ejecutas, observas el resultado y haces **Comprobar mi reto**.
7. Solo si el algoritmo supera los casos automatizados, se desbloquea la siguiente lección.

**El tutorial no reemplaza la prueba:** resolver la pregunta conceptual no aprueba el reto; aprobar requiere que el algoritmo real produzca las salidas esperadas para todas las entradas definidas.

### En móvil

- Una pantalla a la vez, sin tres columnas comprimidas.
- Barra inferior fija: **Mi reto / Piezas / Editar / Resultado / Más**.
- Piezas, propiedades y consola se muestran en hojas inferiores desplazables.
- Insertar bloques se puede hacer tocando. Arrastrar no es necesario ni obligatorio.
- Diagrama desplazable horizontal y verticalmente; acercamiento con +/−.
- Áreas táctiles grandes y soporte de zona segura inferior (`safe-area-inset-bottom`).
- Pantalla de clases vertical y legible, sin desplazamiento bloqueado.

### En computadora

- Curso en la pantalla inicial, lección a pantalla completa y editor centrado en el diagrama.
- Una columna muestra los pasos de la misión y **sí tiene scroll propio**.
- Biblioteca de piezas se despliega lateralmente sin bloquear el lienzo para permitir arrastrar.
- Inspección, código, resultado y variables se abren bajo demanda.
- Selección, teclado y comandos estructurales de la versión anterior se conservan.

### Progreso y borradores

El navegador guarda de forma local:
- Retos completados: `flowgorithm-studio:completed-exercises`
- Piezas que ya aprendiste a usar: `flowgorithm-studio:seen-blocks`
- Borrador de cada reto en curso: `flowgorithm-studio:lesson-draft:<id>`

Al completar correctamente un reto se elimina su borrador y queda disponible la clase siguiente. Si borras los datos del sitio, ese progreso local también se borra. La exportación manual JSON/.fprg está en **Más → Mi proyecto**.

### Compatibilidad con Flowgorithm

- **Si** decide entre ramas verdadera/falsa.
- **Mientras, Hacer y Para** son bloques repetitivos.
- Los ejercicios y ejemplos son adaptaciones pedagógicas del uso documentado de los símbolos; no son copias de manuales externos.
- `Call` y `Return` aparecen marcados como no ejecutables en la paleta actual.
- Los ejercicios verifican valores específicos del intérprete interno; no garantizan compatibilidad completa con todos los programas .fprg ni con todos los lenguajes generados.

## Instalar sobre tu v4 (Mac)

Guarda el ZIP descargado en `~/Downloads`:

```bash
cd ~/Proyectos
cp -R Flowgorithm-Studio "Flowgorithm-Studio-respaldo-v4-$(date +%Y%m%d-%H%M)"
unzip -o ~/Downloads/Flowgorithm-Studio-Aprender-v5.zip -d ~/Proyectos
cd Flowgorithm-Studio
npm install --include=dev
npm run verify
```

Cuando `verify` termine correctamente:

```bash
npm run dev
```

Visita http://localhost:5173 y recarga con Cmd + Shift + R si ya había una versión anterior abierta.

Para verlo en el **teléfono** conectado a la misma red Wi-Fi, inicia el servidor con `npm run dev -- --host 0.0.0.0` y abre en el móvil la IP local del Mac con el puerto mostrado. Si macOS pregunta por permisos de red, autorízalos solo en tu red de confianza. Alternativamente, puedes desplegar la carpeta `dist` en un hosting estático con HTTPS.

## Calidad de la entrega

**Verificaciones realizadas en el entorno de creación:**
- Transpilación/sintaxis de 52 archivos fuente TS/TSX: sin errores.
- Comprobación semántica de TypeScript con definiciones locales provisionales para React: sin errores.
- Ejecutor alternativo: 53 pruebas aprobadas de 57. Cuatro pruebas XML requieren `DOMParser` de Vitest/jsdom y fallaron en este ejecutor por la ausencia de esa API; no hubo una regresión XML constatada.

**Pendiente:** compilación real con dependencias instaladas y pruebas de interacción visual en Chrome/Safari. Por eso debes ejecutar `npm run verify` y probar en navegador antes de considerar validada la interfaz en tu equipo.
