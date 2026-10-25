import { FlowFunction, FlowNode, NodeId, RuntimeValue, TYPE_LABELS } from '../domain/models';
import { evaluateExpression, parseExpression } from '../parser/expression';
import { ExecutionContext } from './engine';

/** Read-only copies of actual interpreter states, NOT a second interpreter. */
export interface MemoryChange {
  readonly name: string;
  readonly before?: RuntimeValue;
  readonly after?: RuntimeValue;
  readonly changedIndices?: readonly number[];
}
export interface VisualFrame {
  readonly context: ExecutionContext;
  readonly nodeId?: NodeId;
  readonly label: string;
  readonly explanation: string;
  readonly changes: readonly MemoryChange[];
  readonly newOutput: string;
  readonly decision?: { readonly nodeId: NodeId; readonly passed: boolean; readonly phase?: 'entry' | 'check' };
}
export const MAX_VISUAL_FRAMES = 450;

export function snapshot(context: ExecutionContext): ExecutionContext {
  return {
    ...context,
    variables: Object.fromEntries(Object.entries(context.variables).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])),
    outputLog: [...context.outputLog],
    controls: context.controls.map(frame => ({ ...frame }))
  };
}
function sameValue(left: RuntimeValue | undefined, right: RuntimeValue | undefined): boolean {
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((v, i) => v === right[i]);
  return left === right;
}
export function memoryDiff(before: ExecutionContext, after: ExecutionContext): readonly MemoryChange[] {
  const names = new Set([...Object.keys(before.variables), ...Object.keys(after.variables)]);
  const result: MemoryChange[] = [];
  for (const name of names) {
    const previous = before.variables[name];
    const current = after.variables[name];
    if (sameValue(previous, current)) continue;
    const changedIndices = Array.isArray(current)
      ? current.flatMap((value, index) => (!Array.isArray(previous) || previous[index] !== value) ? [index] : [])
      : undefined;
    result.push({ name, before: previous, after: current, changedIndices });
  }
  return result;
}

export function initialVisualFrame(context: ExecutionContext): VisualFrame {
  return {
    context: snapshot(context),
    label: 'Listo para empezar',
    explanation: 'Pulsa «Siguiente paso» para ejecutar Inicio. Verás cómo cambia la memoria y qué bloque viene después.',
    changes: [],
    newOutput: ''
  };
}
function describe(node: FlowNode | undefined, before: ExecutionContext, after: ExecutionContext, changes: readonly MemoryChange[], output: string): string {
  if (after.status === 'ERROR') return `Se produjo un error: ${after.error ?? 'Revisa el bloque actual.'}`;
  if (!node) return 'La ejecución cambió de estado.';
  if (after.status === 'WAITING_INPUT') return `Entrada necesita un dato para «${after.pendingInput}». Escribe un valor para continuar.`;
  if (before.status === 'WAITING_INPUT') return `Se guardó el dato solicitado. ${changes.map(c => `${c.name} = ${format(c.after)}`).join('; ')}`;
  switch (node.type) {
    case 'Start': return 'Inicio: el programa comienza y avanza a la primera instrucción.';
    case 'End': return 'Fin: todas las instrucciones del programa terminaron.';
    case 'Declare': return `Se declararon ${node.name.split(',').map(name=>`${name.trim()} = ${format(after.variables[name.trim()])}`).join(', ')}. El tipo es ${node.dataType}.`;
    case 'Assign': return `${changes.length ? `Se actualizó ${changes.map(c => `«${c.name}» de ${format(c.before)} a ${format(c.after)}`).join(', ')}.` : 'La asignación no cambió el valor.'} ${Array.isArray(changes[0]?.after) ? 'Se resaltan las casillas modificadas.' : ''}`;
    case 'Input': return 'El programa recibió el dato y continuará con la siguiente instrucción.';
    case 'Output': return `Salida mostró ${JSON.stringify(output)} en la consola.`;
    case 'If': return `La condición «${node.condition}» fue ${after.lastDecision?.passed ? 'verdadera' : 'falsa'}. Se tomó la rama ${after.lastDecision?.passed ? 'Sí' : 'No'}.`;
    case 'While': return `Mientras: «${node.condition}» es ${after.lastDecision?.passed ? 'verdadera; se repite el cuerpo' : 'falsa; el ciclo termina'}.`;
    case 'Do': return after.lastDecision?.phase === 'entry'
      ? 'Hacer mientras: primero se ejecuta el cuerpo, sin comprobar todavía la condición.'
      : `Hacer mientras: la condición es ${after.lastDecision?.passed ? 'verdadera; se repite' : 'falsa; termina el ciclo'}.`;
    case 'For': return `Para: ${node.variable} = ${format(after.variables[node.variable])}. ${after.lastDecision?.passed ? 'Se ejecuta otra vuelta.' : 'El contador salió del intervalo.'}`;
    case 'Comment': return 'Un comentario explica el algoritmo, pero no cambia la memoria.';
    case 'Call': return `Se llamó a «${node.functionName}». Esta vista resume el resultado de la llamada; la ejecución interna de la función aún no se anima bloque por bloque.`;
    case 'Return': return `La función devolvió ${format(after.returnValue)}.`;
  }
}
export function format(value: RuntimeValue | undefined): string {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(item => typeof item === 'string' ? JSON.stringify(item) : String(item)).join(', ')}]`;
  return String(value);
}

export function visualFrame(before: ExecutionContext, after: ExecutionContext, func: FlowFunction): VisualFrame {
  const nodeId = after.lastExecutedNodeId ?? before.currentNodeId;
  const node = nodeId ? func.nodes[nodeId] : undefined;
  const changes = memoryDiff(before, after);
  const newOutput = after.outputLog.length >= before.outputLog.length
    ? after.outputLog.slice(before.outputLog.length).join('') : '';
  return {
    context: snapshot(after),
    nodeId,
    label: node ? `${TYPE_LABELS[node.type]} · paso ${after.stepCount}` : `Paso ${after.stepCount}`,
    explanation: describe(node, before, after, changes, newOutput),
    changes,
    newOutput,
    decision: after.lastDecision ? { ...after.lastDecision } : undefined
  };
}

/** Limit the replay buffer to avoid freezing browsers when algorithms loop thousands of times. */
export function appendVisualFrame(frames: readonly VisualFrame[], frame: VisualFrame, max = MAX_VISUAL_FRAMES): VisualFrame[] {
  if (max < 1) throw new Error('El historial requiere al menos un fotograma.');
  return [...frames, frame].slice(-max);
}

/** Predict only side-effect-free scalar conditions; user-defined functions remain unknown here. */
export function upcomingDecision(func: FlowFunction, context: ExecutionContext): { nodeId: NodeId; expression: string; expected: boolean } | null {
  if (!context.currentNodeId || !['IDLE', 'PAUSED', 'RUNNING'].includes(context.status)) return null;
  const node = func.nodes[context.currentNodeId];
  if (!node || (node.type !== 'If' && node.type !== 'While')) return null;
  try {
    const values = Object.fromEntries(Object.entries(context.variables).filter((entry): entry is [string, number | string | boolean | (number | string | boolean)[]] => {
      const value = entry[1];
      return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || (Array.isArray(value) && value.every(x => ['number', 'string', 'boolean'].includes(typeof x)));
    }));
    const result = evaluateExpression(parseExpression(node.condition), values);
    return typeof result === 'boolean' ? { nodeId: node.id, expression: node.condition, expected: result } : null;
  } catch { return null; }
}
