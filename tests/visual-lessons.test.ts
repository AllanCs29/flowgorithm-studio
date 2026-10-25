import {describe,expect,it} from 'vitest';
import { lessons } from '../src/learning/learning';
import { conceptChecks } from '../src/learning/courseFlow';
import {assertScenario,scenarioFor,visualLessons,memoryValueState} from '../src/learning/visualLessons';

describe('diagramas que enseñan con pasos',()=>{
  it('distingue el 0 inicial del resultado 15 y explica el cambio de estado',()=>{
    const scenario=scenarioFor('assign')!;
    expect(scenario.moments[0].memory?.total).toBe('0');
    expect(scenario.moments[0].description).toContain('NO es el resultado');
    expect(scenario.moments[1].memory?.total).toBe('15');
    expect(memoryValueState('declare','0')).toBe('Valor inicial al declarar');
    expect(memoryValueState('assign','15','0')).toBe('Antes: 0 → ahora: 15');
    expect(memoryValueState('assign','0','0')).toBe('No cambió en este paso');
    expect(memoryValueState('input','3','0')).toBe('Dato recibido en Entrada');
  });
  it('cada una de las clases tiene un recorrido válido y explicaciones',()=>{
    for(const lesson of lessons){
      const scenario=scenarioFor(lesson.id);
      expect(scenario).toBeDefined();
      expect(assertScenario(scenario!)).toBe(true);
      expect(scenario!.moments.length).toBeGreaterThanOrEqual(3);
      for(const [index, moment] of scenario!.moments.entries()) {
        expect(moment.description.length, `Clase ${lesson.id}, paso ${index + 1} (${moment.block}): explicación demasiado breve`).toBeGreaterThan(20);
      }
    }
    expect(Object.keys(visualLessons).length).toBe(lessons.length);
  });
  it('las preguntas no sustituyen el contenido del curso ni cambian las respuestas',()=>{
    for(const lesson of lessons){
      expect(conceptChecks[lesson.id]).toBeDefined();
      expect(scenarioFor(lesson.id,true)).toBeDefined();
    }
  });
  it('el problema de total utiliza 3 y +2 tanto en la pregunta como en el diagrama',()=>{
    const quiz=conceptChecks.assign;
    const scenario=scenarioFor('assign',true)!;
    expect(quiz.question).toContain('3');
    expect(quiz.question).toContain('total + 2');
    expect(scenario.blocks.some(block=>block.label==='total = 3')).toBe(true);
    expect(scenario.blocks.some(block=>block.label==='total = total + 2')).toBe(true);
    expect(scenario.blocks.every(block=>!block.label.includes('7 + 8'))).toBe(true);
    expect(scenario.moments[1].memory?.total).toBe('3');
    expect(scenario.moments[2].memory?.total).toBe('5');
  });
  it('muestra una ruta Sí / No y repeticiones sin perder el estado de memoria',()=>{
    const branch=scenarioFor('if')!;
    expect(branch.mode).toBe('branch');
    expect(branch.blocks.some(block=>block.lane==='yes')).toBe(true);
    expect(branch.blocks.some(block=>block.lane==='no')).toBe(true);
    const loop=scenarioFor('while')!;
    expect(loop.mode).toBe('loop');
    expect(loop.moments.filter(moment=>moment.block==='cond').length).toBeGreaterThan(2);
    expect(loop.moments[loop.moments.length-1]?.memory?.i).toBe('3');
  });
});
