export type NodeId = string & { readonly __nodeId: unique symbol };
export type FunctionId = string & { readonly __functionId: unique symbol };
export type ProjectId = string & { readonly __projectId: unique symbol };

export const nodeId = (value: string): NodeId => value as NodeId;
export const functionId = (value: string): FunctionId => value as FunctionId;
export const projectId = (value: string): ProjectId => value as ProjectId;

export type PrimitiveType = 'Integer' | 'Real' | 'String' | 'Boolean';
export type CoreType = { kind: 'Primitive'; type: PrimitiveType } | { kind: 'Array'; elementType: PrimitiveType; dimensions: 1 };
export type RuntimeValue = number | string | boolean | null | RuntimeValue[];

export interface BaseNode { readonly id: NodeId; readonly next?: NodeId }
export interface StartNode extends BaseNode { readonly type: 'Start' }
export interface EndNode extends BaseNode { readonly type: 'End' }
export interface DeclareNode extends BaseNode { readonly type: 'Declare'; readonly name: string; readonly dataType: PrimitiveType; readonly arraySize?: string }
export interface AssignNode extends BaseNode { readonly type: 'Assign'; readonly target: string; readonly expression: string }
export interface InputNode extends BaseNode { readonly type: 'Input'; readonly target: string }
export interface OutputNode extends BaseNode { readonly type: 'Output'; readonly expression: string; readonly newLine: boolean }
export interface IfNode extends BaseNode { readonly type: 'If'; readonly condition: string; readonly trueNext?: NodeId; readonly falseNext?: NodeId }
export interface WhileNode extends BaseNode { readonly type: 'While'; readonly condition: string; readonly bodyNext?: NodeId }
export interface DoNode extends BaseNode { readonly type: 'Do'; readonly condition: string; readonly bodyNext?: NodeId }
export interface ForNode extends BaseNode { readonly type: 'For'; readonly variable: string; readonly start: string; readonly end: string; readonly step: string; readonly direction: 'Inc' | 'Dec'; readonly bodyNext?: NodeId }
export interface CallNode extends BaseNode { readonly type: 'Call'; readonly functionName: string; readonly args: readonly string[]; readonly target?: string }
export interface ReturnNode extends BaseNode { readonly type: 'Return'; readonly expression?: string }
export interface CommentNode extends BaseNode { readonly type: 'Comment'; readonly text: string }
export type FlowNode = StartNode | EndNode | DeclareNode | AssignNode | InputNode | OutputNode | IfNode | WhileNode | DoNode | ForNode | CallNode | ReturnNode | CommentNode;

export interface FlowVariable { readonly name: string; readonly type: CoreType; readonly initialValue?: RuntimeValue }
export interface FlowFunction { readonly id: FunctionId; readonly name: string; readonly parameters: readonly FlowVariable[]; readonly returnType?: CoreType; readonly nodes: Readonly<Record<string, FlowNode>>; readonly rootNodeId: NodeId }
export interface FlowProject { readonly id: ProjectId; readonly metadata: { readonly title: string; readonly author: string; readonly version: string }; readonly functions: Readonly<Record<string, FlowFunction>>; readonly mainFunctionId: FunctionId }

export const TYPE_LABELS: Readonly<Record<FlowNode['type'], string>> = {
  Start: 'Inicio', End: 'Fin', Declare: 'Declarar', Assign: 'Asignar', Input: 'Entrada', Output: 'Salida', If: 'Si', While: 'Mientras', Do: 'Hacer mientras', For: 'Para', Call: 'Llamar función', Return: 'Retornar', Comment: 'Comentario'
};

export function makeId(prefix = 'n'): NodeId { return nodeId(`${prefix}_${Math.random().toString(36).slice(2, 9)}`); }
export function coreType(type: PrimitiveType): CoreType { return { kind: 'Primitive', type }; }
export function primitiveName(type: CoreType): string { return type.kind === 'Primitive' ? type.type : `Array<${type.elementType}>`; }

export function createDefaultNode(type: FlowNode['type'], id: NodeId = makeId()): FlowNode {
  switch (type) {
    case 'Start': return { id, type };
    case 'End': return { id, type };
    case 'Declare': return { id, type, name: '', dataType: 'Integer' };
    case 'Assign': return { id, type, target: '', expression: '' };
    case 'Input': return { id, type, target: '' };
    case 'Output': return { id, type, expression: '', newLine: true };
    case 'If': return { id, type, condition: '' };
    case 'While': return { id, type, condition: '' };
    case 'Do': return { id, type, condition: '' };
    case 'For': return { id, type, variable: '', start: '', end: '', step: '', direction: 'Inc' };
    case 'Call': return { id, type, functionName: '', args: [] };
    case 'Return': return { id, type };
    case 'Comment': return { id, type, text: '' };
  }
}