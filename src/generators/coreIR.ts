import { FlowFunction, FlowNode, FlowProject, NodeId } from '../domain/models';
export type CoreStatement =
  | { readonly kind: 'declare'; readonly name: string; readonly dataType: string; readonly arraySize?: string }
  | { readonly kind: 'assign'; readonly target: string; readonly expression: string }
  | { readonly kind: 'input'; readonly target: string }
  | { readonly kind: 'output'; readonly expression: string; readonly newLine: boolean }
  | { readonly kind: 'if'; readonly condition: string; readonly thenBody: readonly CoreStatement[]; readonly elseBody: readonly CoreStatement[] }
  | { readonly kind: 'while'; readonly condition: string; readonly body: readonly CoreStatement[] }
  | { readonly kind: 'do'; readonly condition: string; readonly body: readonly CoreStatement[] }
  | { readonly kind: 'for'; readonly variable: string; readonly start: string; readonly end: string; readonly step: string; readonly direction: 'Inc' | 'Dec'; readonly body: readonly CoreStatement[] }
  | { readonly kind: 'call'; readonly functionName: string; readonly args: readonly string[]; readonly target?: string }
  | { readonly kind: 'return'; readonly expression?: string }
  | { readonly kind: 'comment'; readonly text: string };
export interface CoreFunction { readonly name: string; readonly parameters: readonly { name: string; type: string }[]; readonly returnType: string; readonly body: readonly CoreStatement[]; }
export interface CoreProgram { readonly name: string; readonly functions: readonly CoreFunction[]; }

function statement(node: FlowNode, func: FlowFunction, seen: Set<NodeId>): CoreStatement | null {
  switch (node.type) {
    case 'Start': case 'End': return null;
    case 'Declare': return { kind: 'declare', name: node.name, dataType: node.dataType, arraySize: node.arraySize };
    case 'Assign': return { kind: 'assign', target: node.target, expression: node.expression };
    case 'Input': return { kind: 'input', target: node.target };
    case 'Output': return { kind: 'output', expression: node.expression, newLine: node.newLine };
    case 'If': return { kind: 'if', condition: node.condition, thenBody: buildSequence(func, node.trueNext, new Set(seen)), elseBody: buildSequence(func, node.falseNext, new Set(seen)) };
    case 'While': return { kind: 'while', condition: node.condition, body: buildSequence(func, node.bodyNext, new Set(seen)) };
    case 'Do': return { kind: 'do', condition: node.condition, body: buildSequence(func, node.bodyNext, new Set(seen)) };
    case 'For': return { kind: 'for', variable: node.variable, start: node.start, end: node.end, step: node.step, direction: node.direction, body: buildSequence(func, node.bodyNext, new Set(seen)) };
    case 'Call': return { kind: 'call', functionName: node.functionName, args: node.args, target: node.target };
    case 'Return': return { kind: 'return', expression: node.expression };
    case 'Comment': return { kind: 'comment', text: node.text };
  }
}
function buildSequence(func: FlowFunction, start: NodeId | undefined, seen: Set<NodeId>): CoreStatement[] {
  const out: CoreStatement[] = []; let id = start; let guard = 0;
  while (id && guard++ < 10000 && !seen.has(id)) { const n = func.nodes[id]; if (!n) break; seen.add(id); if (n.type === 'End') break; const s = statement(n, func, seen); if (s) { if(s.kind==='declare' && s.name.includes(',')) { for(const name of s.name.split(',').map(name=>name.trim()).filter(Boolean)) out.push({...s,name}); } else out.push(s); } id = n.next; }
  return out;
}
function compileFunction(func: FlowFunction): CoreFunction {
  return { name: func.name, parameters: func.parameters.map(p => ({ name: p.name, type: p.type.kind === 'Primitive' ? p.type.type : p.type.elementType })), returnType: func.returnType?.kind === 'Primitive' ? func.returnType.type : 'Void', body: buildSequence(func, func.rootNodeId, new Set()) };
}
export function toCoreIR(source: FlowFunction | FlowProject, name?: string): CoreProgram {
  if ('functions' in source && 'mainFunctionId' in source) {
    const project = source as FlowProject;
    return { name: name ?? project.metadata.title ?? 'FlowProgram', functions: Object.values(project.functions).map(compileFunction) };
  }
  const func = source as FlowFunction;
  return { name: name ?? func.name, functions: [compileFunction(func)] };
}
