import { describe, expect, it } from 'vitest';
import { sampleProject } from '../src/domain/sampleProject';
import { createDefaultNode, nodeId } from '../src/domain/models';
import { insertNode, moveNode, validateProject } from '../src/domain/structural';

describe('Domain structure', () => {
  it('accepts the sample project', () => { expect(validateProject(sampleProject).valid).toBe(true); });
  it('inserts a block immutably after a selected block', () => {
    const func = sampleProject.functions.main; const node = createDefaultNode('Output', nodeId('new_output'));
    const updated = insertNode(func, node, nodeId('input'), 'After');
    expect(func.nodes.input.next).toBe(nodeId('condition'));
    expect(updated.nodes.input.next).toBe(nodeId('new_output'));
    expect(updated.nodes.new_output.next).toBe(nodeId('condition'));
    expect(validateProject({ ...sampleProject, functions: { main: updated } }).valid).toBe(true);
  });
  it('rejects an invalid insertion before Start', () => { expect(() => insertNode(sampleProject.functions.main, createDefaultNode('Output', nodeId('x')), nodeId('start'), 'Before')).toThrow(); });
  it('allows moving a sequential sibling before the next block', () => { const f = sampleProject.functions.main; const moved = moveNode(f, nodeId('input'), nodeId('condition'), 'Before'); expect(moved.nodes.declare.next).toBe(nodeId('input')); expect(moved.nodes.input.next).toBe(nodeId('condition')); expect(validateProject({ ...sampleProject, functions: { main: moved } }).valid).toBe(true); });
  it('prevents moving a block into its descendant branch', () => { const f = sampleProject.functions.main; expect(() => moveNode(f, nodeId('condition'), nodeId('adult'), 'After')).toThrow(); });

  it('rejects multiple Start blocks and an End with a next pointer', () => {
    const func = sampleProject.functions.main;
    const malformed = {
      ...func,
      nodes: {
        ...func.nodes,
        second_start: { id: nodeId('second_start'), type: 'Start' as const },
        end: { ...func.nodes.end, next: nodeId('second_start') }
      }
    };
    const result = validateProject({ ...sampleProject, functions: { main: malformed } });
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('exactamente un bloque Inicio'))).toBe(true);
    expect(result.errors.some(error => error.includes('bloque Fin'))).toBe(true);
  });
});