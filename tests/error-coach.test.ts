import {describe,expect,it} from 'vitest';
import {coachAdvice} from '../src/learning/errorCoach';
import {FlowFunction, functionId, nodeId} from '../src/domain/models';
const f:FlowFunction={id:functionId('main'),name:'Main',parameters:[],rootNodeId:nodeId('start'),nodes:{start:{id:nodeId('start'),type:'Start',next:nodeId('end')},end:{id:nodeId('end'),type:'End'}}};
describe('entrenador contextual',()=>{
 it('distingue variable escalar de arreglo',()=>{
  expect(coachAdvice('El arreglo “edad” necesita un índice',f).firstStep).toContain('Tamaño del arreglo');
 });
 it('da pistas para bucles y variables',()=>{
  expect(coachAdvice('La ejecución superó 5 000 pasos',f).lesson).toBe('Ciclos');
  expect(coachAdvice('Variable desconocida',f).lesson).toBe('Variables');
 });
});
