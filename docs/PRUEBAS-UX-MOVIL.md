# Guía práctica para evaluar la experiencia móvil

**Objetivo:** comprobar que una persona principiante puede estudiar por su cuenta en iPhone. Esta guía es una **lista de pruebas pendientes**, no un informe de resultados ya observados.

## Preparación

- iPhone con Safari, probar desde la app instalada y desde Safari normal.
- Repetir en pantalla pequeña (aprox. 375 px CSS de ancho) y en otra mayor si hay dispositivos disponibles.
- Guardar una copia del progreso antes de limpiar almacenamiento. No usar «Borrar datos del sitio» como primer paso para depurar problemas.
- No orientar a la persona durante las tareas. Registrar qué intentó, en qué se confundió y qué dijo espontáneamente.

## Tareas observables

| Tarea | Lo que debería resultar evidente |
| --- | --- |
| 1. Abrir la primera clase | Identificar el botón para empezar y el bloque Inicio |
| 2. Encontrar la explicación de una figura | Tocar la figura, ver para qué sirve y volver sin perder contexto |
| 3. Insertar una Salida | Encontrar Piezas, insertar la figura y reconocer dónde quedó |
| 4. Insertar un Si | Condición vacía; explicar por qué hay dos rutas; escribir una condición propia |
| 5. Ejecución paso a paso | Ver el bloque activo y cómo cambia la variable sin que un panel tape todo el dibujo |
| 6. Revisar resultado | Comprender si se mostró algo y si se obtuvo un error de ejecución |
| 7. Corregir el reto de edad | Mostrar `edad` sin imponer el valor 0, 7 o cualquier cifra predeterminada |
| 8. Consultar el código | Encontrar `〈/〉`, volver al diagrama y conservar la edición |
| 9. Volver a una clase | Regresar a una clase anterior sin borrar progreso |
| 10. Ir a la siguiente clase | Al aprobar, avanzar a la lección que corresponde |
| 11. Probar offline | Abrir la app desde su icono después de preparar la caché y activar modo Avión |

## Interfaz y accesibilidad

- Verificar que botón principal, diagrama, teclado virtual y campo activo no se oculten entre sí.
- Probar orientación vertical, teclado de iOS, zoom, desplazamiento del diagrama y cierre de paneles.
- Comprobar que no haya más de una acción primaria por panel ni botones diferentes con el mismo efecto y nombre confuso.
- Probar VoiceOver en al menos las acciones esenciales, etiquetas de los controles y posibilidad de cerrarlos.
- Usar un contraste legible y zonas táctiles aproximadas de 44×44 puntos donde sea posible.
- Probar modo sin conexión, actualización con conexión restablecida y protección del progreso local.

## Registro recomendado (sin información personal)

Para cada tarea registra: **completó sin ayuda (sí/no)**; **cuántos intentos**; **error observado**; **qué esperaba encontrar**; **mejora sugerida**. No publiques capturas con nombres, direcciones o datos del alumno.

**Criterio de prioridad:** arreglar primero bloqueos para iniciar, insertar, ejecutar, comprobar y volver; después reducir pasos; finalmente ajustes visuales y ornamentales.
