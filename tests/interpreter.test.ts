import { describe, expect, it } from 'vitest';
import { sampleProject } from '../src/domain/sampleProject';
import { FlowFunction, FlowNode, functionId, nodeId } from '../src/domain/models';
import { initialContext, runToCompletion, stepExecution } from '../src/interpreter/engine';

function makeFunction(nodes: Record<string, FlowNode>): FlowFunction {
  return { id: functionId('main'), name: 'Main', parameters: [], nodes, rootNodeId: nodeId('start') };
}
const n = nodeId;

describe('Interpreter state machine — step, input, branches and loops', () => {
  it('highlights the next block after executing exactly one block', () => {
    const func = sampleProject.functions.main;
    const first = stepExecution(func, initialContext(func));
    expect(first.node?.type).toBe('Start');
    expect(first.context.stepCount).toBe(1);
    expect(first.context.currentNodeId).toBe(n('declare'));
    expect(first.context.status).toBe('PAUSED');
  });

  it('pauses for Input and continues deterministically after submission', () => {
    const func = sampleProject.functions.main;
    let context = initialContext(func);
    context = stepExecution(func, context).context; // Start
    context = stepExecution(func, context).context; // Declare
    context = stepExecution(func, context).context; // Input request
    expect(context.status).toBe('WAITING_INPUT');
    expect(context.pendingInput).toBe('edad');
    const countBeforeInput = context.stepCount;
    context = stepExecution(func, context, '20').context;
    expect(context.status).toBe('PAUSED');
    expect(context.stepCount).toBe(countBeforeInput); // Input is counted once, not twice.
    let guard = 0;
    while (context.status !== 'FINISHED' && context.status !== 'ERROR' && guard++ < 50) context = stepExecution(func, context).context;
    expect(context.status).toBe('FINISHED');
    expect(context.outputLog.join('')).toContain('Eres mayor de edad');
  });

  it('keeps an invalid input dialog recoverable instead of locking execution in ERROR', () => {
    const func = sampleProject.functions.main;
    let context = initialContext(func);
    for (let i = 0; i < 3; i++) context = stepExecution(func, context).context;
    context = stepExecution(func, context, 'dieciocho').context;
    expect(context.status).toBe('WAITING_INPUT');
    expect(context.pendingInput).toBe('edad');
    expect(context.error).toContain('Integer');
    expect(context.currentNodeId).toBe(n('input'));
    context = stepExecution(func, context, '18').context;
    expect(context.status).toBe('PAUSED');
    expect(context.error).toBeUndefined();
    let guard = 0;
    while (context.status !== 'FINISHED' && context.status !== 'ERROR' && guard++ < 50) context = stepExecution(func, context).context;
    expect(context.outputLog.join('')).toContain('Eres mayor de edad');
  });

  it('validates input using the declared type', () => {
    const func = sampleProject.functions.main;
    let context = initialContext(func);
    context = stepExecution(func, context).context;
    context = stepExecution(func, context).context;
    context = stepExecution(func, context).context;
    context = stepExecution(func, context, 'dieciocho').context;
    expect(context.status).toBe('WAITING_INPUT');
    expect(context.error).toContain('Integer');
  });

  it('takes the true branch and rejoins at the continuation', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('if') },
      if: { id: n('if'), type: 'If', condition: '1 < 2', trueNext: n('yes'), falseNext: n('no'), next: n('end') },
      yes: { id: n('yes'), type: 'Output', expression: '"sí"', newLine: true },
      no: { id: n('no'), type: 'Output', expression: '"no"', newLine: true },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
    expect(result.outputLog.join('')).toBe('sí\n');
    expect(result.controls).toHaveLength(0);
  });

  it('takes the false branch and rejoins after If', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('if') },
      if: { id: n('if'), type: 'If', condition: '1 > 2', trueNext: n('yes'), falseNext: n('no'), next: n('end') },
      yes: { id: n('yes'), type: 'Output', expression: '"sí"', newLine: true },
      no: { id: n('no'), type: 'Output', expression: '"no"', newLine: true },
      end: { id: n('end'), type: 'End' }
    });
    expect(runToCompletion(func).outputLog.join('')).toBe('no\n');
  });

  it('runs While until its condition becomes false and returns to the loop node', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'i', dataType: 'Integer', next: n('set') },
      set: { id: n('set'), type: 'Assign', target: 'i', expression: '1', next: n('while') },
      while: { id: n('while'), type: 'While', condition: 'i <= 3', bodyNext: n('out'), next: n('end') },
      out: { id: n('out'), type: 'Output', expression: 'i', newLine: true, next: n('inc') },
      inc: { id: n('inc'), type: 'Assign', target: 'i', expression: 'i + 1' },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
    expect(result.outputLog.join('')).toBe('1\n2\n3\n');
    expect(result.variables.i).toBe(4);
    expect(result.controls).toHaveLength(0);
  });

  it('executes Do body once before checking the condition', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'i', dataType: 'Integer', next: n('set') },
      set: { id: n('set'), type: 'Assign', target: 'i', expression: '0', next: n('do') },
      do: { id: n('do'), type: 'Do', condition: 'i < 1', bodyNext: n('inc'), next: n('out') },
      inc: { id: n('inc'), type: 'Assign', target: 'i', expression: 'i + 1' },
      out: { id: n('out'), type: 'Output', expression: 'i', newLine: true, next: n('end') },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
    expect(result.outputLog.join('')).toBe('1\n');
  });

  it('runs For with inclusive endpoints and increments by its step', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'i', dataType: 'Integer', next: n('for') },
      for: { id: n('for'), type: 'For', variable: 'i', start: '1', end: '5', step: '2', direction: 'Inc', bodyNext: n('out'), next: n('end') },
      out: { id: n('out'), type: 'Output', expression: 'i', newLine: true },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
    expect(result.outputLog.join('')).toBe('1\n3\n5\n');
  });

  it('reports an actionable error for assignment to an undeclared variable', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('assign') },
      assign: { id: n('assign'), type: 'Assign', target: 'missing', expression: '3', next: n('end') },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('ERROR');
    expect(result.error).toContain('no está declarada');
  });

  it('does not silently treat an array as its first scalar value', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'items', dataType: 'Integer', arraySize: '2', next: n('out') },
      out: { id: n('out'), type: 'Output', expression: 'items', newLine: true, next: n('end') },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('ERROR');
    expect(result.error).toContain('índice');
  });

  it('validates the root function and returns a controlled status for an empty execution pointer', () => {
    const func = makeFunction({ start: { id: n('start'), type: 'Start' } });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
  });
  it('rejects assignments that do not match the variable type', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'age', dataType: 'Integer', next: n('assign') },
      assign: { id: n('assign'), type: 'Assign', target: 'age', expression: '"twelve"', next: n('end') },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('ERROR');
    expect(result.error).toContain('variable Integer');
  });

  it('requires an integer scalar for the For control variable', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('declare') },
      declare: { id: n('declare'), type: 'Declare', name: 'i', dataType: 'Real', next: n('loop') },
      loop: { id: n('loop'), type: 'For', variable: 'i', start: '1', end: '3', step: '1', direction: 'Inc', bodyNext: n('out'), next: n('end') },
      out: { id: n('out'), type: 'Output', expression: 'i', newLine: true },
      end: { id: n('end'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('ERROR');
    expect(result.error).toContain('Integer escalar');
  });

  it('clears branch and loop frames when End terminates a nested path', () => {
    const func = makeFunction({
      start: { id: n('start'), type: 'Start', next: n('if') },
      if: { id: n('if'), type: 'If', condition: 'true', trueNext: n('end'), next: n('after') },
      after: { id: n('after'), type: 'Output', expression: '"unreachable"', newLine: true, next: n('end2') },
      end: { id: n('end'), type: 'End' },
      end2: { id: n('end2'), type: 'End' }
    });
    const result = runToCompletion(func);
    expect(result.status).toBe('FINISHED');
    expect(result.outputLog).toHaveLength(0);
    expect(result.controls).toHaveLength(0);
  });

});
