import React from 'react';
import { OfflineGuide } from './OfflineGuide';
import { Exercise, Lesson, lessons, exercises } from '../learning/learning';
import { lessonCompleted, lessonUnlocked, levelLessons, levelStatus, nextExercise, percentage } from '../learning/courseFlow';

interface CourseHomeProps {
  completed: ReadonlySet<string>;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenEditor: () => void;
  onOpenLibrary: () => void;
  onOpenPractice:()=>void;onOpenProfiles:()=>void;onOpenProjects:()=>void;profileName:string;
}

const icons: Record<number,string> = {1:'✦',2:'▣',3:'⌨',4:'◇',5:'↻',6:'⟳',7:'Σ',8:'＋',9:'×',10:'★',11:'ƒ'};
const levelNames: Record<number,string> = {1:'Primeros pasos',2:'Variables y cálculos',3:'Datos del usuario',4:'Decisiones inteligentes',5:'Repeticiones',6:'Ciclos que siempre inician',7:'Contar y documentar',8:'Sumas inteligentes',9:'Desafío factorial',10:'Proyecto integrador',11:'Funciones: pequeñas soluciones reutilizables'};

export function CourseHome({completed,onSelectLesson,onOpenEditor,onOpenLibrary,onOpenPractice,onOpenProfiles,onOpenProjects,profileName}:CourseHomeProps):React.ReactElement {
  const next: Exercise = nextExercise(completed);
  const nextLesson = lessons.find(lesson=>lesson.id===next.lessonId) ?? lessons[0];
  const finished = exercises.filter(exercise=>completed.has(exercise.id)).length;
  return <div className="v5-home">
    <header className="v5-home-header"><div className="v5-logo"><span>◇</span><strong>Flowgorithm<span> Studio</span></strong></div><span className="v5-home-header-note">Academia visual · v14.4</span><button className="v5-text-btn" onClick={onOpenLibrary}>100 desafíos <span aria-hidden="true">↗</span></button><button className="v5-text-btn" onClick={onOpenPractice}>✦ Entrenar lógica</button><button className="v5-text-btn" onClick={onOpenProjects}>★ Proyectos</button><button className="v5-text-btn" onClick={onOpenProfiles}>◉ {profileName}</button><button className="v5-text-btn" onClick={onOpenEditor}>Editor libre <span aria-hidden="true">↗</span></button></header>
    <main className="v5-home-main">
      <section className="v5-hero" aria-labelledby="v5-hero-title">
        <div className="v5-hero-content"><div className="v5-kicker"><span className="v5-sparkle">✦</span> APRENDE A PROGRAMAR DESDE CERO</div><h1 id="v5-hero-title">La lógica se aprende <em>haciendo.</em></h1><p>Una habilidad a la vez. Primero te mostramos cómo funciona, después la pruebas en tu propio diagrama. Sin memorizar botones.</p>
        <button className="v5-cta" onClick={()=>onSelectLesson(nextLesson)}>{finished===0?'Empezar mi primera clase':'Continuar aprendiendo'} <span>→</span></button>
        <button className="v6-hero-library" onClick={()=>onSelectLesson(lessons[0])}>↶ Repasar desde la primera clase (sin borrar mi progreso)</button>
        <button className="v6-hero-library" onClick={onOpenLibrary}>Explorar los 100 ejercicios graduados ↗</button><button className="v6-hero-library" onClick={onOpenPractice}>🎯 Entrenar con microretos de predicción y errores</button><div className="v5-hero-meta"><span>✦ {lessons.length} clases prácticas</span><span>◈ {levelLessons().length} niveles</span><span>✓ Avanzas resolviendo retos</span></div></div>
        <div className="v5-hero-art" aria-hidden="true"><div className="v5-art-pill">INICIO</div><div className="v5-art-link"/><div className="v5-art-output">▱&nbsp; Mostrar "¡Lo logré!"</div><div className="v5-art-link"/><div className="v5-art-pill end">FIN</div><div className="v5-art-orb a"/><div className="v5-art-orb b"/></div>
      </section>
      <OfflineGuide/>
      <section className="v13-functions-teaser" aria-label="Aprende funciones"><div><small>NUEVA SECCIÓN · NIVEL 11</small><h2>Funciones: crea una solución y úsala muchas veces</h2><p>Entiende parámetros, llamadas y Retornar. Sigue las flechas entre Main y la función, cambia los valores y practica en el editor.</p></div><button type="button" onClick={()=>onSelectLesson(lessons.find(item=>item.id==='functions')!)}>Explorar funciones →</button></section>
      <section className="v5-overview" aria-label="Tu avance"><div><span className="v5-overview-label">TU PROGRESO</span><strong>{percentage(completed)}%</strong><small>del curso terminado</small></div><div className="v5-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage(completed)}><span style={{width:`${percentage(completed)}%`}}/></div><div className="v5-overview-count"><strong>{finished}<span>/{exercises.length}</span></strong><small>retos superados</small></div></section>
      <section className="v10-home-cards"><button onClick={onOpenPractice}><span>01 · PRACTICAR</span><strong>24 retos rápidos</strong><small>Predice, detecta errores y ordena la lógica. Con repaso inteligente.</small><b>Entrenar →</b></button><button onClick={onOpenProjects}><span>02 · CREAR</span><strong>Proyectos completos</strong><small>Resuelve desafíos de varias etapas con diagramas.</small><b>Explorar →</b></button><button onClick={onOpenProfiles}><span>03 · CRECER</span><strong>Tu progreso y aula</strong><small>Perfiles, tareas y copia de seguridad local.</small><b>Ver mi progreso →</b></button></section>
      <div className="v5-path-heading"><div><span className="v5-overline">RUTA DE APRENDIZAJE</span><h2>Tu aventura comienza aquí</h2><p>Completa cada misión para abrir la siguiente. Puedes repetir una clase cuando quieras.</p></div><span className="v5-path-count">{levelLessons().length} niveles · {exercises.length} retos</span></div>
      <div className="v5-level-list">{levelLessons().map(({level,lessons:items})=>{const status=levelStatus(level,completed);return <section className={`v5-level v5-level-${status}`} key={level} aria-label={`Nivel ${level}: ${levelNames[level]}`}><div className="v5-level-header"><div className="v5-level-icon" aria-hidden="true">{icons[level]}</div><div className="v5-level-info"><span>NIVEL {String(level).padStart(2,'0')}</span><h3>{levelNames[level]}</h3></div><span className="v5-level-state">{status==='completed'?'✓ Completado':status==='active'?'● En progreso':'🔒 Por desbloquear'}</span></div><div className="v5-lesson-row">{items.map((lesson,index)=>{const done=lessonCompleted(lesson.id,completed);const unlocked=lessonUnlocked(lesson.id,completed);return <button key={lesson.id} disabled={!unlocked} className={`v5-lesson-card ${done?'done':''} ${!unlocked?'locked':''}`} onClick={()=>onSelectLesson(lesson)}><span className="v5-lesson-bullet">{done?'✓':unlocked?String(index+1).padStart(2,'0'):'◦'}</span><span className="v5-lesson-copy"><strong>{lesson.title}</strong><small>{lesson.summary}</small><span>{lesson.minutes} min · Ejemplo + reto</span></span><span className="v5-lesson-arrow" aria-hidden="true">{unlocked?'→':'🔒'}</span></button>})}</div></section>})}</div>
      <footer className="v5-home-footer">Un espacio para practicar, equivocarte y volver a intentar. <button onClick={onOpenLibrary}>Explorar 100 desafíos por nivel ↗</button> <button onClick={onOpenEditor}>También puedes crear un diagrama libre →</button></footer>
    </main>
  </div>;
}
