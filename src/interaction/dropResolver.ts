import { FlowFunction, NodeId } from '../domain/models';
import { InsertPosition, parentOf } from '../domain/structural';
import { LayoutMap } from '../layout/layoutEngine';
export interface DropTarget { readonly anchorId: NodeId; readonly position: InsertPosition; readonly distance: number; }
export function resolveDropTarget(func: FlowFunction, layout: LayoutMap, draggedId: NodeId, x: number, y: number, snapRadius = 95): DropTarget | null {
  let best: DropTarget | null = null;
  for (const node of Object.values(func.nodes)) {
    if (node.id === draggedId || node.type === 'Start' || node.type === 'End') continue;
    const p = layout.nodes[node.id]; if (!p) continue;
    const zones: Array<{ position: InsertPosition; x: number; y: number }> = [
      { position: 'Before', x: p.x + p.width / 2, y: p.y - 3 },
      { position: 'After', x: p.x + p.width / 2, y: p.y + p.height + 3 }
    ];
    if (node.type === 'If') { zones.push({ position: 'InsideTrue', x: p.x + p.width + 20, y: p.y + p.height / 3 }); zones.push({ position: 'InsideFalse', x: p.x + p.width + 20, y: p.y + (p.height * 2) / 3 }); }
    if (node.type === 'While' || node.type === 'Do' || node.type === 'For') zones.push({ position: 'InsideBody', x: p.x + p.width + 20, y: p.y + p.height / 2 });
    for (const zone of zones) { const distance = Math.hypot(x - zone.x, y - zone.y); if (distance <= snapRadius && (!best || distance < best.distance)) best = { anchorId: node.id, position: zone.position, distance }; }
  }
  if (best && best.position === 'Before' && parentOf(func, best.anchorId) === null) return null;
  return best;
}