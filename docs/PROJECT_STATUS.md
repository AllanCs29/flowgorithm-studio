**Estado vigente: v6 completa — 100 retos habilitados, 94 de ejecución y 6 de interacción.** El material que sigue se refiere a versiones anteriores. Consulta `../README-V6-COMPLETA.md`.

---

# Estado actual: v6

Hay 14 clases del curso base y 100 problemas de laboratorio, 70 de ellos con ejecución y validación, 30 en preparación. Se implementó indexación de arreglos 1D y edición de elementos. Las notas históricas siguientes describen versiones anteriores, no la funcionalidad vigente.

---

# Estado de Flowgorithm Studio 0.2.0

## Cambios de esta revisión

- Añadido el centro de aprendizaje: ruta guiada, referencia de cada bloque, ejercicios de niveles 1–4, pistas, casos de prueba y guardado local del progreso.
- Corregida la ejecución de entrada: un valor inválido mantiene el estado `WAITING_INPUT` y permite reintentar sin reiniciar.
- El resaltado del diagrama señala el bloque que acaba de ejecutarse; el pie indica por separado el siguiente bloque pendiente. Mientras espera una entrada, permanece resaltado el bloque Entrada.
- Editar o reemplazar el diagrama reinicia el contexto de ejecución, evita referencias a nodos eliminados y borra las variables anteriores.
- `Paso a paso` procesa un bloque por clic; `Ejecutar` continúa tras cada entrada hasta terminar o pedir otra entrada. El contador y las etiquetas de bloque ejecutado/siguiente están separados para evitar confundir el resaltado con el siguiente punto de ejecución.
- Los ciclos `While`, `Do` y `For`, las ramas `If`, las continuaciones de ramas y el límite de pasos tienen cobertura adicional.
- El parser evalúa `and`/`or` con cortocircuito.
- Asignar a una variable no declarada genera un error explicado. Los arreglos ya no se tratan accidentalmente como su primer elemento: la indexación no soportada produce un mensaje explícito.

## Verificaciones previas registradas en el entorno de revisión

- `tsc --strict --noEmit` pasó para el dominio, la estructura, el parser, el intérprete y el contenido de aprendizaje.
- Comprobación sintáctica TypeScript/TSX con `transpileModule`: sin diagnósticos sintácticos.
- Compilación a JavaScript de los módulos puros e pruebas de humo directas: paso a paso, reintento de entrada, ramas true/false, Mientras, Hacer mientras, Para, cortocircuito lógico y límites del intérprete.
- Los seis retos se modificaron a sus soluciones esperadas y sus casos de prueba devolvieron la salida exacta.
- Se comprobaron las invariantes de cada proyecto inicial de ejercicio.

## No verificado en esta sesión

La instalación de paquetes npm volvió a agotar el tiempo disponible y no hay `node_modules` instalados. El `tsc --noEmit` global falla porque no puede resolver React y sus tipos, así que no constituye una verificación completa del proyecto. La instalación de paquetes npm falló previamente por un error de resolución DNS (`EAI_AGAIN` para `registry.npmjs.org`). Por lo tanto no se afirma que `npm run lint`, `npm test` o `npm run build` hayan pasado en esta máquina. Deben ejecutarse en un entorno con acceso al registro npm. Tampoco se ha hecho una prueba E2E visual del editor en un navegador real en este entorno.

## Límites conocidos

Esta es una reconstrucción desde la especificación y fragmentos previos, no el repositorio original byte a byte. La compatibilidad 1:1 con Flowgorithm no está completa. Las llamadas a funciones y los arreglos indexados todavía no son ejecutables por el intérprete; el resto de límites está en `COMPATIBILITY.md`.
