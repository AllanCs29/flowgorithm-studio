# Flowgorithm Studio v14.3 · Retos claros y paneles móviles

## Qué corregimos

1. **Mi primera variable**: el reto revisa que se declare `edad` como `Integer`, que el bloque Declarar esté antes de Salida y que Salida lea `edad` **sin comillas**. No impone `0`, ni exige un bloque Asignar. `edad = 7` seguido de Salida `edad` también es válido.
2. **Comprobar no es Ejecutar**: el evaluador ejecuta los casos de prueba sin alterar la salida que el alumno vio en el simulador. Si no supera el reto, se muestra un panel sencillo de qué revisar, separado de Resultado del programa. Los avisos evitan las cadenas técnicas `"0\n"`.
3. **Comprobar el flujo**: se evalúa la presencia y función de las piezas necesarias (declaración, asignación, lectura de variables, ramas y ciclos según el reto), además de entradas y salidas cuando el ejercicio lo requiere. Los 100 desafíos progresivos conservan sus pruebas y se añade una comprobación para evitar respuestas fijas que ignoran los datos de Entrada. Los microretos de gestos conservan su evaluación de interacción.
4. **Siguiente clase**: después de aprobar se abre directamente el tutorial de la clase siguiente. En la última clase se vuelve al índice.
5. **Código accesible**: el botón `〈/〉` de la cabecera móvil abre Código generado para ver el diagrama traducido a Python, JavaScript y otros lenguajes.
6. **Paneles menos invasivos**: Resultado, Ver pasos, Código y el detalle del simulador ocupan menos altura; al abrirlos se conserva visible una porción del diagrama. Los controles repetidos de ejecución se retiran del panel de detalle en móvil: permanecen en la barra inferior.

La vista de escritorio mantiene su configuración. Los estilos de la revisión están aislados en `src/ui/v14-3-mobile.css` bajo `@media(max-width:760px)`.

## Verificar en Mac

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

Para la revisión en teléfono, utiliza la dirección `Network` de Vite con ambos dispositivos en la misma Wi-Fi. Una vez verificado, usa GitHub Desktop > **Commit to main** > **Push origin**. GitHub Pages publicará la versión compilada desde el workflow existente.

## Prueba de aceptación sugerida en iPhone

- Nivel 2, **Mi primera variable**: inserta `Declarar edad Integer` antes de `Salida edad`. El reto debe pasar aunque el valor inicial sea 0 y no exista Asignar.
- Agrega un bloque Asignar `edad = 7` entre Declarar y Salida; también debe pasar. Si cambias Salida por `7` o `"edad"`, debe explicar que no está leyendo la variable.
- Abre **Así piensa tu algoritmo**: el panel de detalle no debe tapar todo el diagrama y sus controles no deben duplicarse.
- Pulsa `〈/〉` y revisa el código generado.
- Supera un reto y toca **Ir a la siguiente clase**: debe abrir el siguiente tutorial, sin pasar por la portada.
- Repite estas pruebas en escritorio: no debe haber cambios en el diseño principal.

## Validación disponible en el entorno de creación

- Comprobación de TypeScript de los módulos pedagógicos y del motor.
- 94 soluciones ejecutables del banco pasan; sus 94 plantillas sin corregir fallan como es debido (otros 6 microretos se validan por interacción).
- Pruebas de la regla `edad` con valor inicial y con reasignación a 7.
- Verificación estructural de los estilos y botones móviles.

**Pendiente**: ejecutar `npm run verify` completo con dependencias instaladas y validar visualmente en iPhone real. No se hizo una prueba física del dispositivo en este entorno.
