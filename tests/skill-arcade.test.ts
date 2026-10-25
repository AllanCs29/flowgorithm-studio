import {describe,expect,it} from 'vitest';
import { evaluateMicro, evaluateOrdering, orderingPuzzles, masteryBySkill, microTasks, recordMicro, recommendMicro } from '../src/learning/skillArcade';
describe('práctica inteligente',()=>{
 it('incluye las seis habilidades y los tres tipos de actividades',()=>{
  expect(microTasks.length).toBe(24);
  expect(new Set(microTasks.map(t=>t.skill)).size).toBe(6);
  expect(new Set(microTasks.map(t=>t.kind)).size).toBe(3);
 });
 it('cada ejercicio tiene una solución comprobable',()=>{
  for(const task of microTasks){expect(evaluateMicro(task,task.correct).passed).toBe(true);expect(evaluateMicro(task,(task.correct+1)%task.choices.length).passed).toBe(false);}
 });
 it('ordena piezas con controles táctiles verificando la secuencia',()=>{
  for(const [id,puzzle] of Object.entries(orderingPuzzles)){const t=microTasks.find(t=>t.id===id)!;expect(evaluateOrdering(t,puzzle.answer).passed).toBe(true);expect(evaluateOrdering(t,puzzle.initial).passed).toBe(false);}
 });
 it('programa repaso más rápido tras fallar y más tardío tras acertar',()=>{
  const now=100000;const fail=recordMicro(undefined,false,now);const pass=recordMicro(undefined,true,now);
  expect(fail.nextReviewAt-now).toBe(3600000);
  expect(pass.nextReviewAt-now).toBe(86400000);
  expect(recordMicro(pass,true,now).nextReviewAt-now).toBe(3*86400000);
 });
 it('recomienda repasos vencidos y mide habilidades sin inventar dominio',()=>{
  const records={[microTasks[0].id]:recordMicro(undefined,false,0)};
  expect(recommendMicro(records,2*3600000).id).toBe(microTasks[0].id);
  expect(masteryBySkill({})[0].mastery).toBe(0);
  expect(masteryBySkill(records)[0].answered).toBe(1);
 });
});
