import { describe, expect, it } from 'vitest';
import { createDefaultNode, FlowFunction, FlowNode, functionId, nodeId } from '../src/domain/models';
import { firstIncompleteNode, incompleteMessage, missingFields } from '../src/domain/blockCompleteness';
import { InteractionController, InteractionIntent, PointerInput } from '../src/interaction/controller';

describe('v14.2: el estudiante configura sus propios bloques', () => {
  it('Si no trae true ni false: solicita una condición', () => {
    const node = createDefaultNode('If');
    expect(node.type).toBe('If');
    if (node.type !== 'If') return;
    expect(node.condition).toBe('');
    expect(missingFields(node)).toEqual([{ key: 'condition', label: 'condición' }]);
    expect(missingFields({ ...node, condition: 'edad >= 18' })).toEqual([]);
  });

  it('ningún bloque básico inserta respuestas falsas ni texto de ejemplo', () => {
    for (const type of ['Declare', 'Assign', 'Input', 'Output', 'While', 'Do', 'For', 'Call'] as const) {
      const node = createDefaultNode(type);
      expect(missingFields(node).length).toBeGreaterThan(0);
    }
  });

  it('señala el bloque incompleto y permite continuar al configurarlo', () => {
    const start = nodeId('start'), decision = nodeId('decision'), end = nodeId('end');
    const empty: FlowNode = { ...createDefaultNode('If', decision), next: end };
    const func: FlowFunction = {
      id: functionId('main'), name: 'Main', parameters: [], rootNodeId: start,
      nodes: { [start]: { id: start, type: 'Start', next: decision }, [decision]: empty, [end]: { id: end, type: 'End' } }
    };
    const problem = firstIncompleteNode(func);
    expect(problem?.node.id).toBe(decision);
    if (!problem) return;
    expect(incompleteMessage(problem.node, problem.field)).toContain('condición');
    const fixed: FlowFunction = { ...func, nodes: { ...func.nodes, [decision]: { ...empty, type: 'If', condition: 'edad >= 18' } } };
    expect(firstIncompleteNode(fixed)).toBeNull();
  });
});

describe('v14.2: los gestos móviles no mueven piezas por accidente', () => {
  const touch = (x: number, y: number, pointerType: 'touch' | 'mouse' = 'touch'): PointerInput => ({
    pointerId: 1, pointerType, button: 0, x, y, shiftKey: false, ctrlKey: false, metaKey: false
  });

  it('deslizar el dedo no selecciona ni arrastra un bloque', () => {
    const intents: InteractionIntent[] = [];
    const controller = new InteractionController(intent => intents.push(intent));
    controller.pointerDownNode(nodeId('si'), touch(0, 0));
    controller.pointerMove(nodeId('si'), touch(0, 80));
    controller.pointerUp(nodeId('si'), touch(0, 80));
    expect(intents.some(intent => ['SELECT','START_DRAG','UPDATE_DRAG','END_DRAG'].includes(intent.type))).toBe(false);
    expect(intents.some(intent => intent.type === 'PAN_CANVAS')).toBe(true);
  });

  it('tocar sí selecciona y el arrastre con mouse sigue disponible', () => {
    const intents: InteractionIntent[] = [];
    const controller = new InteractionController(intent => intents.push(intent));
    controller.pointerDownNode(nodeId('si'), touch(10, 10));
    controller.pointerUp(nodeId('si'), touch(10, 10));
    expect(intents[0]?.type).toBe('SELECT');
    controller.pointerDownNode(nodeId('si'), touch(0, 0, 'mouse'));
    controller.pointerMove(nodeId('si'), touch(50, 30, 'mouse'));
    controller.pointerUp(nodeId('si'), touch(50, 30, 'mouse'));
    expect(intents.some(intent => intent.type === 'END_DRAG')).toBe(true);
  });
});
