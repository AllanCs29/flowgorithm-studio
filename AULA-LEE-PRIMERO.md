**ACTUALIZACIÓN v6 COMPLETA:** las 100 prácticas están habilitadas. Antes de iniciar, lee `README-V6-COMPLETA.md`. Los 6 primeros retos de manejo del editor se validan mediante acciones reales.

---

**ACTUALIZACIÓN v6:** Para iniciar, abre `README-V6.md`. El catálogo de 100 desafíos ya incluye 70 prácticas ejecutables y 30 fichas en preparación.

# Flowgorithm Studio — Aula intuitiva v3

Esta versión expande el proyecto de Flowgorithm Studio con aprendizaje progresivo y una edición estructural más clara.

## Inicio rápido en macOS

Si todavía tienes la versión anterior en `~/Proyectos/Flowgorithm-Studio`, haz primero una copia de seguridad fuera de esa carpeta (para que ESLint no analice respaldos antiguos). Después extrae este ZIP dentro de `~/Proyectos`, reemplazando los archivos fuente con los de esta versión. Conserva tu carpeta `node_modules` local (no viene en el ZIP).

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm run verify
npm run dev
```

Abre la dirección local que muestre Vite (normalmente http://localhost:5173).

## Cómo usarlo

1. Al abrir la app por primera vez aparece el aula. También se abre desde **🎓 Clases y niveles**.
2. Elige una clase y navega paso a paso. Cada clase presenta qué hace una instrucción y un diagrama simplificado.
3. Abre la misión correspondiente. Se muestra un paso de la misión a la vez.
4. Si hay que agregar una pieza, pulsa su botón en la paleta de la izquierda. Si es la primera vez, antes verás su explicación; luego pulsa **Entendido, quiero usar este bloque**.
5. Haz clic (o toca) un bloque existente del lienzo. Usa los botones grandes **Después**, **En rama Sí**, **En rama No** o **Dentro del ciclo**. En escritorio también puedes arrastrar un bloque de la paleta y soltarlo sobre otro bloque para insertarlo después; para ramas usa los botones explícitos.
6. Configura sus propiedades en la izquierda y pulsa **Aplicar cambios**.
7. Usa **Paso a paso** para seguir la ejecución, o **Ejecutar**. El resultado y las variables aparecen a la derecha.
8. Pulsa **✓ Comprobar** para validar varios casos; la misión siguiente se desbloquea al aprobar todos. El progreso se guarda localmente en el navegador.

## Ruta de aprendizaje

Hay **14 clases y 14 misiones**, distribuidas en **10 niveles**:

- Niveles 1–2: recorrido, Inicio/Fin, Salida, Declarar y Asignar.
- Niveles 3–4: Entrada, Si/Sino, operadores y casos límite.
- Niveles 5–7: Mientras, Hacer mientras, Para, comentarios y depuración.
- Niveles 8–10: acumuladores, factorial y proyecto final de promedios/aprobación.

Cada misión incluye instrucciones, pista, bloques requeridos y comprobación real mediante el intérprete con entradas y salidas esperadas. Las lecciones y la ruta progresiva están inspiradas en la documentación oficial, pero los ejercicios y tests son propios de este proyecto.

## Decisiones vs ciclos

**If / Si** es una **decisión**: condición → **Sí** o **No** → unión. **No se repite** por sí sola. Los ciclos son **Mientras (While)**, **Hacer mientras (Do)** y **Para (For)**, que poseen una flecha de retorno visual al control.

Referencia oficial:
- [Flowgorithm: documentación general](https://www.flowgorithm.org/documentation/index.html)
- [If](https://www.flowgorithm.org/documentation/if.html)
- [While](https://flowgorithm.org/documentation/language/while.html)
- [Do](https://www.flowgorithm.org/documentation/language/do.html)
- [For](https://www.flowgorithm.org/documentation/language/for.html)
- [Declarar](https://flowgorithm.org/documentation/declare.html)

## Alcances actuales

- **Call** (llamadas a funciones) todavía no se ejecuta en el intérprete; **Return** no dispone aún de pila completa de llamadas. El aula lo señala expresamente.
- Arreglos: se declaran, pero la indexación de elementos en expresiones/asignaciones aún no está implementada.
- La compatibilidad `.fprg` es un subconjunto; pueden existir diferencias frente al Flowgorithm original.
- Los ejemplos gráficos muestran claramente las ramas/ciclos en disposición vertical. La disposición horizontal es experimental.
- Las pruebas automáticas validan casos definidos, no prueban matemáticamente que un algoritmo sea correcto para toda entrada posible.
- Este archivo ZIP no incluye dependencias ni sustituye un test de usabilidad real con usuarios de móvil y escritorio.

## Verificación técnica

El ZIP contiene las pruebas originales y nuevas pruebas para aprendizaje y layout, además de los arreglos previos de TypeScript/lint. Ejecuta en tu Mac **`npm run verify`** para comprobar lint, Vitest y build con tus dependencias. Si falla, comparte el registro exacto.
