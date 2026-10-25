import { FlowFunction, FlowNode, PrimitiveType, RuntimeValue, NodeId, FlowProject } from '../domain/models';
import { evaluateExpression, formatValue, parseExpression, Value } from '../parser/expression';

export type RunStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'WAITING_INPUT' | 'STOPPED' | 'FINISHED' | 'ERROR';

export interface LoopFrame {
  readonly kind: 'While' | 'Do' | 'For';
  readonly nodeId: NodeId;
  readonly variable?: string;
  readonly end?: number;
  readonly step?: number;
}
export interface BranchFrame {
  readonly kind: 'branch';
  readonly nodeId: NodeId;
  readonly continuation?: NodeId;
}
export type ControlFrame = BranchFrame | LoopFrame;

/** currentNodeId is the next block to execute, so the UI can highlight it before each step. */
export interface ExecutionContext {
  status: RunStatus;
  currentNodeId?: NodeId;
  lastExecutedNodeId?: NodeId;
  variables: Record<string, RuntimeValue>;
  outputLog: string[];
  stepCount: number;
  pendingInput?: string;
  error?: string;
  controls: ControlFrame[];
  returnValue?: RuntimeValue;
  /** Decision made in the most recent executed block; UI only, does not drive control flow. */
  lastDecision?: { readonly nodeId: NodeId; readonly passed: boolean; readonly phase?: 'entry' | 'check' };
}
export interface StepResult { readonly context: ExecutionContext; readonly node?: FlowNode; }

const copy = (context: ExecutionContext): ExecutionContext => ({
  ...context,
  variables: Object.fromEntries(Object.entries(context.variables).map(([name, value]) => [name, Array.isArray(value) ? [...value] : value])),
  outputLog: [...context.outputLog],
  controls: context.controls.map(frame => ({ ...frame })) as ControlFrame[]
});

function scalarScope(values: Record<string, RuntimeValue>): Record<string, Value | Value[]> {
  const scope: Record<string, Value | Value[]> = {};
  for (const [name, item] of Object.entries(values)) {
    if (item === null) continue;
    if (Array.isArray(item)) {
      if (item.every(value => typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean')) scope[name] = item as Value[];
    } else if (typeof item === 'number' || typeof item === 'string' || typeof item === 'boolean') scope[name] = item;
  }
  return scope;
}
function indexedTarget(source: string): { name: string; index: string } | null {
  const match = /^([A-Za-z_ÁÉÍÓÚáéíóúÑñ][\wÁÉÍÓÚáéíóúÑñ]*)\s*\[(.+)\]$/.exec(source.trim());
  return match ? { name: match[1], index: match[2] } : null;
}
function resolveArrayIndex(target: { name: string; index: string }, values: Record<string, RuntimeValue>): number {
  const array = values[target.name];
  if (!Array.isArray(array)) throw new Error(`“${target.name}” no es un arreglo declarado.`);
  const index = evaluateExpression(parseExpression(target.index), scalarScope(values));
  if (typeof index !== 'number' || !Number.isSafeInteger(index)) throw new Error(`El índice de “${target.name}” debe ser entero.`);
  if (index < 0 || index >= array.length) throw new Error(`Índice ${index} fuera de “${target.name}” (0 a ${array.length - 1}).`);
  return index;
}
function asNumber(value: Value, context: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${context}: se esperaba un número y se recibió ${String(value)}.`);
  }
  return value;
}
function bool(value: Value, context: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${context}: la condición debe producir true o false, no ${String(value)}.`);
  return value;
}
function getStatus(context: ExecutionContext): RunStatus { return context.status; }

function defaultValue(type: PrimitiveType): RuntimeValue {
  if (type === 'String') return '';
  if (type === 'Boolean') return false;
  return 0;
}
function checkedAssignment(value: Value, expected: PrimitiveType, variableName: string): RuntimeValue {
  if (expected === 'Integer') {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
      throw new Error(`La variable Integer “${variableName}” necesita un entero seguro; se obtuvo ${String(value)}.`);
    }
    return value;
  }
  if (expected === 'Real') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`La variable Real “${variableName}” necesita un número finito; se obtuvo ${String(value)}.`);
    }
    return value;
  }
  if (expected === 'String') {
    if (typeof value !== 'string') throw new Error(`La variable String “${variableName}” necesita texto; se obtuvo ${String(value)}.`);
    return value;
  }
  if (typeof value !== 'boolean') throw new Error(`La variable Boolean “${variableName}” necesita true o false; se obtuvo ${String(value)}.`);
  return value;
}
function matchingLoop(context: ExecutionContext, nodeId: NodeId, kind: LoopFrame['kind']): LoopFrame | undefined {
  const top = context.controls[context.controls.length - 1];
  return top && top.kind === kind && top.nodeId === nodeId ? top : undefined;
}

/** Resolve branch tails and return control to the loop that owns a body. Does not execute a block. */
function completeRegions(context: ExecutionContext): void {
  let guard = 0;
  while (!context.currentNodeId && context.controls.length > 0 && guard++ < 1000) {
    const top = context.controls[context.controls.length - 1];
    if (top.kind === 'branch') {
      context.controls.pop();
      context.currentNodeId = top.continuation;
      continue;
    }
    // A loop body ended. Return to its control node; that next step evaluates its condition or index.
    context.currentNodeId = top.nodeId;
    return;
  }
  if (guard >= 1000) {
    context.status = 'ERROR';
    context.error = 'Demasiados bloques de control anidados al cerrar una rama.';
    return;
  }
  if (!context.currentNodeId && context.controls.length === 0) context.status = 'FINISHED';
}

export function initialContext(func: FlowFunction, parameters: Readonly<Record<string, RuntimeValue>> = {}): ExecutionContext {
  return {
    status: 'IDLE',
    currentNodeId: func.rootNodeId,
    variables: { ...parameters },
    outputLog: [],
    stepCount: 0,
    controls: []
  };
}

/** Executes exactly one flowchart block. Input submission resumes the already-counted Input block. */
export function stepExecution(func: FlowFunction, previous: ExecutionContext, input?: string, project?: FlowProject, depth = 0): StepResult {
  const context = copy(previous);
  if (context.status === 'FINISHED' || context.status === 'STOPPED' || context.status === 'ERROR') return { context };

  if (context.status === 'WAITING_INPUT') {
    if (input === undefined) return { context };
    context.lastDecision = undefined;
    const name = context.pendingInput ?? '';
    const current = context.currentNodeId ? func.nodes[context.currentNodeId] : undefined;
    try {
      if (!current || current.type !== 'Input') throw new Error('El estado de entrada no coincide con un bloque Entrada. Reinicia la ejecución.');
      const target = indexedTarget(name);
      const declaration = findDeclaration(func, target?.name ?? name);
      if (!declaration) throw new Error(`La variable “${name}” no está declarada.`);
      if (target) {
        const array = context.variables[target.name];
        const index = resolveArrayIndex(target, context.variables);
        if (!Array.isArray(array)) throw new Error(`“${target.name}” no es un arreglo.`);
        array[index] = parseInput(input, declaration.dataType);
      } else {
        if (declaration.arraySize !== undefined) throw new Error(`Para leer un elemento utiliza ${name}[índice].`);
        context.variables[name] = parseInput(input, declaration.dataType);
      }
      context.pendingInput = undefined;
      context.error = undefined;
      context.currentNodeId = current.next;
      completeRegions(context);
      const statusAfterCompletion = getStatus(context);
      if (statusAfterCompletion !== 'FINISHED' && statusAfterCompletion !== 'ERROR') {
        context.status = previous.status === 'RUNNING' ? 'RUNNING' : 'PAUSED';
      }
      return { context, node: current };
    } catch (error) {
      // Keep the modal/input state alive so the learner can correct the value without resetting.
      context.status = 'WAITING_INPUT';
      context.error = error instanceof Error ? error.message : String(error);
      return { context, node: current };
    }
  }

  if (!context.currentNodeId) {
    completeRegions(context);
    return { context };
  }
  const node = func.nodes[context.currentNodeId];
  if (!node) {
    context.status = 'ERROR';
    context.error = `El bloque ${context.currentNodeId} no existe en la función activa. Reinicia la ejecución o valida el diagrama.`;
    return { context };
  }

  context.stepCount += 1;
  if (context.stepCount > 100000) {
    context.status = 'ERROR';
    context.error = 'Se alcanzó el límite de 100 000 pasos. Revisa si existe un ciclo infinito.';
    return { context, node };
  }
  context.lastExecutedNodeId = node.id;
  context.lastDecision = undefined;
  const scope = (): Record<string, Value | Value[]> => scalarScope(context.variables);
  const userFunction = (name: string, args: readonly Value[]): Value => {
    if (!project) throw new Error(`La función “${name}” necesita el proyecto con sus definiciones.`);
    const called = Object.values(project.functions).find(item => item.name.toLowerCase() === name.toLowerCase());
    if (!called) throw new Error(`La función “${name}” no existe.`);
    if (called.parameters.length !== args.length) throw new Error(`“${name}” espera ${called.parameters.length} argumento(s), recibió ${args.length}.`);
    if (depth >= 40) throw new Error(`Límite de 40 llamadas anidadas: revisa el caso base de “${name}”.`);
    const parameters: Record<string, RuntimeValue> = {};
    called.parameters.forEach((parameter,index) => {
      if (parameter.type.kind !== 'Primitive') throw new Error('Parámetros de arreglos no implementados.');
      parameters[parameter.name] = checkedAssignment(args[index], parameter.type.type, parameter.name);
    });
    const result = runToCompletion(called, [], 7000, project, parameters, depth + 1);
    if (result.status !== 'FINISHED') throw new Error(`Error en “${name}”: ${result.error ?? 'no terminó correctamente'}.`);
    if (result.outputLog.length) context.outputLog.push(...result.outputLog);
    if (result.returnValue === undefined || result.returnValue === null) throw new Error(`La función “${name}” no devolvió ningún valor.`);
    if (called.returnType?.kind === 'Primitive') return checkedAssignment(result.returnValue as Value, called.returnType.type, `retorno de ${name}`) as Value;
    return result.returnValue as Value;
  };
  const value = (source: string | undefined): Value => {
    if (source === undefined || source.trim() === '') return 0;
    return evaluateExpression(parseExpression(source), scope(), userFunction);
  };
  const finishStep = (): StepResult => {
    if (!context.currentNodeId && context.status !== 'FINISHED' && context.status !== 'ERROR') completeRegions(context);
    if (context.status === 'IDLE' || (context.status === 'PAUSED' && previous.status === 'RUNNING')) {
      context.status = previous.status === 'RUNNING' ? 'RUNNING' : 'PAUSED';
    } else if (context.status !== 'FINISHED' && context.status !== 'ERROR' && context.status !== 'WAITING_INPUT') {
      context.status = previous.status === 'RUNNING' ? 'RUNNING' : 'PAUSED';
    }
    return { context, node };
  };

  try {
    switch (node.type) {
      case 'Start':
        context.currentNodeId = node.next;
        break;
      case 'End':
        context.currentNodeId = undefined;
        context.pendingInput = undefined;
        context.controls = [];
        context.status = 'FINISHED';
        break;
      case 'Declare': {
        const names=node.name.split(',').map(name=>name.trim());
        if (names.some(name=>!name || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(name))) {
          throw new Error('Los nombres de variables deben empezar con letra y no tener espacios. Sepáralos con comas.');
        }
        if (new Set(names.map(name=>name.toLowerCase())).size!==names.length || names.some(name=>Object.keys(context.variables).some(existing=>existing.toLowerCase()===name.toLowerCase()))) {
          throw new Error(`Una de las variables de “${node.name}” ya fue declarada.`);
        }
        let rawSize:number|undefined;
        if(node.arraySize!==undefined){
          rawSize=asNumber(value(node.arraySize),'Tamaño del arreglo');
          if(!Number.isInteger(rawSize)||rawSize<0||rawSize>10000){
            throw new Error('El tamaño del arreglo debe ser un entero entre 0 y 10 000.');
          }
        }
        for(const name of names){
          context.variables[name] = rawSize===undefined?defaultValue(node.dataType):Array.from({length:rawSize},()=>defaultValue(node.dataType));
        }
        context.currentNodeId=node.next;
        break;
      }
      case 'Assign': {
        const target = indexedTarget(node.target);
        const name = target?.name ?? node.target;
        if (!Object.prototype.hasOwnProperty.call(context.variables, name)) {
          throw new Error(`La variable “${name}” no está declarada. Usa Declarar antes de Asignar.`);
        }
        const declaration = findDeclaration(func, name);
        if (!declaration) throw new Error(`No se encontró la declaración de “${name}”.`);
        const evaluated = value(node.expression);
        if (target) {
          const index = resolveArrayIndex(target, context.variables);
          const array = context.variables[name];
          if (!Array.isArray(array) || declaration.arraySize === undefined) throw new Error(`“${name}” no es un arreglo.`);
          array[index] = checkedAssignment(evaluated, declaration.dataType, `${name}[${index}]`);
        } else {
          if (declaration.arraySize !== undefined) throw new Error(`Para asignar a “${name}”, indica un índice como ${name}[0].`);
          context.variables[name] = checkedAssignment(evaluated, declaration.dataType, name);
        }
        context.currentNodeId = node.next;
        break;
      }
      case 'Input': {
        const target = indexedTarget(node.target);
        const name = target?.name ?? node.target;
        const declaration = findDeclaration(func, name);
        if (!declaration) throw new Error(`La variable “${name}” no está declarada. Usa Declarar antes de Entrada.`);
        if (!Object.prototype.hasOwnProperty.call(context.variables, name)) throw new Error(`La variable “${name}” aún no fue declarada en tiempo de ejecución.`);
        if (target) resolveArrayIndex(target, context.variables);
        else if (declaration.arraySize !== undefined) throw new Error(`Para introducir elementos utiliza ${name}[índice].`);
        context.status = 'WAITING_INPUT';
        context.pendingInput = node.target;
        context.error = undefined;
        return { context, node };
      }
      case 'Output':
        context.outputLog.push(formatValue(value(node.expression)) + (node.newLine ? '\n' : ''));
        context.currentNodeId = node.next;
        break;
      case 'Comment':
        context.currentNodeId = node.next;
        break;
      case 'Return':
        context.returnValue = node.expression !== undefined ? value(node.expression) : null;
        context.currentNodeId = undefined;
        context.controls = [];
        context.status = 'FINISHED';
        break;
      case 'Call': {
        const returned = userFunction(node.functionName, node.args.map(arg => value(arg)));
        if (node.target) {
          const declaration = findDeclaration(func, node.target);
          if (!declaration || !Object.prototype.hasOwnProperty.call(context.variables, node.target)) throw new Error(`Declara “${node.target}” antes de guardar el resultado de ${node.functionName}.`);
          if (declaration.arraySize !== undefined) throw new Error('Destino de función: se requiere una variable escalar.');
          context.variables[node.target] = checkedAssignment(returned, declaration.dataType, node.target);
        }
        context.currentNodeId = node.next;
        break;
      }
      case 'If': {
        const branch = bool(value(node.condition), `Condición de Si (${node.id})`);
        context.lastDecision = { nodeId: node.id, passed: branch, phase: 'check' };
        const target = branch ? node.trueNext : node.falseNext;
        if (target) {
          context.controls.push({ kind: 'branch', nodeId: node.id, continuation: node.next });
          context.currentNodeId = target;
        } else context.currentNodeId = node.next;
        break;
      }
      case 'While': {
        let frame = matchingLoop(context, node.id, 'While');
        if (!frame) {
          frame = { kind: 'While', nodeId: node.id };
          context.controls.push(frame);
        }
        const passed = bool(value(node.condition), `Condición de Mientras (${node.id})`);
        context.lastDecision = { nodeId: node.id, passed, phase: 'check' };
        if (passed) {
          context.currentNodeId = node.bodyNext ?? node.id;
        } else {
          if (matchingLoop(context, node.id, 'While')) context.controls.pop();
          context.currentNodeId = node.next;
        }
        break;
      }
      case 'Do': {
        const frame = matchingLoop(context, node.id, 'Do');
        if (!frame) {
          context.lastDecision = { nodeId: node.id, passed: true, phase: 'entry' };
          context.controls.push({ kind: 'Do', nodeId: node.id });
          context.currentNodeId = node.bodyNext ?? node.id;
        } else {
          const passed = bool(value(node.condition), `Condición de Hacer mientras (${node.id})`);
          context.lastDecision = { nodeId: node.id, passed, phase: 'check' };
          if (passed) context.currentNodeId = node.bodyNext ?? node.id;
          else { context.controls.pop(); context.currentNodeId = node.next; }
        }
        break;
      }
      case 'For': {
        const frame = matchingLoop(context, node.id, 'For');
        if (!frame) {
          if (!Object.prototype.hasOwnProperty.call(context.variables, node.variable)) {
            throw new Error(`La variable de control “${node.variable}” debe declararse antes del ciclo Para.`);
          }
          const declaration = findDeclaration(func, node.variable);
          if (!declaration || declaration.dataType !== 'Integer' || declaration.arraySize !== undefined) {
            throw new Error(`La variable de control “${node.variable}” debe ser una variable Integer escalar.`);
          }
          const start = asNumber(value(node.start), 'Inicio de Para');
          const end = asNumber(value(node.end), 'Fin de Para');
          const step = Math.abs(asNumber(value(node.step), 'Paso de Para'));
          if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(step)) {
            throw new Error('Inicio, fin y paso de Para deben ser valores enteros.');
          }
          if (step === 0) throw new Error('El paso de Para no puede ser cero.');
          context.variables[node.variable] = start;
          const inRange = node.direction === 'Inc' ? start <= end : start >= end;
          context.lastDecision = { nodeId: node.id, passed: inRange, phase: 'check' };
          if (!inRange) context.currentNodeId = node.next;
          else {
            context.controls.push({ kind: 'For', nodeId: node.id, variable: node.variable, end, step });
            context.currentNodeId = node.bodyNext ?? node.id;
          }
        } else {
          const variable = frame.variable ?? node.variable;
          const old = asNumber(value(variable), `Variable de control ${variable}`);
          const nextValue = old + (node.direction === 'Inc' ? frame.step ?? 1 : -(frame.step ?? 1));
          context.variables[variable] = nextValue;
          const inRange = node.direction === 'Inc' ? nextValue <= (frame.end ?? 0) : nextValue >= (frame.end ?? 0);
          context.lastDecision = { nodeId: node.id, passed: inRange, phase: 'check' };
          if (inRange) context.currentNodeId = node.bodyNext ?? node.id;
          else {
            context.controls.pop();
            context.currentNodeId = node.next;
          }
        }
        break;
      }
    }
    return finishStep();
  } catch (error) {
    context.status = 'ERROR';
    context.error = error instanceof Error ? error.message : String(error);
    return { context, node };
  }
}

export function runToCompletion(func: FlowFunction, inputs: readonly string[] = [], maxSteps = 100000, project?: FlowProject, parameters: Readonly<Record<string, RuntimeValue>> = {}, depth = 0): ExecutionContext {
  let context = initialContext(func, parameters);
  context.status = 'RUNNING';
  let inputIndex = 0;
  let attempts = 0;
  while (context.status !== 'FINISHED' && context.status !== 'ERROR' && context.status !== 'STOPPED' && attempts++ < maxSteps + inputs.length + 1) {
    if (context.status === 'WAITING_INPUT') {
      if (inputIndex >= inputs.length) break;
      context = stepExecution(func, context, inputs[inputIndex++], project, depth).context;
      continue;
    }
    context = stepExecution(func, context, undefined, project, depth).context;
  }
  if (attempts >= maxSteps + inputs.length + 1 && context.status !== 'FINISHED' && context.status !== 'ERROR') {
    context.status = 'ERROR';
    context.error = 'Límite de ejecución excedido. Comprueba las condiciones de tus ciclos.';
  }
  return context;
}

function findDeclaration(func: FlowFunction, name: string): Extract<FlowNode, { type: 'Declare' }> | undefined {
  const declaration = Object.values(func.nodes).find(node => node.type === 'Declare' && node.name.split(',').some(item=>item.trim()===name));
  if (declaration?.type === 'Declare') return declaration;
  const parameter = func.parameters.find(item => item.name === name);
  if (parameter?.type.kind === 'Primitive') return {id: ('param_' + name) as NodeId, type:'Declare', name, dataType:parameter.type.type};
  return undefined;
}

function parseInput(text: string, expected: PrimitiveType): RuntimeValue {
  const trimmed = text.trim();
  if (expected === 'String') return text;
  if (expected === 'Boolean') {
    if (/^true$/i.test(trimmed)) return true;
    if (/^false$/i.test(trimmed)) return false;
    throw new Error(`Entrada inválida para Boolean: “${text}”. Escribe true o false.`);
  }
  if (expected === 'Integer') {
    if (!/^[+-]?\d+$/.test(trimmed)) throw new Error(`Entrada inválida para Integer: “${text}”. Escribe un número entero.`);
    const parsed = Number(trimmed);
    if (!Number.isSafeInteger(parsed)) throw new Error(`El entero “${text}” está fuera del rango seguro.`);
    return parsed;
  }
  if (!trimmed || !Number.isFinite(Number(trimmed))) throw new Error(`Entrada inválida para Real: “${text}”. Escribe un número, por ejemplo 3.14.`);
  return Number(trimmed);
}
