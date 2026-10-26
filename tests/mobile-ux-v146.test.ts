import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nodeId } from '../src/domain/models';
import { InteractionController, InteractionIntent, PointerInput } from '../src/interaction/controller';
import { missionGoal } from '../src/ui/missionGoal';
import { exerciseForLesson } from '../src/learning/courseFlow';
import { lessons } from '../src/learning/learning';

const touch = (x:number,y:number):PointerInput => ({pointerId:3,pointerType:'touch',button:0,x,y,clientX:x,clientY:y,shiftKey:false,ctrlKey:false,metaKey:false});
const mouse = (x:number,y:number):PointerInput => ({...touch(x,y),pointerType:'mouse'});
const shape = nodeId('asignar');

describe('v14.6 — gestos sin movimientos accidentales',()=>{
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();});
  it('un toque corto selecciona para editar, sin arrastre',()=>{
    const log:InteractionIntent[]=[];const controller=new InteractionController(intent=>log.push(intent));
    controller.pointerDownNode(shape,touch(50,50));
    vi.advanceTimersByTime(120);
    controller.pointerUp(shape,touch(50,50));
    expect(log.map(intent=>intent.type)).toEqual(['SELECT']);
    vi.advanceTimersByTime(700);
    expect(log).toHaveLength(1);
  });
  it('mantener pulsado y mover emite solo gestos de arrastre',()=>{
    const log:InteractionIntent[]=[];const controller=new InteractionController(intent=>log.push(intent));
    controller.pointerDownNode(shape,touch(50,50));
    vi.advanceTimersByTime(440);
    controller.pointerMove(shape,touch(95,110));
    controller.pointerUp(shape,touch(95,110));
    expect(log.map(intent=>intent.type)).toEqual(['START_DRAG','UPDATE_DRAG','END_DRAG']);
  });
  it('deslizar pronto desplaza el lienzo y cancela el temporizador de arrastre',()=>{
    const log:InteractionIntent[]=[];const controller=new InteractionController(intent=>log.push(intent));
    controller.pointerDownNode(shape,touch(100,100));
    vi.advanceTimersByTime(90);
    controller.pointerMove(shape,touch(100,65));
    vi.advanceTimersByTime(500);
    controller.pointerUp(shape,touch(100,65));
    expect(log.map(intent=>intent.type)).toEqual(['PAN_CANVAS']);
    expect(log[0]).toMatchObject({dx:0,dy:-35});
  });
  it('cancelar el gesto limpia el temporizador',()=>{
    const log:InteractionIntent[]=[];const controller=new InteractionController(intent=>log.push(intent));
    controller.pointerDownNode(shape,touch(30,30));
    controller.pointerCancel(3);
    vi.advanceTimersByTime(900);
    expect(log).toEqual([]);
  });
  it('el mouse conserva el arrastre inmediato del escritorio',()=>{
    const log:InteractionIntent[]=[];const controller=new InteractionController(intent=>log.push(intent));
    controller.pointerDownNode(shape,mouse(20,20));
    controller.pointerMove(shape,mouse(70,80));
    controller.pointerUp(shape,mouse(70,80));
    expect(log.map(intent=>intent.type)).toEqual(['START_DRAG','UPDATE_DRAG','END_DRAG']);
  });
});

describe('v14.6 — metas sin solución automática',()=>{
  it('las clases conservan una meta diferenciada de las pistas',()=>{
    for(const lesson of lessons){
      const exercise=exerciseForLesson(lesson.id);
      expect(exercise).toBeDefined();
      if (!exercise) continue;
      expect(missionGoal(exercise).trim().length).toBeGreaterThan(15);
      expect(exercise.instructions.length).toBeGreaterThan(0);
    }
  });
});
