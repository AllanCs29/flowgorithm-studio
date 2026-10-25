# Flowgorithm Studio v6 — Plan integral de producto y desarrollo

**Estado:** especificación de implementación; **no es una versión v6 programada ni verificada**.  
**Base auditada:** código fuente incluido en `Flowgorithm-Studio-Aprender-v5.zip` (React 18 + TypeScript + Vite, pruebas Vitest).  
**Objetivo:** que una persona que nunca ha programado pueda abrir la aplicación, aprender cada bloque con ejemplos interactivos, practicar desde PC o teléfono y avanzar hasta algoritmos complejos con resultados verificables.

## 1. Referentes y alcance

1. **Recorrido tipo TypingClub**: inicio con ruta, una habilidad nueva a la vez, demostración antes de la acción, práctica breve, retroalimentación específica, repetición y desbloqueo progresivo. Inspiración de experiencia, no copia de interfaz ni contenido.
2. **Flowgorithm oficial**: conservar semántica de Inicio/Fin, Declarar, Asignar, Entrada, Salida, Si, Mientras, Hacer, Para, funciones y arreglos **unidimensionales**. Un `Si` elige ramas, no repite. Consultar documentación oficial antes de reproducir comportamiento.
3. **Banco de ejercicios**: problemas originales escalonados por habilidades, inspirados en la documentación, el tutorial oficial y la colección educativa vinculada a Roberto Atzori; no copiar íntegramente contenidos protegidos sin autorización.
4. **Extensiones transparentes**: matrices nativas bidimensionales no forman parte del conjunto de arreglos unidimensionales descrito por Flowgorithm. Primero enseñar matrices como arreglo lineal con fórmula `fila * columnas + columna` o ampliar explícitamente el motor con un modo «Extensión Studio 2D». Los ejercicios 2D nativos permanecerán bloqueados hasta estar soportados y probados.

Fuentes de referencia:
- https://flowgorithm.org/documentation/index.html
- https://flowgorithm.org/documentation/operators.html
- https://flowgorithm.org/resources/index.html
- https://flowgorithm.org/about/features.html
- https://flowgorithm.altervista.org/HTML%20ENG/resources.html

## 2. Diagnóstico técnico verificado en la v5

- `src/domain/models.ts`: `CoreType` admite primitivas y arreglos de **una dimensión**; `DeclareNode` incluye `arraySize`.
- `src/interpreter/engine.ts`: puede inicializar un arreglo pero rechaza explícitamente indexación `a[i]`, asignación a elementos y entrada directa de elementos. No se pueden presentar ejercicios de arreglos como plenamente ejecutables antes de implementarlo.
- `src/learning/learning.ts`: hay **14 lecciones y 14 retos**, con casos de prueba de entrada/salida; `gradeExercise` ejecuta pruebas y comprueba presencia de tipos de bloque requeridos.
- `src/learning/courseFlow.ts`: progreso secuencial; una lección depende de la aprobación del reto anterior.
- UI actual: `src/ui/CourseHome.tsx`, `LessonScreen.tsx`, `App.tsx`, `FlowchartCanvas.tsx`, `PropertyInspector.tsx`, `v5.css` constituyen la base a refactorizar. **No es necesario reiniciar el proyecto desde cero**.

## 3. Experiencia final: navegación y pantallas

### Inicio / Mi ruta

- Pantalla inicial al abrir, distinta del editor. Encabezado ligero, progreso real, CTA «Continuar clase», ruta de mundos con estados `Pendiente / Disponible / En curso / Dominado` y atajo visible a «Editor libre».
- Tarjeta de cada lección: habilidad, duración aproximada, cantidad de prácticas, mini-diagrama y prerrequisito; las lecciones bloqueadas explican qué falta.
- En teléfono: tarjetas en una columna; navegación inferior `Inicio | Mi ruta | Practicar | Perfil` (Perfil solo preferencias/progreso local, sin prometer cuenta sincronizada).

### Pantalla de clase

Secuencia obligatoria para **cada bloque o herramienta nueva**:

1. **Descubre**: ¿qué es y cuándo se usa? Explicación corta, lenguaje sin jerga y ejemplo de la vida real.
2. **Mira**: animación interactiva del flujo, resaltando flechas y valores que cambian.
3. **Adivina**: predice qué salida se obtendrá (opción múltiple, ordenar pasos o señalar rama). Explica *por qué* tras contestar.
4. **Hazlo conmigo**: el editor muestra una sola acción principal resaltada; incluye indicación exacta adaptada a PC/teléfono y botón «Muéstrame».
5. **Ahora tú**: ejercicio sin pistas obligatorias, con casos de prueba visibles + ocultos y mensajes accionables.
6. **Repaso**: microreto de transferencia con entradas nuevas, sin repetir exactamente el ejemplo.

Al cambiar de dispositivo no deben aparecer textos espaciales falsos como «haz clic a la derecha»: usar «toca Editar», «abre Piezas» o «selecciona el bloque resaltado».

### Editor PC (≥ 1024 px)

- Barra superior: regreso a ruta, lección, progreso y acciones principales.
- Panel opcional izquierdo: objetivo/acciones concretas; no un listado enorme de controles.
- Lienzo central protagonista: conexiones y zonas de inserción visibles; selección y ejecución con focos distintos.
- Inspector derecho contextual: título del bloque, campos, ejemplo, ayuda y botones inequívocos **Aplicar cambios** y **Cancelar**. «Eliminar bloque» separado, con texto legible y confirmación apropiada.
- Consola y código como pestañas/áreas plegables; no ocupar pantalla fija durante clases iniciales.
- Controles `Deshacer / Rehacer / Reiniciar / Paso a paso / Ejecutar` con etiquetas, tooltips, atajos y estados deshabilitados explicados.

### Editor móvil (< 768 px)

- Cabecera compacta con volver, título y progreso.
- Lienzo principal con `zoom +`, `zoom -`, encuadre y botón flotante claro **+ Añadir bloque**.
- Barra inferior: `Misión | Piezas | Editar | Resultado | Más`. El panel abierto será un **bottom sheet** con tres tamaños (pequeño, medio, completo); scroll interno táctil y fondo del lienzo preservado.
- Inserción por **tocar**, no por drag obligatorio. Seleccionar destino → abrir Piezas → elegir tipo → confirmar posición (`Después`, `Sí`, `No`, `Cuerpo`).
- Campos sin zoom accidental, teclado adecuado al dato, objetivos táctiles ≥44×44 px, protección contra pérdida de cambios y scroll que no bloquee la página.
- Cuando aparezca el teclado, el botón Aplicar debe seguir accesible. «Cancelar» debe ser de contraste suficiente y jamás mostrarse como texto oscuro sobre botón oscuro.

## 4. Arquitectura v6 propuesta

Mantener `domain`, `parser`, `interpreter`, `layout`, `renderer`, `generators`, `compatibility` desacoplados de UI. Agregar capas nuevas sin usar estados duplicados en varios componentes.

```text
src/
  app/
    AppShell.tsx                    # Navegación y modos
    routes.ts                       # Pantallas tipadas, sin router obligatorio
  course/
    curriculum.ts                   # Metadatos de mundos/lecciones
    catalog/                        # Un módulo por mundo; sin listas monolíticas
    lessonSchema.ts                 # Contrato validado para contenido
    lessonEngine.ts                 # Máquina de estados de una lección
    progressStore.ts                # Guardado local versionado y migración v5
    feedback.ts                     # Retroalimentación pedagógica
    challenges/
      graders.ts                    # Casos visibles y ocultos; tolerancias
      fixtures.ts                   # Escenarios de ejecución
  ui/
    home/CourseDashboard.tsx
    home/WorldPath.tsx
    lesson/ConceptCard.tsx
    lesson/AnimatedExample.tsx
    lesson/PredictOutput.tsx
    lesson/CoachOverlay.tsx
    lesson/LessonStepper.tsx
    editor/EditorWorkspace.tsx
    editor/DiagramSurface.tsx
    editor/InsertTarget.tsx
    editor/BlockPicker.tsx
    editor/ContextInspector.tsx
    editor/ExecutionDock.tsx
    editor/CodeTabs.tsx
    mobile/MobileBottomNav.tsx
    mobile/BottomSheet.tsx
    mobile/KeyboardSafeActions.tsx
    common/AccessibleDialog.tsx
    common/Toast.tsx
    common/ProgressBar.tsx
  domain/                             # Preservar + tests
  interpreter/                        # Extender indexación de arreglos
  parser/                             # Extender acceso/edición de elementos
  generators/                         # Mantener consistencia de arrays 1D
  compatibility/                      # Reglas .fprg oficiales vs extensión
  styles/
    tokens.css
    responsive.css
    focus.css
```

### Estados y contratos

```ts
type Screen = 'home' | 'world' | 'lesson' | 'exercise' | 'free-editor';
type LessonPhase = 'discover' | 'watch' | 'predict' | 'guided' | 'challenge' | 'review' | 'complete';
type BottomSheet = 'closed' | 'mission' | 'blocks' | 'properties' | 'result' | 'more';
type ProgressState = 'locked' | 'available' | 'in_progress' | 'mastered';

interface CourseProgressV6 {
  schemaVersion: 6;
  completedExerciseIds: string[];
  lessonPhases: Record<string, LessonPhase>;
  attempts: Record<string, number>;
  savedDiagrams: Record<string, string>; // serialización con validación al cargar
}
```

Contratos de lección: `id`, `worldId`, `prerequisites`, `introducedBlocks`, `concept`, `workedExample`, `predictionQuestion`, `guidedActions`, `starterProject`, `testCases`, `feedbackRules`, `hints`, `capabilitiesRequired`, `status`. *No colocar ejercicios ejecutables sin sus capacidades implementadas.*

## 5. Evaluación justa

- Primero validar estructura del programa (árbol válido, sin ciclos de referencias, nodos conectados, condiciones válidas), después ejecutar.
- Comparar resultados en distintos casos (incluyendo cero, negativos, valores límite, arreglos vacíos cuando aplique), nunca únicamente un texto esperado.
- Proteger de ciclos infinitos por límite de pasos y mostrar dónde se atascó; ofrecer pista, no solo «incorrecto».
- Admitir soluciones alternativas cuando la habilidad no exija un bloque específico. Requisitos estructurales solo cuando son el objetivo de la clase.
- Tolerancia numérica explícita para reales; normalización de salto de línea solo cuando el ejercicio la permita.
- Ayuda escalonada: `Pista conceptual → Señalar bloque → Mostrar ejemplo → Solución explicada`, con opción de reintentar.
- Diferenciar `prueba visible`, `prueba oculta`, `código inválido`, `no termina`, `funcionalidad no disponible` y `error interno`.
- En el móvil mostrar el error junto a la instrucción editable, no una traza técnica.

## 6. Orden realista de implementación

**Entrega A — UX usable desde cero (bloqueante):** arreglar «Cancelar» ilegible, scroll, navegación inicial, foco/selección, bottom sheets, inserción por toque, tutorial guiado y pruebas de interacción en PC/móvil. Aceptación: completar clases 1–10 sin una explicación externa.

**Entrega B — Curso intermedio:** editor estructural guiado, retos 11–70, validadores robustos, contenido adaptado a dispositivos. Aceptación: completar sin intervención de desarrollador los 70 retos y reanudar progreso después de recargar.

**Entrega C — Arrays:** AST de indexación (lectura/escritura), verificación de límites, soporte de entrada/salida por elemento, visualizador de celdas, ejecución paso a paso y generadores. Aceptación: 71–80 pasan múltiples fixtures y exportación / importación compatible cuando corresponda.

**Entrega D — Matrices:** primero matriz como arreglo lineal; opcional soporte nativo `Array2D` con marca explícita `StudioExtension`, gen de código y migraciones. Aceptación: 81–88 resueltos con tests de límites/índices.

**Entrega E — Funciones y proyectos:** llamadas anidadas, parámetros, retorno, ámbitos, recursión con límites seguros; ejercicios 89–100, proyectos integradores y depuración visual. Aceptación: solución de referencia + solución alternativa aprobadas para cada proyecto.

**Entrega F — Producción y calidad:** `npm run verify`, pruebas de flujos en Chromium/WebKit (Playwright), snapshots de interfaz móvil en anchos 360, 390, 768 y escritorio 1440, controles de accesibilidad con teclado y VoiceOver, flujo de exportar/importar y revisión manual en iOS/Android.

No confundir el `npm run verify` actual con una auditoría completa de usabilidad o compatibilidad móvil.

## 7. Catálogo: 100 ejercicios originales y progresivos

Cada actividad tendrá **tutorial previo** si introduce bloque, operador o pantalla por primera vez. Las siguientes son fichas de producto, no retos ejecutables ya programados. Se deben crear proyectos iniciales, solución de referencia y mínimo 3 casos de prueba por ficha antes de publicarla.


### Mundo 1 — Tu primer diagrama

Interfaz, secuencia y primeras acciones. Los ejercicios 1–2, 5, 7–9 verifican también eventos de UI, no solo la salida.

001. **Encuentra Inicio y Fin.** Identifica el orden de ejecución en un diagrama básico. **Comprobación:** Debe seleccionar Inicio y luego Fin sin ayuda.
002. **Toca tu primera Salida.** Selecciona el bloque que muestra un mensaje y abre su editor. **Comprobación:** Inspector visible con bloque Salida seleccionado.
003. **Escribe «Hola, mundo».** Configura una salida de texto literal. **Comprobación:** Salida exacta: Hola, mundo.
004. **Ponlo en otra línea.** Activa salto de línea y explica qué hace. **Comprobación:** Dos salidas ocupan dos líneas.
005. **Guarda y cancela sin miedo.** Cambia un texto, cancélalo y comprueba que no se guardó. **Comprobación:** Cancelar deja intacta la expresión original.
006. **Añade una pieza.** Inserta Salida entre Inicio y Fin. **Comprobación:** El diagrama contiene secuencia válida Inicio→Salida→Fin.
007. **Cambia el orden.** Coloca dos salidas en el orden pedido. **Comprobación:** El texto aparece Primero, luego Segundo.
008. **Borra sin romper el flujo.** Elimina una salida, conservando Inicio y Fin conectados. **Comprobación:** Flujo sigue siendo válido.
009. **Prueba paso a paso.** Ejecuta exactamente una instrucción y reinicia. **Comprobación:** Señal de ejecución avanza; Reset devuelve a Inicio.
010. **Tu primer programa completo.** Muestra nombre del curso, un saludo y una despedida. **Comprobación:** Tres líneas, en orden.

### Mundo 2 — Variables y asignaciones

Declarar, Asignar, tipos, nombres y valores almacenados.

011. **La caja número.** Declara edad de tipo Integer y muéstrala. **Comprobación:** edad=0 al inicializar.
012. **Un valor propio.** Asigna 18 a edad y luego muéstrala. **Comprobación:** Salida: 18.
013. **Decimales correctos.** Declara Real precio y asígnale 12.5. **Comprobación:** Salida: 12.5.
014. **Palabras guardadas.** Declara String ciudad y asígnale un texto. **Comprobación:** Salida coincide con texto asignado.
015. **Verdadero o falso.** Declara Boolean activo y cambia su valor. **Comprobación:** Salida: true o false según entrada de prueba.
016. **Dos cajas distintas.** Declara a y b; asigna 3 y 8. **Comprobación:** Salida: 3 seguido de 8.
017. **El valor cambia.** Reasigna contador de 1 a 2. **Comprobación:** Salida final: 2.
018. **Nombres sin errores.** Repara nombre de variable no válido o no declarada. **Comprobación:** El programa se ejecuta sin identificadores inválidos.
019. **Intercambia con auxiliar.** Intercambia a=4 y b=9 usando temporal. **Comprobación:** Resultado final: a=9, b=4.
020. **Mini examen de variables.** Calcula total desde precio y cantidad. **Comprobación:** precio=7 y cantidad=3, total=21.

### Mundo 3 — Entrada y matemáticas

Entrada, expresiones, operadores y manejo de valores.

021. **Pregúntame mi nombre.** Solicita String nombre y muestra saludo. **Comprobación:** «Luz» produce un saludo con Luz.
022. **Dos números, una suma.** Lee a y b y muestra a+b. **Comprobación:** 2 y 7 → 9.
023. **Resta de bolsillo.** Calcula cambio = pago − costo. **Comprobación:** 20 y 13 → 7.
024. **Multiplica unidades.** Calcula precio × cantidad. **Comprobación:** 12 y 4 → 48.
025. **Divide con cuidado.** Calcula mitad de un valor Real. **Comprobación:** 7 → 3.5.
026. **El orden importa.** Usa paréntesis para calcular (a+b)*c. **Comprobación:** (2,3,4) → 20.
027. **Área de triángulo.** Lee base y altura y calcula área. **Comprobación:** base 10, altura 5 → 25.
028. **Temperatura.** Convierte Celsius a Fahrenheit. **Comprobación:** 0 → 32; 100 → 212.
029. **Minutos y horas.** Convierte minutos a horas completas y resto. **Comprobación:** 125 → 2 horas y 5 minutos.
030. **Calculadora inicial.** Lee dos números y una operación básica válida. **Comprobación:** 8 y 3 con + → 11; con * → 24.

### Mundo 4 — Decisiones y lógica

Si, Sí/No, comparadores, anidados y expresiones booleanas.

031. **¿Es mayor de edad?.** Decide usando edad>=18. **Comprobación:** 17 → Menor; 18 → Mayor.
032. **Positivo o negativo.** Clasifica signo, incluyendo cero. **Comprobación:** -4 / 0 / 7 producen clases correctas.
033. **¿Par o impar?.** Usa residuo de división entre 2. **Comprobación:** -3 → Impar; 8 → Par.
034. **La nota pasa.** Decide Aprobado si promedio>=6. **Comprobación:** 5.9 → No; 6 → Sí.
035. **¿Cuál es mayor?.** Compara dos números y maneja empate. **Comprobación:** 3,3 → Iguales.
036. **Tres caminos.** Clasifica temperatura fría, templada o caliente. **Comprobación:** Pruebas en límites definidos.
037. **Rango permitido.** Verifica número entre 1 y 100 inclusive. **Comprobación:** 0 → No; 1 y 100 → Sí.
038. **Condiciones combinadas.** Requiere usuario válido y PIN correcto. **Comprobación:** Pruebas true/false cruzadas.
039. **El mayor de tres.** Encuentra máximo con ramas anidadas. **Comprobación:** 7,12,5 → 12 y casos empatados.
040. **Semáforo seguro.** Recibe color válido y muestra acción apropiada. **Comprobación:** Rojo → Alto, Verde → Avanza, otro → Error.

### Mundo 5 — Repetir con Mientras y Hacer

Condiciones de permanencia, centinelas, validación e invariantes.

041. **Cuenta hasta cinco.** Usa Mientras y termina en 5. **Comprobación:** 1,2,3,4,5 exactamente.
042. **Cuenta hacia atrás.** Empieza en 5 y termina en 1. **Comprobación:** 5,4,3,2,1 exactamente.
043. **¿Cuándo no entra?.** Predice y prueba un Mientras inicialmente falso. **Comprobación:** Cero iteraciones.
044. **Hazlo una vez.** Compara Hacer mientras con Mientras. **Comprobación:** Una iteración aun con condición falsa al final.
045. **Solo positivos.** Repite pedido hasta recibir un número positivo. **Comprobación:** -2,0,9 → acepta 9.
046. **Clave correcta.** Solicita contraseña hasta acertar, sin exponerla. **Comprobación:** Dos fallos y un éxito, termina.
047. **Suma hasta cero.** Usa 0 como centinela de entradas. **Comprobación:** 3,4,0 → 7.
048. **Cuenta intentos.** Cuenta cuántas entradas se hicieron antes del centinela. **Comprobación:** 1,2,0 → 2.
049. **Dígitos de un número.** Cuenta dígitos de entero no negativo con divisiones. **Comprobación:** 0 → 1; 437 → 3.
050. **Adivina el número.** Retroalimenta Mayor/Menor hasta acertar número fijo. **Comprobación:** Secuencia finita de intentos y terminación.

### Mundo 6 — Para, contadores y acumuladores

For, suma, promedio, producto y bucles anidados.

051. **De uno a diez.** Usa Para con inicio, límite y paso. **Comprobación:** Salida 1..10.
052. **De diez a uno.** Configura Para descendente. **Comprobación:** Salida 10..1.
053. **Pares hasta N.** Itera de 2 en 2. **Comprobación:** N=8 → 2,4,6,8.
054. **Tabla de multiplicar.** Muestra tabla para número introducido. **Comprobación:** N=3 → 3,6,…,30.
055. **Suma de 1 a N.** Acumula una serie. **Comprobación:** 4 → 10; 0 → 0.
056. **Factorial.** Acumula con multiplicación. **Comprobación:** 0 → 1; 5 → 120.
057. **Promedio de N valores.** Suma N entradas y divide con control de N. **Comprobación:** 3: 2,4,6 → 4.
058. **Contar aprobados.** Cuenta calificaciones >=6 en N alumnos. **Comprobación:** [5,6,9] → 2.
059. **Patrón triangular.** Anida bucles para imprimir triángulo de asteriscos. **Comprobación:** N=3 → 1,2,3 estrellas por línea.
060. **Números primos.** Comprueba divisores de 2 a raíz de N o N-1. **Comprobación:** 2,17 → Primo; 1,21 → No.

### Mundo 7 — Texto y caracteres

Longitud, posiciones, subcadenas, conversiones y patrones. Requiere motor/string funcs validados.

061. **Une dos palabras.** Concatena nombre y apellido. **Comprobación:** «Ada» y «Lovelace» → «Ada Lovelace».
062. **Cuenta letras.** Calcula longitud de un texto. **Comprobación:** «casa» → 4.
063. **Primera y última.** Obtiene primer y último carácter sin salir del rango. **Comprobación:** «sol» → s y l.
064. **Recorre una palabra.** Muestra cada carácter en línea distinta. **Comprobación:** «pez» → p,e,z.
065. **Cuenta vocales.** Cuenta vocales mayúsculas/minúsculas. **Comprobación:** «Murciélago» → resultado según política de acentos.
066. **Invierte la palabra.** Recorre cadena al revés. **Comprobación:** «roma» → «amor».
067. **¿Es palíndromo?.** Compara texto con inverso, ignorando mayúsculas. **Comprobación:** «Reconocer» → Sí.
068. **Cuenta espacios.** Calcula número de separadores en una frase. **Comprobación:** «uno dos tres» → 2.
069. **Extrae iniciales.** Lee nombre compuesto y produce iniciales. **Comprobación:** «Ana Maria Sol» → AMS.
070. **Frecuencia de letra.** Cuenta apariciones de un carácter en texto. **Comprobación:** «banana», «a» → 3.

### Mundo 8 — Arreglos de una dimensión

Indexación, lectura/escritura, límites, búsqueda y ordenamiento. **Bloqueado hasta soportar `arr[i]`**.

071. **Tu primer arreglo.** Declara vector Integer[5] y visualiza cinco posiciones. **Comprobación:** Longitud 5, índices 0..4.
072. **Guarda por índice.** Escribe 7 en posición 2 y lee ese dato. **Comprobación:** v[2] → 7.
073. **Carga cinco números.** Lee y almacena cinco entradas en un vector. **Comprobación:** Entrada 1..5 → vector 1..5.
074. **Suma elementos.** Recorre vector y calcula suma. **Comprobación:** [2,3,4] → 9.
075. **Promedio del arreglo.** Promedia elementos; protege longitud 0 si permitida. **Comprobación:** [4,6,8] → 6.
076. **Encuentra el mayor.** Busca máximo en vector de enteros. **Comprobación:** [-9,-2,-5] → -2.
077. **¿Dónde está?.** Búsqueda lineal que devuelve índice o -1. **Comprobación:** [4,6,2],6 → 1.
078. **Invierte un vector.** Intercambia elementos extremos. **Comprobación:** [1,2,3] → [3,2,1].
079. **Elimina duplicados.** Obtiene valores únicos preservando orden. **Comprobación:** [3,3,2,3] → [3,2].
080. **Ordena números.** Implementa burbuja y prueba repetidos/negativos. **Comprobación:** [5,-1,5,2] → [-1,2,5,5].

### Mundo 9 — Matrices, filas y columnas

Primero modelo didáctico mediante arreglo 1D e índice lineal; soporte 2D nativo es extensión diferenciada.

081. **La cuadrícula.** Construye matriz 2×3 desde arreglo de seis elementos. **Comprobación:** 6 celdas y mapeo correcto.
082. **De fila y columna a índice.** Calcula fila*columnas+columna. **Comprobación:** fila 1, col 2 en 3 columnas → índice 5.
083. **Llena matriz 3×3.** Usa ciclos anidados para cargar nueve posiciones. **Comprobación:** Nueve valores conservados.
084. **Suma una fila.** Suma elementos de fila indicada. **Comprobación:** [[1,2],[3,4]], fila 1 → 7.
085. **Suma una columna.** Suma elementos por columna. **Comprobación:** [[1,2],[3,4]], col 0 → 4.
086. **Diagonal principal.** Suma diagonal de matriz cuadrada. **Comprobación:** [[1,2],[3,4]] → 5.
087. **Transposición.** Intercambia filas por columnas en representación. **Comprobación:** 2×3 → 3×2, orden correcto.
088. **Multiplicación de matrices.** Calcula producto pequeño con triples ciclos y dimensiones válidas. **Comprobación:** Identidad × A = A.

### Mundo 10 — Funciones, modularidad y recursión

Creación de funciones, parámetros, retorno y pila de llamadas; habilitar según capacidades del intérprete.

089. **Una función útil.** Crea función doble(x) y la llama. **Comprobación:** doble(4) → 8.
090. **Devuelve un resultado.** Implementa areaRectangulo(base,altura). **Comprobación:** (3,5) → 15.
091. **Divide para conquistar.** Separa validación y cálculo en funciones. **Comprobación:** Mismas salidas que solución monolítica.
092. **Funciones con decisiones.** Implementa esPar(n) como función booleana. **Comprobación:** -2 → true, 7 → false.
093. **Reutiliza un cálculo.** Implementa maximo(a,b) y úsalo varias veces. **Comprobación:** (3,9) → 9.
094. **Factorial recursivo.** Implementa caso base y llamada recursiva segura. **Comprobación:** 0 → 1; 5 → 120.
095. **Euclides recursivo.** Calcula máximo común divisor con mod. **Comprobación:** (48,18) → 6.

### Mundo 11 — Proyectos finales

Retos abiertos con múltiples casos ocultos, narración del problema y revisión de estrategia.

096. **Sistema de calificaciones.** Lee N alumnos, calcula promedios y clasificación. **Comprobación:** Incluye cero alumnos, límites y distintos promedios.
097. **Caja registradora.** Registra artículos, cantidades, descuentos y total. **Comprobación:** Valida cero productos, redondeos y errores de entrada.
098. **Inventario sencillo.** Agrega, busca, actualiza y lista productos. **Comprobación:** Evita ID duplicado y stock negativo.
099. **Estadística de una clase.** Calcula media, mayor, menor y distribución por rangos. **Comprobación:** Compara con conjunto de referencia y empates.
100. **Proyecto maestro: gestión de biblioteca.** Usa menús, funciones, arreglos, búsqueda y reporte de préstamos. **Comprobación:** Casos ocultos: préstamo, devolución, inexistente y límites.

## 8. Condiciones de aceptación globales

- Una persona nueva completa la primera clase sin ayuda externa en PC **y** móvil, identifica cómo cancelar, y encuentra el resultado sin buscar menús ocultos.
- El inspector nunca coloca dos botones incomprensibles uno al lado del otro; los destructivos llevan texto y contexto.
- Todo componente clave es navegable mediante teclado; las etiquetas son perceptibles por lector de pantalla, los objetivos táctiles son grandes y existe foco visible.
- Los 100 ejercicios disponen de `starterProject`, `referenceSolution`, `tutorial`, `prediction`, `hints`, `publicTests`, `hiddenTests`, `prerequisites` y `capabilityStatus` antes de aparecer como disponibles.
- El resultado correcto puede conseguirse con distintos algoritmos válidos, salvo cuando el objetivo pedagógico sea practicar una estructura determinada.
- Si una capacidad aún no existe, la app no la anuncia como completada ni permite acceder a un reto imposible.
- Exportación `.fprg` representa únicamente características compatibles; una extensión Studio incompatible se identifica y se guarda en formato propio para evitar pérdida de datos.
- Se migran progresos v5 sin borrarlos, y existe exportación/importación de progreso y diagramas para permitir pasar del Mac al móvil antes de contar con sincronización por cuenta.

## 9. Cómo iniciar el trabajo sin arriesgar la versión instalada

1. Conservar copia de v5 fuera del árbol del proyecto (`~/Proyectos/Flowgorithm-Studio-respaldo-v5-...`).
2. Abrir rama Git `feature/v6-mobile-academy` y capturar resultado inicial de `npm run verify`.
3. Implementar primero los criterios A1–A6 de la Entrega A, añadir pruebas de interacción y verificar en teléfonos reales.
4. Desbloquear los mundos uno por uno solo después de ejecutar y probar sus habilidades subyacentes.
5. Medir experiencia: tasa de primera lección completada, cantidad de toques perdidos, abandonos por pantalla, intentos de validación y recuperación de errores; sin rastreo innecesario.

*Fin de la especificación v6. El contenido del catálogo se considera propuesta editorial original, no transcripción del libro de ejercicios.*
