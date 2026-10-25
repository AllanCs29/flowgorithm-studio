# Arquitectura

## Fronteras
- `domain/`: modelo semántico, invariantes y comandos inmutables. No contiene coordenadas ni dependencias de UI.
- `layout/`: convierte árbol estructural a posiciones renderizables deterministas.
- `renderer/`: proyección pura AST + Layout → nodos/aristas visuales.
- `interaction/`: normaliza entradas físicas a intents; el dispatcher convierte intents en comandos.
- `parser/`: lexer, parser Pratt, type checks y evaluator; nunca ejecuta texto con `eval`.
- `interpreter/`: contexto de ejecución y máquina de pasos.
- `generators/`: Core IR compartido y generadores separados por lenguaje.
- `compatibility/flowgorithm/`: parsing y escritura XML `.fprg`; errores de compatibilidad explícitos.
- `storage/`: adaptadores de archivo y persistencia local.
- `ui/`: composición visual. Renderiza el layout calculado; no muta el AST.

## Invariantes esenciales
1. Cada función tiene exactamente un `Start` en `rootNodeId`.
2. El AST guarda enlaces semánticos (`next`, `trueNext`, `falseNext`, `bodyNext`), nunca x/y/width/height.
3. Toda mutación estructural pasa por comandos y retorna un nuevo proyecto.
4. Un nodo no puede tener dos padres, formar ciclos ni quedar huérfano.
5. `Start` y `End` no se mueven ni se borran como bloques ordinarios.
6. Las partes no interpretadas de `.fprg` levantan `CompatibilityError` con código `COMPATIBILITY_UNKNOWN`.

## Flujo
`UI → InteractionController → CommandDispatcher → Domain Command → nuevo Project → LayoutEngine → Renderer Projection`.

## Siguientes etapas recomendadas
1. Añadir ficheros de conformidad `.fprg` reales y comparar output con Flowgorithm.
2. Completar matrices/arreglos, funciones recursivas y gráficos según documentación oficial.
3. Endurecer semántica numérica/string de cada lenguaje y añadir lowering por plugin.
4. Evaluar compactación horizontal para árboles grandes y validación de accesibilidad ampliada.