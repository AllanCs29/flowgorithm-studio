import { describe, it, expect } from 'vitest';
import { exercises, lessons } from '../src/learning/learning';
import { conceptChecks, exerciseForLesson, lessonCompleted, lessonUnlocked, levelLessons, levelStatus, nextExercise, percentage } from '../src/learning/courseFlow';

describe('curso progresivo: inicio → tutorial → reto',()=>{
  it('todas las lecciones tienen una prueba de comprensión y un ejercicio real',()=>{
    for(const lesson of lessons){
      expect(Boolean(exerciseForLesson(lesson.id))).toBe(true);
      const quiz=conceptChecks[lesson.id];
      expect(Boolean(quiz)).toBe(true);
      expect(quiz.answers.length).toBe(3);
      expect(quiz.correct>=0&&quiz.correct<3).toBe(true);
    }
  });
  it('bloquea el siguiente desafío hasta completar el anterior',()=>{
    const completed=new Set<string>();
    expect(lessonUnlocked(lessons[0].id,completed)).toBe(true);
    expect(lessonUnlocked(lessons[1].id,completed)).toBe(false);
    completed.add(exercises[0].id);
    expect(lessonUnlocked(lessons[1].id,completed)).toBe(true);
    expect(lessonCompleted(lessons[0].id,completed)).toBe(true);
  });
  it('continúa desde el primer reto aún no superado',()=>{
    const completed=new Set(exercises.slice(0,5).map(exercise=>exercise.id));
    expect(nextExercise(completed).id).toBe(exercises[5].id);
  });
  it('obtiene progreso y estado de los niveles de forma consistente',()=>{
    const none=new Set<string>();
    expect(percentage(none)).toBe(0);
    expect(levelStatus(1,none)).toBe('active');
    expect(levelStatus(2,none)).toBe('locked');
    const all=new Set(exercises.map(exercise=>exercise.id));
    expect(percentage(all)).toBe(100);
    expect(levelStatus(1,all)).toBe('completed');
    expect(levelStatus(10,all)).toBe('completed');
    expect(levelStatus(11,all)).toBe('completed');
    const levels = levelLessons();
    expect(levels).toHaveLength(11);
    expect(levels.map(group => group.level)).toEqual(Array.from({length:11},(_,index)=>index+1));
    expect(levels.find(group => group.level === 11)?.lessons.map(lesson => lesson.id)).toEqual(['functions', 'parameters']);
  });
});
