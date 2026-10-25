import { FlowNode } from '../domain/models';
import { InsertPosition } from '../domain/structural';

export type WorkspaceMode = 'learn' | 'practice' | 'free';
export type LeftSection = 'lesson' | 'pieces' | 'help';

/** Targets are structural commands, never arbitrary XY coordinates. */
export function insertionTargets(node?: FlowNode): readonly InsertPosition[] {
  if (!node) return [];
  if (node.type === 'End') return ['Before'];
  if (node.type === 'If') return ['After', 'InsideTrue', 'InsideFalse'];
  if (node.type === 'While' || node.type === 'Do' || node.type === 'For') return ['After', 'InsideBody'];
  return ['After'];
}

export function preferredLeftSection(mode: WorkspaceMode): LeftSection {
  return mode === 'learn' ? 'lesson' : 'pieces';
}

export function insertionLabel(position: InsertPosition): string {
  switch (position) {
    case 'Before': return '＋ Antes de Fin';
    case 'After': return '＋ Después';
    case 'InsideTrue': return '＋ Rama Sí';
    case 'InsideFalse': return '＋ Rama No';
    case 'InsideBody': return '＋ Cuerpo del ciclo';
  }
}
