import { FlowProject, FlowNode, NodeId, FunctionId, createDefaultNode, makeId } from '../domain/models';
import { DeleteBlockCommand, InsertBlockCommand, MoveBlockCommand, UpdateNodeCommand } from '../domain/commands';
import { InsertPosition, validateProject } from '../domain/structural';
import { InteractionIntent } from '../interaction/controller';
export interface DispatchState { readonly project: FlowProject; readonly selectedIds: ReadonlySet<NodeId>; readonly error?: string; }
export class CommandDispatcher {
  private undoStack: FlowProject[] = []; private redoStack: FlowProject[] = [];
  constructor(private state: DispatchState, private readonly setState: (next: DispatchState) => void, private readonly getAnchor: () => NodeId, private readonly getFunctionId: () => FunctionId = () => this.state.project.mainFunctionId) {}
  getState(): DispatchState { return this.state; }
  /** Syncs externally-owned React state into the dispatcher without causing another render. */
  syncExternalState(next: DispatchState): void { this.state = next; }
  setSelection(ids: ReadonlySet<NodeId>): void { this.set({ ...this.state, selectedIds: new Set(ids), error: undefined }); }
  updateNode(node: FlowNode): void { this.execute(new UpdateNodeCommand(this.getFunctionId(), node)); }
  insert(type: FlowNode['type'], anchor: NodeId = this.getAnchor(), position: InsertPosition = 'After'): NodeId | null { const node = createDefaultNode(type, makeId()); return this.execute(new InsertBlockCommand(this.getFunctionId(), node, anchor, position)) ? node.id : null; }
  delete(id: NodeId): boolean { const succeeded = this.execute(new DeleteBlockCommand(this.getFunctionId(), id)); if (succeeded) this.setSelection(new Set()); return succeeded; }
  move(id: NodeId, anchor: NodeId, position: InsertPosition): boolean { return this.execute(new MoveBlockCommand(this.getFunctionId(), id, anchor, position)); }
  dispatch(intent: InteractionIntent): void {
    switch (intent.type) {
      case 'SELECT': { const next = new Set(intent.multi ? this.state.selectedIds : []); if (next.has(intent.nodeId) && intent.multi) next.delete(intent.nodeId); else next.add(intent.nodeId); this.setSelection(next); break; }
      case 'DESELECT': this.setSelection(new Set()); break;
      case 'DELETE': this.delete(intent.nodeId); break;
      case 'UNDO': this.undo(); break;
      case 'REDO': this.redo(); break;
      case 'INSERT': this.insert(intent.nodeType, intent.anchorId, intent.position); break;
      default: break;
    }
  }
  undo(): void { const prev = this.undoStack.pop(); if (!prev) return; this.redoStack.push(this.state.project); this.set({ ...this.state, project: prev, selectedIds: new Set(), error: undefined }); }
  redo(): void { const next = this.redoStack.pop(); if (!next) return; this.undoStack.push(this.state.project); this.set({ ...this.state, project: next, selectedIds: new Set(), error: undefined }); }
  private execute(command: { execute(project: FlowProject): { success: boolean; project?: FlowProject; error?: string } }): boolean {
    const result = command.execute(this.state.project);
    if (!result.success || !result.project) { this.set({ ...this.state, error: result.error ?? 'Comando rechazado.' }); return false; }
    const validation = validateProject(result.project);
    if (!validation.valid) { this.set({ ...this.state, error: `Se rechazó el cambio: ${validation.errors.join(' ')}` }); return false; }
    this.undoStack.push(this.state.project); this.redoStack = [];
    this.set({ ...this.state, project: result.project, error: undefined });
    return true;
  }
  private set(next: DispatchState): void { this.state = next; this.setState(next); }
}