import {describe,it,expect} from 'vitest';
import {parseExpression,evaluateExpression} from '../src/parser/expression';
import {circleScenario,scenarioFor,visualLessons,assertScenario} from '../src/learning/visualLessons';
import {conceptChecks} from '../src/learning/courseFlow';
import {lessons} from '../src/learning/learning';
import {FlowFunction,nodeId,functionId} from '../src/domain/models';
import {runToCompletion} from '../src/interpreter/engine';
import {toCoreIR} from '../src/generators/coreIR';

describe('v12 · fidelidad a Flowgorithm original',()=>{
  it('las asignaciones se enseñan con =, no con flecha de pseudocódigo',()=>{
    for(const [key, scenario] of Object.entries(visualLessons)){
      for(const block of scenario.blocks) expect(block.label).not.toContain('←');
      expect(assertScenario(scenario), key).toBe(true);
    }
    expect(conceptChecks.assign.question).toContain('total = total + 2');
    expect(scenarioFor('assign',true)?.blocks.map(b=>b.label)).toContain('total = total + 2');
  });
  it('pi, potencia ^, concatenación & e igualdad = se pueden evaluar',()=>{
    expect(evaluateExpression(parseExpression('pi * radius ^ 2'),{radius:3})).toBeCloseTo(Math.PI*9,9);
    expect(evaluateExpression(parseExpression('"The area is " & area'),{area:28.2743})).toBe('The area is 28.2743');
    expect(evaluateExpression(parseExpression('7 % 2 = 1'),{})).toBe(true);
    expect(evaluateExpression(parseExpression('"Hola " & nombre'),{nombre:'Ada'})).toBe('Hola Ada');
  });
  it('el mismo programa dibujado por el usuario se explica en seis pasos',()=>{
    const example=circleScenario(3);
    expect(example.blocks.map(b=>b.kind)).toEqual(['start','declare','input','assign','output','end']);
    expect(example.blocks[1].label).toBe('Real area, radius');
    expect(example.blocks[3].label).toBe('area = pi * radius ^ 2');
    expect(example.blocks[4].label).toBe('Output "The area is " & area');
    expect(example.moments[4].output).toBe('The area is 28.2743');
    expect(circleScenario(2).moments[4].output).toBe('The area is 12.5664');
    expect(assertScenario(example)).toBe(true);
  });
  it('Real area, radius crea las dos variables y ejecuta el programa del círculo',()=>{
    const n=nodeId;
    const flow:FlowFunction={id:functionId('main'),name:'Main',parameters:[],rootNodeId:n('start'),nodes:{
      start:{id:n('start'),type:'Start',next:n('declare')},
      declare:{id:n('declare'),type:'Declare',name:'area, radius',dataType:'Real',next:n('input')},
      input:{id:n('input'),type:'Input',target:'radius',next:n('assign')},
      assign:{id:n('assign'),type:'Assign',target:'area',expression:'pi * radius ^ 2',next:n('output')},
      output:{id:n('output'),type:'Output',expression:'"The area is " & area',newLine:true,next:n('end')},
      end:{id:n('end'),type:'End'}
    }};
    const result=runToCompletion(flow,['3']);
    expect(result.status).toBe('FINISHED');
    expect(result.variables.radius).toBe(3);
    expect(result.variables.area).toBeCloseTo(Math.PI*9,8);
    expect(result.outputLog.join('')).toContain('The area is 28.274');
    const core=toCoreIR(flow).functions[0].body;
    expect(core.filter(step=>step.kind==='declare').map(step=>step.kind==='declare'?step.name:'')).toEqual(['area','radius']);
  });
  it('todas las clases conservan escenario y evaluación',()=>{
    expect(lessons).toHaveLength(16);
    for(const lesson of lessons){expect(scenarioFor(lesson.id)).toBeDefined();expect(conceptChecks[lesson.id]).toBeDefined();}
  });
});
