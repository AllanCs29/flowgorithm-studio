import { describe, expect, it } from 'vitest';
import { challengeFor } from '../src/learning/challengeBank';
import { checkInteraction } from '../src/learning/interactionChallenges';
import { createDefaultNode, nodeId } from '../src/domain/models';
import { deleteNode, insertNode } from '../src/domain/structural';

describe('Primeras seis prácticas: interacción comprobable',()=>{
  it('nunca aprueba una actividad sin eventos',()=>{
    for(const number of [1,2,5,6,8,9]){
      const challenge=challengeFor(number)!;
      expect(challenge.exercise.interaction).toBeDefined();
      const func=challenge.exercise.project.functions[challenge.exercise.project.mainFunctionId];
      expect(checkInteraction(challenge.exercise.interaction!,func,[]).passed).toBe(false);
    }
  });
  it('valida insertar Salida entre Inicio y Fin',()=>{
    const challenge=challengeFor(6)!;
    const func=challenge.solution.functions[challenge.solution.mainFunctionId];
    const modified=insertNode(func,createDefaultNode('Output',nodeId('agregado')),nodeId('start'),'After');
    expect(checkInteraction('insert-output',func,[{action:'insert',type:'Output'}]).passed).toBe(false);
    expect(checkInteraction('insert-output',modified,[]).passed).toBe(false);
    expect(checkInteraction('insert-output',modified,[{action:'insert',type:'Output'}]).passed).toBe(true);
  });
  it('valida eliminar Salida sin romper los terminales',()=>{
    const challenge=challengeFor(8)!;
    const func=challenge.solution.functions[challenge.solution.mainFunctionId];
    const output=Object.values(func.nodes).find(n=>n.type==='Output')!;
    const modified=deleteNode(func,output.id);
    expect(checkInteraction('delete-output',func,[{action:'delete',type:'Output'}]).passed).toBe(false);
    expect(checkInteraction('delete-output',modified,[{action:'delete',type:'Output'}]).passed).toBe(true);
  });
  it('exige exactamente un paso antes del reinicio',()=>{
    const func=challengeFor(9)!.solution.functions[challengeFor(9)!.solution.mainFunctionId];
    expect(checkInteraction('step-and-reset',func,[{action:'reset'}]).passed).toBe(false);
    expect(checkInteraction('step-and-reset',func,[{action:'step'},{action:'step'},{action:'reset'}]).passed).toBe(false);
    expect(checkInteraction('step-and-reset',func,[{action:'step'},{action:'reset'}]).passed).toBe(true);
  });
});
