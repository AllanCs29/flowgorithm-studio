# Auditoría funcional, pedagógica y de contenido · v14.4

**Base auditada:** archivo completo de Flowgorithm Studio v14.3.1. **Fecha:** 2026-10-26.

## Alcance y método

Se revisaron la estructura del proyecto, contenidos del curso, rúbricas, casos de prueba del banco de 100 retos, parser e intérprete, generación de código, interacción en móviles, modo offline, publicación y documentación. Se contrastaron elementos de sintaxis con [operadores](https://flowgorithm.org/documentation/operators.html) y [declaraciones](https://www.flowgorithm.org/documentation/language/declare.html) de Flowgorithm oficial.

**Lo que NO se analizó:** telemetría real de estudiantes, sus sesiones, tasas de aprobación reales, respuestas de encuestas, medidas de accesibilidad automatizadas completas ni pruebas físicas en iPhone. No existen datos conectados que permitan inferir esos resultados. Los resultados siguientes describen el **dataset interno de pruebas**, no el comportamiento de personas.

## Inventario cuantitativo de pruebas

| Métrica | Conteo |
| --- | ---: |
| Clases guiadas | 16 |
| Niveles de clases | 11 |
| Retos del catálogo | 100 |
| Retos de programación con ejecución automática | 94 |
| Microretos de interacción, evaluados por eventos | 6 |
| Casos de entrada/salida en los retos programáticos | 224 |
| Retos programáticos con dos o más casos | 69 |
| Retos programáticos con un caso | 25 |
| Soluciones modelo que dieron el resultado esperado en los casos definidos | 94/94 |
| Plantillas iniciales programáticas que requieren corrección | 94/94 |

Los 6 microretos de interacción no tienen casos de salida del programa: comprueban operaciones como insertar, seleccionar o borrar bloques. No deben mezclarse sus métricas con las de ejecución.

### Cobertura por mundo

| Mundo | Retos | Casos programáticos |
| --- | ---: | ---: |
| 1 | 10 | 4 |
| 2 | 10 | 10 |
| 3 | 10 | 23 |
| 4 | 10 | 34 |
| 5 | 10 | 20 |
| 6 | 10 | 27 |
| 7 | 10 | 30 |
| 8 | 10 | 22 |
| 9 | 8 | 14 |
| 10 | 7 | 21 |
| 11 | 5 | 19 |
| **Total** | **100** | **224** |

**Interpretación:** 25 retos programáticos tienen un solo caso de ejemplo, especialmente en los primeros mundos. Es una cobertura limitada contra soluciones memorizadas. Por ello reforzamos la evaluación del **flujo y el uso de variables**; quedan pendientes casos de borde adicionales y evaluación con alumnos reales.

## Hallazgos y correcciones implementadas

| Prioridad | Hallazgo | Cambio |
| --- | --- | --- |
| Alta | La Salida podía mostrar un resultado fijo en algunos retos y aprobar una muestra | Se obtienen del modelo las variables que la Salida debe leer y se exige ese uso en el diagrama |
| Alta | Un bloque desconectado podía contar como evidencia del bloque requerido | La rúbrica considera solo nodos accesibles desde Inicio |
| Alta | Los retos enseñaban `+` para unir cadenas, contrario a Flowgorithm original | Se sustituyó por `&` en los modelos y explicaciones de los retos afectados |
| Alta | Los generadores podían emitir `&` como operador inválido o con semántica distinta | Traducción explícita para Python, JavaScript, Java y C++; rechazo informado en C donde no se puede garantizar semántica segura |
| Media | Un ejemplo resuelto visible antes de intentarlo facilitaba copiar la respuesta | Se mantiene como referencia opcional, inicialmente contraída |
| Media | La misión «Mi primera variable» seguía describiendo el valor inicial 0 como comprobación | El catálogo ahora exige declarar y mostrar la variable, sin fijar un número |
| Media | Instrucciones genéricas no aclaraban que algunos retos parten de un diagrama con un error intencional | Guía de cuatro pasos: objetivo, localizar, corregir y comprobar |
| Media | Precedencia de comparaciones y negación unaria, y alias `mod`, no seguían por completo la tabla de Flowgorithm | Se ajustó el parser y la traducción de `mod` a otros lenguajes |
| Media | GitHub Pages compilaba sin comprobar las pruebas automáticas | Se añadió `npm run verify` como barrera antes del despliegue |
| Media | README principal, manifiesto y compatibilidad presentaban versiones o límites antiguos | Documentación de v14.4, explicación de instalación y ruta actual de GitHub Pages |

### Decisiones para preservar compatibilidad

El intérprete todavía admite `+` con cadenas en programas guardados de versiones anteriores, pero **el curso nuevo enseña `&`** como sintaxis de Flowgorithm. El exportador y los generadores continúan siendo una **implementación parcial**, no una réplica certificada. Se prioriza señalar errores de compatibilidad antes que inventar resultados.

## Criterios educativos revisados

1. **Objetivo antes de respuesta:** el alumno conoce qué debe construir, pero no recibe la solución automáticamente.
2. **Explicación pequeña y concreta:** una acción y un concepto central por paso; variables como *cajitas* que guardan datos.
3. **Modelo mental visible:** resaltar la instrucción y el estado antes/después; no confundir valor inicial con resultado calculado.
4. **Evaluación por mecanismo:** no basta con mostrar `15` si se pide calcularlo, ni escribir `7` si el reto requiere mostrar una variable.
5. **Retroalimentación accionable:** indicar la pieza o variable que falta, no solo comparar cadenas crudas de salida.
6. **Práctica recuperable:** repasar clases y corregir sin reiniciar todo el avance.

## Validación técnica efectuada en esta sesión

- Compilación sin errores de tipos de los módulos puros auditados (dominio, parser, aprendizaje, intérprete y generadores).
- Ejecución aislada de las 224 muestras sintéticas sobre las 94 soluciones modelo: resultados correctos.
- Evaluación de 94 soluciones modelo: aprobadas; 94 plantillas programáticas iniciales: rechazadas; los 6 microretos se validan por gestos.
- Pruebas directas añadidas para rechazar números fijos en Salida y bloques desconectados, así como comprobar traducción del operador `&`.
- Revisión de sintaxis de 97 archivos TypeScript/TSX y estructura de los archivos móviles, sin ejecución del navegador.
- 17 pruebas seleccionadas del repositorio ejecutadas en un arnés aislado que reproduce las aserciones usadas (6 de auditoría, 8 de parser y 3 de generadores); **no sustituyen la ejecución oficial de Vitest**.
- Comprobación sintáctica real de los ejemplos de concatenación generados para C++, Python y JavaScript.

**No fue posible ejecutar `npm run verify` completo** porque este entorno no tiene las dependencias npm y el intento de instalación offline no encontró todos los paquetes. No se realizó una prueba física de iPhone, VoiceOver, carga por red lenta ni Firebase. Son puntos **pendientes**, no comprobaciones aprobadas.

## Pendientes priorizados

1. Ejecutar `npm run verify` y corregir cualquier regresión que aparezca en la máquina del proyecto. Generar y subir `package-lock.json` validado; revisar `npm audit` y dependencias con criterio.
2. Evaluar a **3–5 personas que no hayan usado Flowgorithm**, sin darles indicaciones, con la guía `PRUEBAS-UX-MOVIL.md`. Registrar tarea, error y tiempo de forma voluntaria y sin datos personales.
3. Agregar casos de borde en los 25 retos de una sola muestra y pruebas de equivalencia estructural para más mecanismos.
4. Revisar en navegador real: teclado virtual, paneles, diagramas grandes, VoiceOver, estados offline y actualización de la PWA.
5. Ampliar la paridad `.fprg`, alias de funciones, identificadores y conversiones con una suite de conformidad contra Flowgorithm original.
6. Valorar login y sincronización con Firebase **después** de definir un modelo de datos, reglas de seguridad y migración respetuosa del progreso local.
