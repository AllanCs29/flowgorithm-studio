import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { playableChallenges } from '../src/learning/challengeBank';
import { exercises } from '../src/learning/learning';
import { MissionObjective } from '../src/ui/MissionObjective';
import { missionGoal, shouldGuide } from '../src/ui/missionGoal';

describe('v14.5 · la meta se ve antes de recibir ayuda', () => {
  const everyExercise = [...exercises, ...playableChallenges.map(item => item.exercise)];

  it('muestra una meta legible en todas las clases y los 100 retos', () => {
    expect(exercises.length).toBe(16);
    expect(playableChallenges.length).toBe(100);
    for (const exercise of everyExercise) {
      const goal = missionGoal(exercise);
      expect(goal.length, `Sin meta: ${exercise.id}`).toBeGreaterThan(15);
      expect(goal, `Meta vacía: ${exercise.id}`).not.toMatch(/^\s*$/);
    }
  });

  it('no mezcla la meta principal con la descripción de la evaluación del banco', () => {
    const exercise = playableChallenges.find(item => item.exercise.goal.includes('Comprobaremos:'))!.exercise;
    expect(exercise.goal).toContain('Comprobaremos:');
    expect(missionGoal(exercise)).not.toContain('Comprobaremos:');
  });

  it('enseña el objetivo sin revelar automáticamente los pasos', () => {
    const exercise = exercises.find(item => item.id === 'sum')!;
    const html = renderToStaticMarkup(React.createElement(MissionObjective, {
      exercise, onHelp: () => undefined
    }));
    // v14.6 presenta el título como «Tu meta» en una tarjeta plegable.
    // Comprobamos el contenido y el estado compacto, no las mayúsculas del diseño anterior.
    expect(html).toContain('aria-label="Tu meta del reto"');
    expect(html).toContain('<strong>Tu meta</strong>');
    expect(html).toContain('class="v146-goal-preview"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).toContain('7 + 8');
    expect(html).toContain('Qué revisaré');
    expect(html).toContain('¿Necesitas ayuda?');
    expect(html).not.toContain(exercise.instructions[0]);
    expect(html).not.toContain(exercise.hint);
    expect(html).not.toContain('Abrir guía paso a paso');
  });

  it('no ilumina el siguiente bloque en móvil hasta solicitarlo, pero respeta escritorio', () => {
    expect(shouldGuide(true, false)).toBe(false);
    expect(shouldGuide(true, true)).toBe(true);
    expect(shouldGuide(false, false)).toBe(true);
  });
});
