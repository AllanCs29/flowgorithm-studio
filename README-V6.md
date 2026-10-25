**ESTADO HISTÓRICO:** esta guía describe la primera entrega v6 (70 retos). Para la versión actual con 100 retos funcionales abre [README-V6-COMPLETA.md](README-V6-COMPLETA.md).

---

# Flowgorithm Studio v6 — Academia y laboratorio de lógica

## Lo nuevo

**Producto funcional, no solamente un plan.** La app comienza en Inicio con la ruta guiada de 14 clases de la versión anterior y un acceso destacado al **Laboratorio de 100 desafíos**. Está pensada para escritorio y teléfonos; el editor conserva inserción por toque, paneles inferiores y ejecución paso a paso.

- **100 ejercicios organizados en 11 mundos:** catálogo completo, buscador, filtros y explicación de cada problema.
- **70 prácticas ya ejecutables y calificables:** cada una tiene diagrama inicial, solución certificada, pistas y varios casos cuando procede. El diagrama inicial contiene un error deliberado que el estudiante debe corregir.
- **30 problemas aún en preparación:** aparecen identificados como tales y no permiten iniciarse con un editor incompleto. Incluyen actividades sobre acciones de UI, búsqueda avanzada/ordenamiento y funciones/recursión/proyectos completos.
- **Arreglos unidimensionales ejecutables:** `datos[0]`, `datos[i]`, escritura `datos[i] ← valor`, entrada en posiciones y longitud mediante `len(datos)`. Errores legibles para índices inválidos y tipos incompatibles.
- **Matrices didácticas mediante arreglo de una dimensión**, por ejemplo `mat[fila * 3 + col]` para una cuadrícula de tres columnas. No se afirma soporte nativo de matrices `mat[fila][col]`, que Flowgorithm tampoco documenta como arreglo bidimensional nativo.
- **Inspector corregido:** `Aplicar cambios` y `Cancelar edición` contrastados y explícitos, eliminación separada con confirmación.
- **Interfaz responsiva:** el catálogo abre la explicación automáticamente al seleccionar en móvil; el editor mantiene sus paneles inferiores y botones de inserción táctiles.
- **Progreso persistente local** para la ruta guiada y el laboratorio, con claves de almacenamiento compatibles con la v5. No hay cuenta ni sincronización entre dispositivos.

## Instalar en Mac

Después de hacer una copia de seguridad de tu carpeta `~/Proyectos/Flowgorithm-Studio`, extrae el ZIP en `~/Proyectos`. El ZIP contiene una carpeta `Flowgorithm-Studio`.

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev
```

Abre `http://localhost:5173` para usarlo en la Mac. En la pantalla principal, pulsa `100 desafíos` o `Explorar los 100 ejercicios graduados` para ver el nuevo laboratorio.

### En el teléfono

En la Mac, abre Terminal:

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm run dev -- --host 0.0.0.0
```

Con ambos dispositivos en el mismo Wi‑Fi, escribe **la dirección `Network` que muestra la Terminal de tu Mac** en el navegador del teléfono, por ejemplo `http://192.168.1.75:5173`. La dirección mostrada será diferente según tu red. Mantén la Terminal abierta.

## Verificación y límites

- `tests/v6-course.test.ts` añade comprobaciones de los 100 registros, la disponibilidad real, las 70 soluciones, las 70 plantillas defectuosas, la validación estructural, arrays/indexación y el código generado.
- En el entorno en que se construyó este ZIP se comprobó con TypeScript global la sintaxis y los tipos del código, usando declaraciones provisionales de React y Vitest. **No equivalen a compilar con las dependencias reales.**
- Se ejecutó el motor compilado con los 70 retos: **70/70 soluciones aprobadas**, **70/70 diagramas iniciales reprobados** (corrección necesaria) y **70/70 diagramas estructuralmente válidos**. No se pudieron correr en este entorno los tests Vitest ni Vite de producción por ausencia de dependencias instaladas.
- **`npm run verify` en tu Mac** es necesario antes de dar por aprobada la integración completa.
- `Call`/funciones del usuario y recursividad todavía no se ejecutan en el intérprete actual, por eso los desafíos 89–95 están pendientes. La generación C marca semánticas no soportadas como `COMPATIBILITY_UNKNOWN`, en vez de inventar resultados.
- Salvo las 70 prácticas certificadas, el catálogo es un temario **en desarrollo**, no una promesa de que las 100 prácticas ya estén completas.

## Fuentes pedagógicas

- Documentación oficial de Flowgorithm: https://flowgorithm.org/documentation/index.html
- Operadores y expresiones: https://flowgorithm.org/documentation/operators.html
- Recursos con colecciones educativas: https://flowgorithm.org/resources/index.html

Las descripciones del catálogo proceden del plan original de 100 ejercicios creado para este proyecto, no de una reproducción íntegra de libros de terceros.
