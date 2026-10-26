import { describe, expect, it } from 'vitest';
import { exerciseCriteria, exercises, gradeExercise } from '../src/learning/learning';
import { FlowFunction, FlowNode, nodeId } from '../src/domain/models';
import { insertNode } from '../src/domain/structural';
import { runToCompletion } from '../src/interpreter/engine';

const variable=exercises.find(item=>item.id==='variable')!;
const original=variable.project.functions[variable.project.mainFunctionId];
const evaluate=(func:FlowFunction)=>gradeExercise(variable,func,inputs=>runToCompletion(func,inputs,7000,variable.project));
const declare:FlowNode={id:nodeId('edad_declarada'),type:'Declare',name:'edad',dataType:'Integer'};

describe('v14.3 · evaluación que enseña el flujo real',()=>{
  it('no exige un cero, ni ningún número fijo, cuando la misión es declarar y mostrar edad',()=>{
    const created=insertNode(original,declare,nodeId('out'),'Before');
    expect(evaluate(created).passed).toBe(true);
    const changed=insertNode(created,{id:nodeId('set_age'),type:'Assign',target:'edad',expression:'7'},declare.id,'After');
    expect(runToCompletion(changed,[]).outputLog.join('')).toBe('7\n');
    expect(evaluate(changed).passed).toBe(true);
  });
  it('rechaza imprimir un literal y explica por qué se necesita la variable',()=>{
    const created=insertNode(original,declare,nodeId('out'),'Before');
    const wrong={...created,nodes:{...created.nodes,out:{...created.nodes.out,type:'Output' as const,expression:'7',newLine:true}}};
    const assessment=evaluate(wrong);
    expect(assessment.passed).toBe(false);
    expect(assessment.feedback.join(' ')).toContain('sin comillas');
    const word={...created,nodes:{...created.nodes,out:{...created.nodes.out,type:'Output' as const,expression:'"edad"',newLine:true}}};
    expect(evaluate(word).passed).toBe(false);
  });
  it('rechaza usar una variable antes de declararla',()=>{
    const last=insertNode(original,declare,nodeId('out'),'After');
    const assessment=evaluate(last);
    expect(assessment.passed).toBe(false);
    expect(assessment.feedback.join(' ')).toContain('antes de Salida');
  });
  it('detecta errores de tipo aunque el dato inicial sea válido',()=>{
    const wrongType=insertNode(original,{...declare,dataType:'String'},nodeId('out'),'Before');
    expect(evaluate(wrongType).passed).toBe(false);
  });
  it('para sumar, escribir 15 directamente en Salida no sustituye el bloque Asignar',()=>{
    const sum=exercises.find(item=>item.id==='sum')!;
    const func=sum.project.functions[sum.project.mainFunctionId];
    const cheated={...func,nodes:{...func.nodes,out:{...func.nodes.out,type:'Output' as const,expression:'15',newLine:true}}};
    const assessment=gradeExercise(sum,cheated,inputs=>runToCompletion(cheated,inputs));
    expect(assessment.passed).toBe(false);
    expect(assessment.feedback.join(' ')).toContain('Salida');
  });
  it('los criterios se pueden consultar antes de pulsar Comprobar',()=>{
    expect(exerciseCriteria(variable).join(' ')).toContain('Mostrar el contenido de edad');
  });
});
