import { describe, expect, it } from 'vitest';
import { allowedExercise, exercises, gradeExercise, lessons } from '../src/learning/learning';
import { validateProject } from '../src/domain/structural';
import { runToCompletion } from '../src/interpreter/engine';
import { insertNode } from '../src/domain/structural';
import { FlowNode, nodeId } from '../src/domain/models';

describe('Guided classroom curriculum', () => {
  it('teaches every supported basic shape before the later integrated challenges', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(14);
    expect(lessons.every(lesson => lesson.steps.length >= 3 && lesson.diagram.length > 0)).toBe(true);
    for (const type of ['Start','Output','Declare','Assign','Input','If','While','Do','For','Comment']) {
      expect(lessons.some(lesson => lesson.block === type)).toBe(true);
    }
  });
  it('builds a progressive path with valid fixtures and more than one test for input challenges', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(14);
    expect(new Set(exercises.map(exercise => exercise.level))).toEqual(new Set([1,2,3,4,5,6,7,8,9,10,11]));
    for (const exercise of exercises) {
      expect(exercise.goal.length).toBeGreaterThan(12);
      expect(exercise.hint.length).toBeGreaterThan(12);
      expect(exercise.instructions.length).toBeGreaterThan(1);
      expect(exercise.tests.length).toBeGreaterThan(0);
      expect(validateProject(exercise.project).valid).toBe(true);
      if (exercise.requiredTypes.includes('Input')) expect(exercise.tests.length).toBeGreaterThanOrEqual(2);
    }
  });
  it('only unlocks the next challenge after the previous has been passed', () => {
    expect(allowedExercise(exercises[0].id,new Set())).toBe(true);
    expect(allowedExercise(exercises[1].id,new Set())).toBe(false);
    expect(allowedExercise(exercises[1].id,new Set([exercises[0].id]))).toBe(true);
    expect(allowedExercise(exercises[2].id,new Set([exercises[0].id]))).toBe(false);
  });
  it('each starter fixture ends or fails safely, instead of hanging forever', () => {
    for (const exercise of exercises) for (const test of exercise.tests) {
      const func=exercise.project.functions[exercise.project.mainFunctionId];
      const context=runToCompletion(func,test.inputs,2000);
      expect(['FINISHED','ERROR']).toContain(context.status);
      expect(context.stepCount).toBeLessThan(2000);
    }
  });
  it('rejects an output-only cheat when a missing required shape should be added', () => {
    const exercise=exercises.find(e=>e.id==='variable')!;
    const func=exercise.project.functions.main;
    const grade=gradeExercise(exercise,func,inputs=>runToCompletion(func,inputs));
    expect(grade.passed).toBe(false);
    expect(grade.feedback.some(text=>text.includes('Declare'))).toBe(true);
  });
  it('inserts new shapes in a Si branch without converting it into a loop', () => {
    const exercise=exercises.find(e=>e.id==='age')!;
    const func=exercise.project.functions.main;
    const withTrue=insertNode(func,{id:nodeId('out-true'),type:'Output',expression:'"Mayor"',newLine:true} as FlowNode,nodeId('if'),'InsideTrue');
    const withBoth=insertNode(withTrue,{id:nodeId('out-false'),type:'Output',expression:'"Menor"',newLine:true} as FlowNode,nodeId('if'),'InsideFalse');
    expect(validateProject({...exercise.project,functions:{main:withBoth}}).valid).toBe(true);
    const grade=gradeExercise(exercise,withBoth,inputs=>runToCompletion(withBoth,inputs));
    expect(grade.passed).toBe(true);
  });
});
