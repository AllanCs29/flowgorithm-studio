import React from 'react';
import { Exercise, Lesson } from '../learning/learning';

export function GuidedLesson({ lesson, exercise, stepIndex, completed, onPrevious, onNext, onOpenClasses, onStartExercise, onHint, hintVisible, onCheck, feedback, onShowPieces }: {
  lesson: Lesson;
  exercise?: Exercise;
  stepIndex: number;
  completed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenClasses: () => void;
  onStartExercise: () => void;
  onHint: () => void;
  hintVisible: boolean;
  onCheck: () => void;
  feedback: readonly string[];
  onShowPieces: () => void;
}): React.ReactElement {
  const isChallenge = Boolean(exercise);
  const steps = exercise?.instructions ?? lesson.steps.map(s => s.action);
  const currentStep = Math.min(stepIndex, steps.length - 1);
  return <div className="lesson-sidebar">
    <header className="lesson-intro"><span className="eyebrow">{isChallenge ? `MISIÓN · NIVEL ${exercise?.level}` : `CLASE · NIVEL ${lesson.level}`}</span><h2>{exercise?.title ?? lesson.title}</h2><p>{exercise?.goal ?? lesson.summary}</p></header>
    <div className="lesson-meter"><span>Paso {currentStep + 1} de {steps.length}</span><span>{Math.round((currentStep + 1) / steps.length * 100)}%</span></div>
    <div className="meter-track"><div style={{ width: `${(currentStep + 1) / steps.length * 100}%` }} /></div>
    <div className="guided-card"><span className="guided-number">{String(currentStep + 1).padStart(2, '0')}</span><h3>{isChallenge ? 'Hazlo en el diagrama' : lesson.steps[currentStep]?.title}</h3>
      {!isChallenge && <p>{lesson.steps[currentStep]?.body}</p>}
      <div className="do-this"><span>AHORA TÚ</span><p>{steps[currentStep]}</p></div>
      <div className="guided-nav"><button onClick={onPrevious} disabled={currentStep === 0}>← Anterior</button><button className="primary" onClick={onNext} disabled={currentStep === steps.length - 1}>Siguiente →</button></div>
    </div>
    <div className="learning-actions"><button onClick={onShowPieces}>⊞ Ver piezas</button><button onClick={onOpenClasses}>◈ Ver todas las clases</button></div>
    {exercise ? <div className="challenge-box"><div className="section-heading"><h3>Tu prueba</h3><span>{exercise.tests.length} casos</span></div>
      <p>Cuando termines, ejecutaremos el algoritmo con distintas entradas para comprobar el resultado.</p>
      <button className="primary wide" onClick={onCheck}>{completed ? '✓ Repetir comprobación' : '✓ Comprobar mi solución'}</button>
      {completed && <div className="win-state" role="status">✓ ¡Reto superado! Ya puedes avanzar.<button onClick={onOpenClasses}>Siguiente clase →</button></div>}
      {feedback.length > 0 && !completed && <div className="learning-errors" role="alert"><strong>Revisa lo siguiente:</strong>{feedback.map((line, index) => <p key={index}>{line}</p>)}</div>}
      <button className="hint-toggle" onClick={onHint}>{hintVisible ? 'Ocultar pista' : '💡 Necesito una pista'}</button>{hintVisible && <p className="challenge-hint">{exercise.hint}</p>}
    </div> : <div className="challenge-box"><h3>Cuando estés listo…</h3><p>Practica la lección con un ejercicio real y recibe retroalimentación.</p><button className="primary wide" onClick={onStartExercise}>Empezar mi reto →</button></div>}
  </div>;
}
