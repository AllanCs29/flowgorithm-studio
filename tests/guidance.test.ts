import {describe,it,expect} from 'vitest';
import {exercises} from '../src/learning/learning';
import {guidedTarget} from '../src/learning/lessonGuidance';

describe('resaltado contextual para principiantes',()=>{
  it('señala la primera salida de la primera misión',()=>{
    const func=exercises[0].project.functions.main;
    expect(guidedTarget(func,'Haz clic en Salida.')).toBe(func.nodes.out.id);
  });
  it('señala el inicio cuando se va a insertar un bloque nuevo',()=>{
    const func=exercises[2].project.functions.main;
    expect(guidedTarget(func,'Selecciona Inicio.')).toBe(func.rootNodeId);
  });
  it('señala la condición Si para las ramas',()=>{
    const func=exercises[5].project.functions.main;
    expect(guidedTarget(func,'Selecciona el bloque Si.')).toBe(func.nodes.if.id);
  });
  it('conserva la selección cuando la instrucción es genérica',()=>{
    const func=exercises[0].project.functions.main;
    expect(guidedTarget(func,'Escribe el valor correcto.',func.nodes.out.id)).toBe(func.nodes.out.id);
  });
});
