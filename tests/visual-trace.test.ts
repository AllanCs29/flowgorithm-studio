import { describe, expect, it } from 'vitest';
import { FlowFunction, FlowNode, functionId, nodeId } from '../src/domain/models';
import { initialContext, stepExecution } from '../src/interpreter/engine';
import { appendVisualFrame, initialVisualFrame, memoryDiff, upcomingDecision, visualFrame } from '../src/interpreter/visualTrace';

const n = nodeId;
function f(nodes: Record<string, FlowNode>): FlowFunction {
  return { id: functionId('main'), name: 'Main', parameters: [], rootNodeId: n('start'), nodes };
}
function advance(func: FlowFunction, before = initialContext(func)) {
  const after = stepExecution(func, before).context;
  return { after, trace: visualFrame(before, after, func) };
}

describe('V7 — visual playback based on the real interpreter', () => {
  it('starts before Inicio and stores a detached snapshot', () => {
    const func = f({ start: { id:n('start'),type:'Start',next:n('end') }, end:{id:n('end'),type:'End'} });
    const original = initialContext(func);
    const first = initialVisualFrame(original);
    original.outputLog.push('mutation');
    expect(first.context.outputLog).toHaveLength(0);
    expect(first.context.stepCount).toBe(0);
  });
  it('records declaration, assignment and exact changes without modifying earlier frames', () => {
    const func = f({ start:{id:n('start'),type:'Start',next:n('d')}, d:{id:n('d'),type:'Declare',name:'total',dataType:'Integer',next:n('a')},a:{id:n('a'),type:'Assign',target:'total',expression:'7',next:n('end')},end:{id:n('end'),type:'End'} });
    let ctx = initialContext(func);
    const frames = [initialVisualFrame(ctx)];
    for(let i=0;i<3;i++) {const result=advance(func,ctx);frames.push(result.trace);ctx=result.after;}
    expect(frames[2].changes[0].name).toBe('total');
    expect(frames[2].changes[0].after).toBe(0);
    expect(frames[3].changes[0].before).toBe(0);
    expect(frames[3].changes[0].after).toBe(7);
    expect(frames[2].context.variables.total).toBe(0);
    expect(frames[3].context.variables.total).toBe(7);
  });
  it('reveals the true/false route executed by Si instead of calculating it again', () => {
    const func = f({ start:{id:n('start'),type:'Start',next:n('if')},if:{id:n('if'),type:'If',condition:'2 < 1',trueNext:n('yes'),falseNext:n('no'),next:n('end')},yes:{id:n('yes'),type:'Output',expression:'"yes"',newLine:true},no:{id:n('no'),type:'Output',expression:'"no"',newLine:true},end:{id:n('end'),type:'End'} });
    const ctx=advance(func).after;
    expect(upcomingDecision(func,ctx)?.expected).toBe(false);
    const taken=advance(func,ctx);
    expect(taken.after.lastDecision).toEqual({nodeId:n('if'),passed:false,phase:'check'});
    expect(taken.trace.decision?.passed).toBe(false);
    expect(taken.trace.explanation).toContain('rama No');
  });
  it('identifies the real termination of Mientras', () => {
    const func = f({start:{id:n('start'),type:'Start',next:n('w')},w:{id:n('w'),type:'While',condition:'false',bodyNext:n('out'),next:n('end')},out:{id:n('out'),type:'Output',expression:'"unexpected"',newLine:true},end:{id:n('end'),type:'End'}});
    const afterStart=advance(func).after;
    const loop=advance(func,afterStart);
    expect(loop.trace.decision?.passed).toBe(false);
    expect(loop.trace.explanation).toContain('el ciclo termina');
  });
  it('marks a Do entry separately from the condition evaluation', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('do')},do:{id:n('do'),type:'Do',condition:'false',bodyNext:n('out'),next:n('end')},out:{id:n('out'),type:'Output',expression:'1',newLine:true},end:{id:n('end'),type:'End'}});
    let ctx=advance(func).after;
    const entry=advance(func,ctx);ctx=entry.after;
    expect(entry.trace.decision?.phase).toBe('entry');
    ctx=advance(func,ctx).after;
    const check=advance(func,ctx);
    expect(check.trace.decision).toEqual({nodeId:n('do'),passed:false,phase:'check'});
  });
  it('highlights only changed array cells', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('d')},d:{id:n('d'),type:'Declare',name:'a',dataType:'Integer',arraySize:'3',next:n('a')},a:{id:n('a'),type:'Assign',target:'a[1]',expression:'9',next:n('end')},end:{id:n('end'),type:'End'}});
    let ctx=initialContext(func);ctx=advance(func,ctx).after;ctx=advance(func,ctx).after;
    const assigned=advance(func,ctx);
    expect(assigned.trace.changes[0].changedIndices).toEqual([1]);
    expect(assigned.trace.context.variables.a).toEqual([0,9,0]);
    expect(ctx.variables.a).toEqual([0,0,0]);
  });
  it('records output and handles errors as visual explanation', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('out')},out:{id:n('out'),type:'Output',expression:'"ok"',newLine:true,next:n('err')},err:{id:n('err'),type:'Assign',target:'missing',expression:'1'}});
    let ctx=advance(func).after;
    const printed=advance(func,ctx);ctx=printed.after;
    expect(printed.trace.newOutput).toBe('ok\n');
    const failed=advance(func,ctx);
    expect(failed.trace.context.status).toBe('ERROR');
    expect(failed.trace.explanation).toContain('error');
  });
  it('caps the saved timeline without changing underlying step counts', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('end')},end:{id:n('end'),type:'End'}});
    const frame=initialVisualFrame(initialContext(func));
    let history=[frame];
    for(let i=0;i<30;i++) history=appendVisualFrame(history,frame,6);
    expect(history).toHaveLength(6);
    expect(history[0].context.stepCount).toBe(0);
  });
  it('records each Para decision and counter update including the final exit', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('d')},d:{id:n('d'),type:'Declare',name:'i',dataType:'Integer',next:n('for')},for:{id:n('for'),type:'For',variable:'i',start:'1',end:'2',step:'1',direction:'Inc',bodyNext:n('out'),next:n('end')},out:{id:n('out'),type:'Output',expression:'i',newLine:true},end:{id:n('end'),type:'End'}});
    let ctx=initialContext(func);const decisions: boolean[]=[];
    for(let counter=0;counter<20 && ctx.status!=='FINISHED';counter++) {
      const next=advance(func,ctx);if(next.trace.decision)decisions.push(next.trace.decision.passed);ctx=next.after;
    }
    expect(decisions).toEqual([true,true,false]);
    expect(ctx.variables.i).toBe(3);
    expect(ctx.outputLog.join('')).toBe('1\n2\n');
  });
  it('shows a waiting-input frame and then a successful value without adding a step', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('d')},d:{id:n('d'),type:'Declare',name:'edad',dataType:'Integer',next:n('input')},input:{id:n('input'),type:'Input',target:'edad',next:n('end')},end:{id:n('end'),type:'End'}});
    let ctx=initialContext(func);for(let i=0;i<3;i++)ctx=advance(func,ctx).after;
    expect(ctx.status).toBe('WAITING_INPUT');
    const resumed=stepExecution(func,ctx,'19').context;
    const trace=visualFrame(ctx,resumed,func);
    expect(resumed.stepCount).toBe(ctx.stepCount);
    expect(trace.changes[0].after).toBe(19);
    expect(ctx.variables.edad).toBe(0);
  });
  it('safely declines prediction if a condition calls a function', () => {
    const func=f({start:{id:n('start'),type:'Start',next:n('if')},if:{id:n('if'),type:'If',condition:'isValid(3)',next:n('end')},end:{id:n('end'),type:'End'}});
    const ctx=advance(func).after;
    expect(upcomingDecision(func,ctx)).toBeNull();
  });
  it('calculates array diffs for initialization and replacement without losing previous values', () => {
    const func=f({start:{id:n('start'),type:'Start'}});
    const before={...initialContext(func),variables:{items:[1,2,3]}};
    const after={...initialContext(func),variables:{items:[1,4,3]}};
    expect(memoryDiff(before,after)[0].changedIndices).toEqual([1]);
    expect(before.variables.items).toEqual([1,2,3]);
  });
});
