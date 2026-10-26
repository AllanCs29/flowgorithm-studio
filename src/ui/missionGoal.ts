import type { Exercise } from '../learning/learning';

/** La meta describe el resultado a lograr sin mezclar los criterios de evaluación. */
export function missionGoal(exercise: Pick<Exercise, 'goal'>): string {
  const beforeCriteria = exercise.goal.split(/\s+Comprobaremos\s*:/i)[0].trim();
  return beforeCriteria || exercise.goal.trim();
}

/** En móvil, el recorrido guiado comienza desactivado. */
export function shouldGuide(mobile:boolean, enabled:boolean):boolean {
  return !mobile || enabled;
}
