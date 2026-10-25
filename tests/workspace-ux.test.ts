import { describe, expect, it } from 'vitest';
import { FlowNode, nodeId } from '../src/domain/models';
import { insertionLabel, insertionTargets, preferredLeftSection } from '../src/ui/workspaceModel';

describe('Editor guiado: destinos de inserción y modos', () => {
  const node = (type: FlowNode['type']): FlowNode => ({id:nodeId(`ux-${type}`),type} as FlowNode);
  it('explains the learning mode before showing the pieces', () => {
    expect(preferredLeftSection('learn')).toBe('lesson');
    expect(preferredLeftSection('practice')).toBe('pieces');
    expect(preferredLeftSection('free')).toBe('pieces');
  });
  it('keeps decisions as two independent branches (no cycle)', () => {
    expect(insertionTargets(node('If'))).toEqual(['After','InsideTrue','InsideFalse']);
    expect(insertionTargets(node('If')).includes('InsideBody')).toBe(false);
  });
  it('shows a body insertion target for each of the three loops', () => {
    for (const type of ['While','Do','For'] as const) expect(insertionTargets(node(type))).toEqual(['After','InsideBody']);
  });
  it('does not offer insertion after Fin or into an empty selection', () => {
    expect(insertionTargets(node('End'))).toEqual(['Before']);
    expect(insertionTargets(undefined)).toHaveLength(0);
  });
  it('gives beginner-friendly labels to insertion targets', () => {
    expect(insertionLabel('InsideTrue')).toContain('Sí');
    expect(insertionLabel('InsideFalse')).toContain('No');
    expect(insertionLabel('InsideBody')).toContain('ciclo');
  });
});
