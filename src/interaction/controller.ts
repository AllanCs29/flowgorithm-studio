import { NodeId } from '../domain/models';
import { InsertPosition } from '../domain/structural';
export type PointerKind = 'mouse' | 'touch' | 'pen';
export interface PointerInput { readonly pointerId: number; readonly pointerType: PointerKind; readonly button: number; readonly x: number; readonly y: number; readonly clientX?: number; readonly clientY?: number; readonly shiftKey: boolean; readonly ctrlKey: boolean; readonly metaKey: boolean; }
export type InteractionIntent =
  | { readonly type: 'SELECT'; readonly nodeId: NodeId; readonly multi: boolean }
  | { readonly type: 'DESELECT' }
  | { readonly type: 'PAN_CANVAS'; readonly dx: number; readonly dy: number }
  | { readonly type: 'CANCEL_DRAG' }
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
  private activePointer: number | null = null;
  private down: { id: NodeId; x: number; y: number; screenX: number; screenY: number; node: boolean; multi: boolean; canDrag: boolean } | null = null;
  private lastScreen: { x: number; y: number } | null = null;
  private dragging = false;
  private touchMoved = false;
  private contextShown = false;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly threshold = 7;
  private readonly touchThreshold = 9;
  private readonly longPressMs = 430;
  private pointerKind: PointerKind = 'mouse';
  constructor(private readonly emit: IntentSink) {}

  pointerDownNode(id: NodeId, event: PointerInput, canDrag = true): void {
    if (this.activePointer !== null) return;
    this.activePointer = event.pointerId;
    const screenX = event.clientX ?? event.x, screenY = event.clientY ?? event.y;
    this.down = { id, x: event.x, y: event.y, screenX, screenY, node: true, multi: event.shiftKey || event.ctrlKey || event.metaKey, canDrag };
    this.lastScreen = { x: screenX, y: screenY };
    this.dragging = false; this.touchMoved = false; this.contextShown = false; this.pointerKind = event.pointerType;
    if (event.button === 2) {
      this.contextShown = true;
      this.emit({ type: 'CONTEXT_MENU', nodeId: id, x: event.x, y: event.y });
      return;
    }
    if (canDrag && (event.pointerType === 'touch' || event.pointerType === 'pen')) {
      // Solo después de mantener presionado se puede arrastrar un bloque.
      this.holdTimer = setTimeout(() => {
        if (this.activePointer !== event.pointerId || !this.down || this.touchMoved || this.contextShown) return;
        this.dragging = true;
        this.emit({ type: 'START_DRAG', nodeId: id, x: this.down.x, y: this.down.y });
      }, this.longPressMs);
    }
  }
  pointerDownCanvas(event: PointerInput): void {
    if (this.activePointer !== null) return;
    this.activePointer = event.pointerId;
    const screenX = event.clientX ?? event.x, screenY = event.clientY ?? event.y;
    this.down = { id: '' as NodeId, x: event.x, y: event.y, screenX, screenY, node: false, multi: false, canDrag: false };
    this.lastScreen = { x: screenX, y: screenY };
    this.dragging = false; this.touchMoved = false; this.contextShown = false; this.pointerKind = event.pointerType;
    if (event.button === 2) { this.contextShown = true; this.emit({ type: 'CONTEXT_MENU', x: event.x, y: event.y }); }
  }
  pointerMove(id: NodeId, event: PointerInput): void {
    if (this.activePointer !== event.pointerId || !this.down || this.contextShown) return;
    const screenX = event.clientX ?? event.x, screenY = event.clientY ?? event.y;
    const dxScreen = screenX - this.down.screenX, dyScreen = screenY - this.down.screenY;
    if (this.pointerKind === 'touch' || this.pointerKind === 'pen') {
      if (this.dragging) {
        this.emit({ type: 'UPDATE_DRAG', nodeId: this.down.id, x: event.x, y: event.y });
        return;
      }
      if (this.touchMoved || Math.hypot(dxScreen,dyScreen) > this.touchThreshold) {
        // Si se desliza antes de los 430 ms, desplaza la vista, no el bloque.
        this.touchMoved = true;
        this.cancelHold();
        const last = this.lastScreen ?? { x: screenX, y: screenY };
        this.emit({ type: 'PAN_CANVAS', dx: screenX - last.x, dy: screenY - last.y });
      }
      this.lastScreen = { x: screenX, y: screenY };
      return;
    }
    const dx = event.x - this.down.x, dy = event.y - this.down.y;
    if (this.down.node && this.down.canDrag && !this.dragging && Math.hypot(dx,dy) > this.threshold) {
      this.dragging = true;
      this.cancelHold();
      this.emit({ type: 'START_DRAG', nodeId: id, x: this.down.x, y: this.down.y });
    }
    if (this.dragging && this.down.node) this.emit({ type: 'UPDATE_DRAG', nodeId: id, x: event.x, y: event.y });
  }
  pointerUp(id: NodeId, event: PointerInput): void {
    if (this.activePointer !== event.pointerId || !this.down) return;
    this.cancelHold();
    if (this.contextShown || this.touchMoved) { this.reset(); return; }
    if (this.down.node) {
      if (this.dragging) this.emit({ type: 'END_DRAG', nodeId: id, x: event.x, y: event.y });
      else this.emit({ type: 'SELECT', nodeId: id, multi: this.down.multi || event.shiftKey || event.ctrlKey || event.metaKey });
    } else if (!this.dragging) this.emit({ type: 'DESELECT' });
    this.reset();
  }
  pointerCancel(pointerId: number): void {
    if (pointerId !== this.activePointer) return;
    this.cancelHold();
    // No insertar ni mover cuando iOS cancela un gesto (notificación, llamada, etc.).
    if (this.dragging && this.down?.node) this.emit({type:'CANCEL_DRAG'});
    this.reset();
  }
  keyDown(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}): void {
    if ((modifiers.ctrlKey || modifiers.metaKey) && key.toLowerCase() === 'z') this.emit({ type: modifiers.shiftKey ? 'REDO' : 'UNDO' });
    else if ((modifiers.ctrlKey || modifiers.metaKey) && key.toLowerCase() === 'y') this.emit({ type: 'REDO' });
  }
  dispose(): void { this.cancelHold(); this.reset(); }
  private cancelHold(): void { if (this.holdTimer) clearTimeout(this.holdTimer); this.holdTimer = null; }
  private reset(): void { this.activePointer = null; this.down = null; this.lastScreen = null; this.dragging = false; this.touchMoved = false; this.contextShown = false; }
}
