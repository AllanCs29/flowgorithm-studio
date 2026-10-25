import { FlowFunction, FlowNode, FlowProject, NodeId } from './models';
import { deleteNode, insertNode, InsertPosition, moveNode, replaceNode } from './structural';

export interface CommandResult { readonly success: boolean; readonly project?: FlowProject; readonly error?: string; }
export interface DomainCommand { readonly type: string; execute(project: FlowProject): CommandResult; }
function updateFunction(project: FlowProject, func: FlowFunction): FlowProject { return { ...project, functions: { ...project.functions, [func.id]: func } }; }
function safe(fn: () => FlowProject): CommandResult { try { return { success: true, project: fn() }; } catch (error) { return { success: false, error: error instanceof Error ? error.message : String(error) }; } }

export class InsertBlockCommand implements DomainCommand {
  readonly type = 'INSERT_BLOCK';
  constructor(readonly functionId: string, readonly node: FlowNode, readonly anchorId: NodeId, readonly position: InsertPosition) {}
  execute(project: FlowProject): CommandResult { const func = project.functions[this.functionId]; if (!func) return { success: false, error: 'Función no encontrada.' }; return safe(() => updateFunction(project, insertNode(func, this.node, this.anchorId, this.position))); }
}
export class MoveBlockCommand implements DomainCommand {
  readonly type = 'MOVE_BLOCK';
  constructor(readonly functionId: string, readonly nodeId: NodeId, readonly anchorId: NodeId, readonly position: InsertPosition) {}
  execute(project: FlowProject): CommandResult { const func = project.functions[this.functionId]; if (!func) return { success: false, error: 'Función no encontrada.' }; return safe(() => updateFunction(project, moveNode(func, this.nodeId, this.anchorId, this.position))); }
}
export class DeleteBlockCommand implements DomainCommand {
  readonly type = 'DELETE_BLOCK';
  constructor(readonly functionId: string, readonly nodeId: NodeId) {}
  execute(project: FlowProject): CommandResult { const func = project.functions[this.functionId]; if (!func) return { success: false, error: 'Función no encontrada.' }; return safe(() => updateFunction(project, deleteNode(func, this.nodeId))); }
}
export class UpdateNodeCommand implements DomainCommand {
  readonly type = 'UPDATE_NODE';
  constructor(readonly functionId: string, readonly node: FlowNode) {}
  execute(project: FlowProject): CommandResult { const func = project.functions[this.functionId]; if (!func) return { success: false, error: 'Función no encontrada.' }; return safe(() => updateFunction(project, replaceNode(func, this.node))); }
}