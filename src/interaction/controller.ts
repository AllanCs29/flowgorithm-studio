import { NodeId } from '../domain/models';
import { InsertPosition } from '../domain/structural';
export type PointerKind = 'mouse' | 'touch' | 'pen';
export interface PointerInput { readonly pointerId: number; readonly pointerType: PointerKind; readonly button: number; readonly x: number; readonly y: number; readonly shiftKey: boolean; readonly ctrlKey: boolean; readonly metaKey: boolean; }
export type InteractionIntent =
  | { readonly type: 'SELECT'; readonly nodeId: NodeId; readonly multi: boolean }
  | { readonly type: 'DESELECT' }
  | { readonly type: 'START_DRAG'; readonly nodeId: NodeId; readonly x: number; readonly y: number }
  | { readonly type: 'UPDATE_DRAG'; readonly nodeId: NodeId; readonly x: number; readonly y: number }
  | { readonly type: 'END_DRAG'; readonly nodeId: NodeId; readonly x: number; readonly y: number }
  | { readonly type: 'CONTEXT_MENU'; readonly nodeId?: NodeId; readonly x: number; readonly y: number }
  | { readonly type: 'INSERT'; readonly nodeType: import('../domain/models').FlowNode['type']; readonly anchorId: NodeId; readonly position: InsertPosition }
  | { readonly type: 'DELETE'; readonly nodeId: NodeId }
  | { readonly type: 'UNDO' | 'REDO' };
export type IntentSink = (intent: InteractionIntent) => void;

/** Input-agnostic controller: owns a pointer sequence and emits semantic intents, never mutates the AST. */
export class InteractionController {
  private activePointer: number | null = null; private down: { id: NodeId; x: number; y: number; node: boolean; multi: boolean } | null = null;
  private dragging = false; private contextShown = false; private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly threshold = 7; private readonly longPressMs = 520;
  constructor(private readonly emit: IntentSink) {}
  pointerDownNode(id: NodeId, event: PointerInput): void {
    if (this.activePointer !== null) return; this.activePointer = event.pointerId; this.down = { id, x: event.x, y: event.y, node: true, multi: event.shiftKey || event.ctrlKey || event.metaKey };
    this.dragging = false; this.contextShown = false;
    if (event.button === 2) { this.contextShown = true; this.emit({ type: 'CONTEXT_MENU', nodeId: id, x: event.x, y: event.y }); return; }
    if (event.pointerType !== 'mouse') this.holdTimer = setTimeout(() => { if (!this.dragging && this.down) { this.contextShown = true; this.emit({ type: 'CONTEXT_MENU', nodeId: id, x: this.down.x, y: this.down.y }); } }, this.longPressMs);
  }
  pointerDownCanvas(event: PointerInput): void {
    if (this.activePointer !== null) return; this.activePointer = event.pointerId; this.down = { id: '' as NodeId, x: event.x, y: event.y, node: false, multi: false };
    this.dragging = false; this.contextShown = false;
    if (event.button === 2) { this.contextShown = true; this.emit({ type: 'CONTEXT_MENU', x: event.x, y: event.y }); }
  }
  pointerMove(id: NodeId, event: PointerInput): void {
    if (this.activePointer !== event.pointerId || !this.down || this.contextShown) return;
    const dx = event.x - this.down.x; const dy = event.y - this.down.y;
    if (this.down.node && !this.dragging && (Math.abs(dx) > this.threshold || Math.abs(dy) > this.threshold)) { this.dragging = true; this.cancelHold(); this.emit({ type: 'START_DRAG', nodeId: id, x: this.down.x, y: this.down.y }); }
    if (this.dragging && this.down.node) this.emit({ type: 'UPDATE_DRAG', nodeId: id, x: event.x, y: event.y });
  }
  pointerUp(id: NodeId, event: PointerInput): void {
    if (this.activePointer !== event.pointerId || !this.down) return; this.cancelHold();
    if (this.contextShown) { this.reset(); return; }
    if (this.down.node) {
      if (this.dragging) this.emit({ type: 'END_DRAG', nodeId: id, x: event.x, y: event.y });
      else this.emit({ type: 'SELECT', nodeId: id, multi: this.down.multi || event.shiftKey || event.ctrlKey || event.metaKey });
    } else if (!this.dragging) this.emit({ type: 'DESELECT' });
    this.reset();
  }
  pointerCancel(pointerId: number): void { if (pointerId !== this.activePointer) return; this.cancelHold(); this.reset(); }
  keyDown(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}): void {
    if ((modifiers.ctrlKey || modifiers.metaKey) && key.toLowerCase() === 'z') this.emit({ type: modifiers.shiftKey ? 'REDO' : 'UNDO' });
    else if ((modifiers.ctrlKey || modifiers.metaKey) && key.toLowerCase() === 'y') this.emit({ type: 'REDO' });
  }
  private cancelHold(): void { if (this.holdTimer) clearTimeout(this.holdTimer); this.holdTimer = null; }
  private reset(): void { this.activePointer = null; this.down = null; this.dragging = false; this.contextShown = false; }
}