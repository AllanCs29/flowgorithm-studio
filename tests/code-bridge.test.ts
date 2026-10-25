import {describe,expect,it} from 'vitest';
import {pedagogicalCode} from '../src/learning/codeBridge';
import {nodeId} from '../src/domain/models';
describe('puente visual',()=>{
 it('explica la diferencia entre variable simple y arreglo',()=>{
  const scalar=pedagogicalCode({id:nodeId('d'),type:'Declare',name:'edad',dataType:'Integer'},'python');
  expect(scalar.code).toBe('edad = 0');
  expect(scalar.meaning).toContain('único');
  const array=pedagogicalCode({id:nodeId('a'),type:'Declare',name:'datos',dataType:'Integer',arraySize:'5'},'python');
  expect(array.code).toContain('[0] * 5');
 });
 it('deja claro que Si bifurca, y Mientras repite',()=>{
  expect(pedagogicalCode({id:nodeId('if'),type:'If',condition:'n > 0'},'javascript').code).toContain('else');
  expect(pedagogicalCode({id:nodeId('while'),type:'While',condition:'n > 0'},'javascript').code).toContain('while');
 });
});
