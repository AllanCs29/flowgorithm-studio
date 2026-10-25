import { describe, expect, it } from 'vitest';
import { catalog, challengeFor, playableChallenges } from '../src/learning/challengeBank';
import { gradeExercise } from '../src/learning/learning';
import { checkInteraction } from '../src/learning/interactionChallenges';
import { validateProject } from '../src/domain/structural';
import { runToCompletion, initialContext, stepExecution } from '../src/interpreter/engine';
import { evaluate, parseExpression } from '../src/parser/expression';
import { generateCode } from '../src/generators';
import { toCoreIR } from '../src/generators/coreIR';

describe('Curso v6 · cobertura y evaluación', () => {
  it('mantiene los cien ejercicios originales del catálogo y el estado real de disponibilidad', () => {
    expect(catalog).toHaveLength(100);
    expect(catalog.map(item=>item.number)).toEqual(Array.from({length:100},(_,i)=>i+1));
    expect(playableChallenges).toHaveLength(100);
    expect(catalog.some(item=>item.world===9)).toBe(true);
    expect(challengeFor(94)).toBeDefined(); // factorial recursivo
  });
  it('valida las soluciones de TODOS los desafíos practicables con casos distintos', () => {
    for (const challenge of playableChallenges) {
      const main=challenge.solution.functions[challenge.solution.mainFunctionId];
      expect(validateProject(challenge.solution).valid,`Estructura #${challenge.number}`).toBe(true);
      if (challenge.exercise.interaction) continue;
      const result=gradeExercise(challenge.exercise,main,inputs=>runToCompletion(main,inputs,7000,challenge.solution));
      expect(result.feedback,`Pruebas #${challenge.number}`).toEqual([]);
      expect(result.passed).toBe(true);
    }
  });
  it('no permite superar un desafío sin reparar el diagrama de inicio', () => {
    for (const challenge of playableChallenges) {
      const main=challenge.exercise.project.functions[challenge.exercise.project.mainFunctionId];
      expect(validateProject(challenge.exercise.project).valid,`Plantilla #${challenge.number}`).toBe(true);
      if (challenge.exercise.interaction) continue;
      expect(gradeExercise(challenge.exercise,main,inputs=>runToCompletion(main,inputs,7000,challenge.exercise.project)).passed,`Plantilla #${challenge.number}`).toBe(false);
    }
  });
  it('genera pseudocódigo ejecutable en los idiomas principales sin perder los índices', () => {
    const arrayChallenge=challengeFor(72);
    expect(arrayChallenge).toBeDefined();
    if (!arrayChallenge) return;
    const ir=toCoreIR(arrayChallenge.solution);
    for (const language of ['python','javascript','cpp','java'] as const) {
      const result=generateCode(ir,language);
      expect(result).toContain('v[2]');
    }
  });
});

describe('Motor v6 · índices y arreglos', () => {
  it('lee arreglos, texto y expresiones de índice', () => {
    expect(evaluate('v[i + 1] * 2',{v:[3,5,8],i:1})).toBe(16);
    expect(evaluate('texto[len(texto)-1]',{texto:'sol'})).toBe('l');
    expect(evaluate('len(v)',{v:[2,4,6,8]})).toBe(4);
    expect(parseExpression('m[fila*3+col]').kind).toBe('index');
  });
  it('rechaza límites, tipos de índices y variables inválidas con mensajes útiles', () => {
    expect(()=>evaluate('v[3]',{v:[4,9]})).toThrow(/fuera/);
    expect(()=>evaluate('v[-1]',{v:[4,9]})).toThrow(/fuera/);
    expect(()=>evaluate('v[0.5]',{v:[4,9]})).toThrow(/entero/);
    expect(()=>evaluate('v',{v:[4,9]})).toThrow(/índice/);
    expect(()=>evaluate('a[0]',{a:3})).toThrow(/arreglo/);
  });
  it('permite escribir elementos y leer directamente en v[i]', () => {
    const challenge=challengeFor(73);
    expect(challenge).toBeDefined();
    if (!challenge) return;
    const func=challenge.solution.functions[challenge.solution.mainFunctionId];
    const context=runToCompletion(func,['5','10','15','20','25'],100);
    expect(context.status).toBe('FINISHED');
    expect(context.variables.v).toEqual([5,10,15,20,25]);
    expect(context.outputLog.join('')).toBe('25\n');
  });
  it('copia los arreglos por paso y evita mutar un contexto anterior', () => {
    const challenge=challengeFor(72);
    if (!challenge)throw new Error('Falta ejercicio 72');
    const func=challenge.solution.functions[challenge.solution.mainFunctionId];
    let previous=initialContext(func);
    previous=stepExecution(func,previous).context;
    previous=stepExecution(func,previous).context;
    const snapshot=previous.variables.v;
    const after=stepExecution(func,previous).context;
    expect(previous.variables.v).toEqual(snapshot);
    expect(previous.variables.v).toEqual([0,0,0,0,0]);
    expect(after.variables.v).toEqual([0,0,7,0,0]);
  });
});


describe('Cobertura completa · acciones y funciones',()=>{
  it('evalúa seis actividades del editor mediante acciones, no salidas simuladas',()=>{
    const cases = [
      {number:1,history:[{action:'select' as const,type:'Start' as const},{action:'select' as const,type:'End' as const}]},
      {number:2,history:[{action:'select' as const,type:'Output' as const},{action:'edit' as const,type:'Output' as const}]},
      {number:5,history:[{action:'cancel' as const,type:'Output' as const}]},
      {number:6,history:[{action:'insert' as const,type:'Output' as const}]},
      {number:8,history:[{action:'delete' as const,type:'Output' as const}]},
      {number:9,history:[{action:'step' as const},{action:'reset' as const}]}
    ];
    for(const {number,history} of cases){
      const challenge=challengeFor(number);if(!challenge?.exercise.interaction)throw new Error(`Sin validador #${number}`);
      const func=challenge.exercise.project.functions[challenge.exercise.project.mainFunctionId];
      expect(checkInteraction(challenge.exercise.interaction,func,[]).passed,`Sin acciones #${number}`).toBe(false);
      if([6,8].includes(number)) continue; // requieren también modificar la estructura
      expect(checkInteraction(challenge.exercise.interaction,func,history).passed,`Acciones #${number}`).toBe(true);
    }
  });
  it('ejecuta las funciones de factorial y mcd con llamadas reales',()=>{
    for(const number of [89,90,91,92,93,94,95]){
      const item=challengeFor(number)!;
      const fn=item.solution.functions[item.solution.mainFunctionId];
      for(const example of item.exercise.tests){
        const result=runToCompletion(fn,example.inputs,7000,item.solution);
        expect(result.status,`Función #${number}: ${result.error}`).toBe('FINISHED');
        expect(result.outputLog.join('')).toBe(example.expectedOutput);
      }
    }
  });
  it('convierte texto a minúsculas y mayúsculas con funciones intrínsecas',()=>{
    expect(evaluate('lower("ÁRBOL")',{})).toBe('árbol');
    expect(evaluate('upper("ana")',{})).toBe('ANA');
  });
  it('los 100 ejercicios mantienen gráficos estructurales válidos',()=>{
    for(const challenge of playableChallenges){
      expect(validateProject(challenge.exercise.project).valid,`Reto ${challenge.number}`).toBe(true);
      expect(validateProject(challenge.solution).valid,`Solución ${challenge.number}`).toBe(true);
    }
  });
});
