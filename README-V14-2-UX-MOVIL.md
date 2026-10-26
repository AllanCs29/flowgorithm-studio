# Flowgorithm Studio v14.2 · UX móvil para principiantes

Esta versión parte de la **v14.1** y se puede descomprimir encima del repositorio local, sin tocar `.git`, sin borrar el progreso ni cambiar el diseño de PC. La barra del editor se enfoca en Añadir, Un paso, Ejecutar y Comprobar.

## Hallazgos y correcciones

1. **Valores prellenados**. Antes, Si se creaba con `true`, Mientras con `false`, Asignar con `0`, etc. Ahora los campos que debe completar el estudiante empiezan vacíos. El tipo de dato Integer sigue siendo el tipo inicial del desplegable; no es una respuesta numérica del ejercicio.
2. **Errores incomprensibles**. No se ejecuta ni se comprueba un diagrama con un bloque sin terminar: se abre ese bloque y se explica qué falta. Las etiquetas incompletas aparecen en el diagrama con un borde discontinuo.
3. **Demasiados pasos para insertar**. En iPhone, tocar una pieza la coloca directamente (cuando hay un único destino). La explicación sigue disponible tocando ⓘ, pero ya no interrumpe obligatoriamente el recorrido. En PC se conserva el comportamiento anterior.
4. **Ayuda que parece una respuesta**. Los ejemplos son pistas bajo un control desplegable. El estudiante debe escribir sus datos y guardar. Los campos necesarios se indican de forma explícita.
5. **Poco espacio en iPhone**. La indicación de lo que hay que hacer pasa a una línea sobre el lienzo, sin tapar bloques, y los detalles de ejecución siguen plegados por defecto.
6. **Gestos accidentales**. Un deslizamiento táctil ya no intenta arrastrar ni seleccionar bloques; tocar sí abre la edición. El arrastre con mouse en Mac sigue disponible.
7. **Controles pequeños o teclado con zoom**. Botones principales y campos tienen blancos táctiles amplios y los inputs usan 16 px en iPhone para evitar que Safari haga zoom involuntario al enfocarlos.
8. **Colocar decisiones o ciclos**. Las opciones de inserción explican qué significa la rama Sí, la rama No y el cuerpo del ciclo. Hay pistas contextuales sin sobrecargar el diagrama.

## Validación en tu Mac

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

Prueba también desde el iPhone con la dirección `Network` de Vite. La validación visual física no puede sustituirse por pruebas de código.

## Checklist de usuario nuevo

- Entra a la primera misión y toca el bloque iluminado; debería abrirse el panel para configurarlo.
- Abre **Añadir** y selecciona **Si**. El rombo debe decir **Toca para configurar**, no `true`.
- Pulsa **Guardar bloque** sin condición: se indica que falta. Escribe `edad >= 18` y guárdalo.
- Prueba **Ejecutar** con otro bloque incompleto: debe llevarte a ese bloque y explicar qué falta.
- Desliza el dedo sobre el diagrama: debe desplazarse, no reubicar ni editar accidentalmente el bloque.
- Ejecuta paso a paso, abre y cierra detalles, realiza un reto y verifica el resultado en modo vertical y horizontal.
- En escritorio verifica la paleta, el arrastre y los paneles. En iPhone comprueba que se puede abrir la pantalla de edición cuando aparece el teclado.
- Tras actualizar GitHub Desktop, comprueba GitHub Actions y abre la PWA con conexión una vez para precargar la versión nueva.

**Nota:** los proyectos existentes mantienen los valores que ya se habían guardado. Solo los bloques nuevos se crean en blanco. Si el curso te entrega una plantilla con valores como parte deliberada del ejercicio, esa plantilla no se borra.
