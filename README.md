# Versión actual: v12.2 · Explicaciones y pruebas corregidas

Lee primero [README-V12-2.md](README-V12-2.md) para instalar y verificar la versión más reciente en Mac y teléfono. La guía [v12.1](README-V12-1.md) sigue disponible como historial.

**Empieza por [README-V12.md](README-V12.md)**. Los diagramas del aula y editor ahora emplean símbolos, figuras y operadores de Flowgorithm original; las primeras clases incluyen explicaciones previas de cero y un laboratorio de área del círculo con radio interactivo. Para ejecutar en **Mac y teléfono** utiliza `npm run dev:lan`.

> Los documentos de versiones anteriores se conservan como historial de desarrollo.

---

# Historial: v7 — Simulación visual

Lee **[README-V7.md](README-V7.md)** para instalar y utilizar la nueva ejecución animada, memoria visual y predicciones.

---

**Historial: v6 completa (100/100 retos practicables).** Empieza por [README-V6-COMPLETA.md](README-V6-COMPLETA.md). Este documento contiene notas históricas de las versiones anteriores.

---

**Versión v6:** Comienza por [README-V6.md](README-V6.md). Incluye 100 desafíos catalogados, de los cuales 70 son practicables y 30 están en preparación.

---

# Flowgorithm Studio v5 — Aula para aprender lógica

**Nueva experiencia móvil y de escritorio:** abre directamente la pantalla de lecciones. [Lee la guía de v5](README-V5.md).

**Rediseño UX/UI v4:** consulta [README-V4.md](README-V4.md) para los tres modos, nuevas pestañas, desplazamiento de paneles y checklist de pruebas manuales.

# Flowgorithm Studio — editor estructural y aula guiada

Editor web experimental de diagramas de flujo con estructura determinista al estilo Flowgorithm. Incluye el dominio tipado, edición estructural validada, layout separado del AST, intérprete paso a paso, generadores separados y una ruta de aprendizaje en español.

> **Continuidad:** este paquete se reconstruyó a partir de las especificaciones y fragmentos del trabajo previo recuperables en la conversación. No es una copia byte a byte del repositorio original ni una afirmación de paridad 1:1 con Flowgorithm.

## Inicio rápido

Requisitos: Node.js 20+ y npm.

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Aprender dentro de la aplicación

Pulsa **Aprender** en la barra superior. Hay tres secciones:

- **Empezar:** tutoriales guiados sobre el flujo, variables, entrada/salida, decisiones y ciclos.
- **Qué hace cada bloque:** referencia con propósito, ejemplo y consejo para cada bloque de la paleta.
- **Ejercicios por nivel:** seis retos iniciales con pistas y casos de prueba. Abre un reto, modifica el diagrama y pulsa **Comprobar reto**. El progreso se guarda localmente en el navegador cuando el almacenamiento está disponible.

## Ejecutar y depurar

- **Paso a paso** ejecuta un solo bloque y resalta el siguiente bloque que se va a ejecutar.
- **Ejecutar** avanza hasta terminar, llegar a una entrada o alcanzar el límite de seguridad.
- Cuando un bloque Entrada pide un valor, la ejecución queda en espera. Una entrada inválida muestra el error y permite corregirla sin reiniciar.
- **Reset ejecución** reinicia variables, salida y contador. Si editas el diagrama, la ejecución se reinicia automáticamente para no conservar un puntero a un bloque antiguo.
- La consola muestra la salida; el panel Variables muestra el estado después de cada paso.

## Verificación

```bash
npm run lint
npm test
npm run build
# todo junto
npm run verify
```

Los tests cubren dominio, parser, layout, generadores, compatibilidad `.fprg` y ejecución paso a paso. Para esta revisión también se ejecutaron comprobaciones aisladas del intérprete y de los resultados esperados de los seis retos. La instalación npm completa no pudo ejecutarse en el entorno de revisión porque `registry.npmjs.org` no resolvió DNS; por ello `npm test`, `npm run build` y `npm run lint` deben correrse en tu Mac después de instalar dependencias.

## Alcance y límites actuales

- Bloques: Start, End, Declare, Assign, Input, Output, If, While, Do, For, Call, Return y Comment.
- Generadores separados para Python, JavaScript, C, C++ y Java.
- Parser de expresiones Pratt sin `eval`, con operadores aritméticos, comparación y lógica básica.
- Importación/exportación `.fprg` para un subconjunto documentado.
- Las llamadas a funciones (`Call`), ejecución real de subfunciones, indexación de arreglos (`a[i]`), gráficos/turtle, semánticas específicas de conversión y paridad completa del formato `.fprg` están pendientes. El intérprete ahora informa explícitamente cuando una operación de arreglos o llamadas excede el subconjunto admitido; no inventa su resultado.

Consulta `ARCHITECTURE.md`, `docs/COMPATIBILITY.md` y `docs/PROJECT_STATUS.md` para más detalles.

## Novedades v10

Consulta [README-V10.md](./README-V10.md). Incluye las mejoras planificadas para v8, v9 y v10 con límites explícitos: 24 microretos táctiles, progreso local por estudiante, proyectos, equivalencias didácticas al código y modo offline mediante HTTPS/localhost.

Inicia Mac y teléfono con `npm run dev:lan` y abre la dirección **Network** desde el teléfono.
