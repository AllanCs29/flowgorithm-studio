import {describe,it,expect} from 'vitest';
import {exercises,gradeExercise,lessons} from '../src/learning/learning';
import {conceptChecks} from '../src/learning/courseFlow';
import {assertScenario,functionScenario,scenarioFor} from '../src/learning/visualLessons';
import {runToCompletion} from '../src/interpreter/engine';
import {validateProject} from '../src/domain/structural';
import type {FlowProject,FlowNode} from '../src/domain/models';

const functionExercises=exercises.filter(e=>e.level===11);
function correctedProject(project:FlowProject,expression:string):FlowProject {
  const helper=Object.values(project.functions).find(fn=>fn.name!=='Main')!;
  const ret=helper.nodes.helperReturn as Extract<FlowNode,{type:'Return'}>;
  return {...project,functions:{...project.functions,[helper.id]:{...helper,nodes:{...helper.nodes,helperReturn:{...ret,expression}}}}};
}

describe('v13 · funciones explicadas desde cero',()=>{
  it('incluye dos clases, un recorrido, un control de comprensión y un reto por clase',()=>{
    for(const id of ['functions','parameters']) {
      const lesson=lessons.find(item=>item.id===id)!;
      expect(lesson.level).toBe(11);
      expect(lesson.steps.length).toBe(3);
      expect(conceptChecks[id]).toBeDefined();
      const scenario=scenarioFor(id)!;
      expect(scenario.mode).toBe('function');
      expect(assertScenario(scenario)).toBe(true);
      expect(scenario.blocks.filter(block=>block.lane==='callee').length).toBe(2);
      expect(scenario.moments.some(moment=>moment.route?.includes('Main'))).toBe(true);
      expect(exercises.some(exercise=>exercise.lessonId===id)).toBe(true);
    }
  });
  it('el laboratorio muestra resultados coherentes con los argumentos, incluso cero y negativos',()=>{
    for(const value of [-5,0,3,12]) {
      const doubleMoments=functionScenario('functions',value).moments;
      expect(doubleMoments[doubleMoments.length-1].output).toBe(String(2*value));
      const sumMoments=functionScenario('parameters',value,7).moments;
      expect(sumMoments[sumMoments.length-1].output).toBe(String(value+7));
    }
  });
  it('ambos retos empiezan con un error y se corrigen desde Retornar para TODAS las entradas',()=>{
    expect(functionExercises).toHaveLength(2);
    for(const exercise of functionExercises) {
      expect(validateProject(exercise.project).valid).toBe(true);
      const original=exercise.project.functions[exercise.project.mainFunctionId];
      const before=gradeExercise(exercise,original,inputs=>runToCompletion(original,inputs,7000,exercise.project));
      expect(before.passed).toBe(false);
      const corrected=correctedProject(exercise.project,exercise.id==='function-double'?'x * 2':'a + b');
      const after=gradeExercise(exercise,original,inputs=>runToCompletion(original,inputs,7000,corrected));
      expect(after.feedback).toEqual([]);
      expect(after.passed).toBe(true);
      for(const test of exercise.tests) {
        const result=runToCompletion(original,test.inputs,7000,corrected);
        expect(result.status).toBe('FINISHED');
        expect(result.outputLog.join('')).toBe(test.expectedOutput);
      }
    }
  });
  it('las funciones con retorno se llaman mediante Asignar, como en Flowgorithm original',()=>{
    for(const exercise of functionExercises) {
      const main=exercise.project.functions[exercise.project.mainFunctionId];
      expect(Object.values(main.nodes).some(node=>node.type==='Assign'&&node.expression.includes('('))).toBe(true);
      expect(Object.values(main.nodes).some(node=>node.type==='Call')).toBe(false);
    }
  });
});
