# Flowgorithm Studio — Rediseño UX/UI v4

El editor se reorganizó para dar protagonismo al diagrama y evitar que los usuarios se pierdan entre la paleta, el código, la consola y los ejercicios.

## Antes de empezar

1. En el modo **Aprender**, usa la pestaña **Lección** (izquierda) y sigue los pasos. Abre **Piezas** cuando necesites elegir un bloque.
2. Cada bloque nuevo tiene un botón **ⓘ** que abre su explicación y ejemplo. Al aceptar el tutorial podrás colocarlo.
3. Haz clic en un bloque del diagrama. Las **Propiedades** aparecen a la derecha.
4. Tras elegir una pieza, usa los botones **＋ Después / Antes de Fin / Rama Sí / Rama No / Cuerpo del ciclo**. También aparecen junto al bloque seleccionado en el diagrama.
5. Modifica sus campos y pulsa **Aplicar cambios**.
6. Ejecuta el diagrama, observa el resultado en **Consola** o revisa las variables en **Datos**.
7. En el modo **Aprender**, resuelve una misión y pulsa **Comprobar mi solución** para validar varias entradas.

## Modos

- **Aprender**: guía de clases, pistas y comprobación de retos.
- **Practicar**: herramientas para trabajar en problemas con menos indicaciones.
- **Libre**: espacio para diseñar un diagrama propio.

Los paneles tienen desplazamiento interno, pestañas, botones para ocultarlos y un diseño adaptable a tablet o móvil. La paleta admite tocar y colocar (incluido en móvil) y arrastrar y soltar (escritorio). No es un editor de posiciones XY arbitrarias: todas las inserciones y movimientos conservan la estructura del diagrama.

## Límites intencionales

- **Si** es una bifurcación. **Mientras**, **Hacer mientras** y **Para** son ciclos; cada uno conserva su flecha de retorno.
- Llamar función y Retornar se muestran para aprender su concepto, pero las funciones anidadas no se ejecutan en esta versión.
- El formato `.fprg` solo admite el subconjunto descrito en `docs/COMPATIBILITY.md`.

## Instalar y verificar en macOS

Desde `~/Proyectos/Flowgorithm-Studio`, mantén tu respaldo fuera de la carpeta del proyecto y ejecuta:

```sh
npm install
npm run verify
npm run dev
```

Abre la URL anunciada por Vite, por ejemplo `http://localhost:5173`.

## Componentes principales

- `src/ui/App.tsx`: estado y composición de los tres modos.
- `src/ui/GuidedLesson.tsx`: lecciones y misiones contextuales.
- `src/ui/BlockPalette.tsx`: catálogo de piezas y búsqueda.
- `src/ui/FlowchartCanvas.tsx`: diagrama y destinos de inserción accesibles.
- `src/ui/v4.css`: diseño, scroll independiente y responsive.
- `src/ui/LearningCenter.tsx`: biblioteca de clases, guías y niveles.

Las instrucciones de las clases son guías interactivas; la aprobación de los ejercicios exige superar las pruebas del motor. El botón «Siguiente» de los pasos de lectura no significa que la acción ya se haya verificado automáticamente.

## Lista de comprobación manual (navegador)

Estas interacciones requieren prueba visual, además de `npm run verify`:

- En una pantalla de escritorio, entra en **Piezas**, desplaza el panel izquierdo hasta encontrar **Comentario** y vuelve a subir sin desplazar el lienzo.
- Abre **ⓘ** del bloque **Salida**, lee el ejemplo y selecciona **Entendido, quiero usar este bloque**.
- Selecciona **Inicio**. Comprueba que se ofrecen los destinos y que **＋ Después** inserta una Salida.
- Cambia la Expresión en **Editar**, pulsa **Aplicar cambios** y ejecuta; revisa **Consola** y **Datos**.
- En un bloque **Si**, comprueba que aparecen **Rama Sí** y **Rama No**; en **Mientras**, **Hacer mientras** y **Para**, **Cuerpo del ciclo**.
- Comprueba el cambio entre **Aprender**, **Practicar** y **Libre**, el cierre de los paneles y el modo horizontal.
- Repite en un ancho inferior a 700 px (móvil o emulación de Chrome); la lección debe aparecer antes del lienzo en modo Aprender y los paneles deben desplazarse por separado.
- Abre un reto, cambia su diagrama y pulsa **Comprobar mi solución**; no debe aprobar por avanzar manualmente entre pasos.
- Prueba **Abrir**, **Guardar**, **Deshacer**, **Rehacer** y **Exportar .fprg**.

Ninguno de los botones de navegación de pasos equivale a aprobar un ejercicio: esa validación solo ocurre al comprobar las entradas y salidas contra las pruebas del reto.
