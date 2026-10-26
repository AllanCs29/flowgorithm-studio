import { describe, expect, it } from 'vitest';
import { catalog, playableChallenges } from '../src/learning/challengeBank';
import { exercises, gradeExercise, lessons } from '../src/learning/learning';
import { runToCompletion } from '../src/interpreter/engine';
import { evaluate } from '../src/parser/expression';
import type { FlowFunction } from '../src/domain/models';

const programResult = (func: FlowFunction, inputs: readonly string[], project:typeof playableChallenges[number]['solution']) => runToCompletion(func,inputs,7000,project);

describe('v14.4 · auditoría de contenido, muestras y rúbricas',()=>{
  it('conserva 100 ejercicios ordenados, 16 clases y 11 niveles',()=>{
    expect(catalog.map(item=>item.number)).toEqual(Array.from({length:100},(_,i)=>i+1));
    expect(playableChallenges.length).toBe(100);
    expect(lessons.length).toBe(16);
    expect(new Set(lessons.map(item=>item.level)).size).toBe(11);
  });
  it('reproduce todas las salidas de los 94 retos programáticos',()=>{
    let programmatic=0,cases=0;
    for(const item of playableChallenges){
      if(!item.exercise.tests.length)continue;
      programmatic++;
      const f=item.solution.functions[item.solution.mainFunctionId];
      for(const test of item.exercise.tests){
        cases++;
        const result=programResult(f,test.inputs,item.solution);
        expect(result.status,`Reto ${item.number}: estado`).toBe('FINISHED');
        expect(result.outputLog.join(''),`Reto ${item.number}: salida`).toBe(test.expectedOutput);
      }
      const result=gradeExercise(item.exercise,f,inputs=>programResult(f,inputs,item.solution));
      expect(result.passed,`Reto ${item.number}: ${result.feedback.join(' | ')}`).toBe(true);
    }
    expect(programmatic).toBe(94);
    expect(cases).toBe(224);
  });
  it('no aprueba una respuesta literal donde debe usar el valor de una variable',()=>{
    const item=playableChallenges.find(item=>item.number===12)!;
    const f=item.solution.functions[item.solution.mainFunctionId];
    const out=Object.values(f.nodes).find(n=>n.type==='Output')!;
    const altered={...f,nodes:{...f.nodes,[out.id]:{...out,type:'Output' as const,expression:'18',newLine:true}}};
    const assessment=gradeExercise(item.exercise,altered,inputs=>programResult(altered,inputs,item.solution));
    expect(assessment.passed).toBe(false);
    expect(assessment.feedback.join(' ')).toContain('variable edad');
  });
  it('detecta un bloque de tipo correcto si está desconectado del recorrido',()=>{
    const exercise=exercises.find(e=>e.id==='documentation')!;
    const f=exercise.project.functions[exercise.project.mainFunctionId];
    const disconnected={...f,nodes:{...f.nodes,comentarioSuelto:{id:'comentarioSuelto' as typeof f.rootNodeId,type:'Comment' as const,text:'Nota desconectada'}}};
    const result=gradeExercise(exercise,disconnected,inputs=>runToCompletion(disconnected,inputs));
    expect(result.passed).toBe(false);
    expect(result.feedback.join(' ')).toContain('Comentario');
  });
  it('usa & para concatenar y + para sumar en los modelos educativos',()=>{
    expect(evaluate('"Hola " & "Ada"',{})).toBe('Hola Ada');
    expect(evaluate('7 + 8',{})).toBe(15);
    const greet=playableChallenges.find(p=>p.number===21)!;
    const output=Object.values(greet.solution.functions[greet.solution.mainFunctionId].nodes).find(node=>node.type==='Output');
    expect(output?.type==='Output' && output.expression).toContain('&');
  });
  it('explicita el objetivo de declarar una variable sin imponer un cero arbitrario',()=>{
    expect(catalog[10].check).toContain('sin exigir un valor fijo');
  });
});
