import React, { useEffect, useState } from 'react';
import type { Exercise } from '../learning/learning';
import { exerciseCriteria } from '../learning/learning';
import { missionGoal } from './missionGoal';

const PREFERENCE_KEY = 'flowstudio:v146:show-goal';
function readExpanded(): boolean {
  try { return localStorage.getItem(PREFERENCE_KEY) === 'true'; } catch { return false; }
}

/** En móvil una línea basta para recordar la meta. Las pistas nunca se abren solas. */
export function MissionObjective({exercise,onHelp}:{exercise:Exercise;onHelp:()=>void}):React.ReactElement {
  const [expanded,setExpanded] = useState(readExpanded);
  const [criteriaOpen,setCriteriaOpen] = useState(false);
  const [helpOpen,setHelpOpen] = useState(false);
  useEffect(() => { setCriteriaOpen(false); setHelpOpen(false); },[exercise.id]);
  const changeExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    try { localStorage.setItem(PREFERENCE_KEY,String(next)); } catch { /* Sin almacenamiento también funciona. */ }
    if (!next) { setCriteriaOpen(false); setHelpOpen(false); }
  };
  const goalId = `meta-${exercise.id.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
  return <section className={`v146-mobile-objective ${expanded?'is-expanded':'is-compact'}`} aria-label="Tu meta del reto">
    <button type="button" className="v146-goal-toggle" aria-expanded={expanded} aria-controls={goalId} onClick={changeExpanded}>
      <span className="v146-goal-icon" aria-hidden="true">◎</span>
      <span className="v146-goal-title"><strong>Tu meta</strong><small>{expanded?'Objetivo del ejercicio':'Toca para ver todo el objetivo'}</small></span>
      <span className="v146-goal-chevron" aria-hidden="true">{expanded?'⌃':'⌄'}</span>
    </button>
    {!expanded && <p className="v146-goal-preview" title={missionGoal(exercise)}>{missionGoal(exercise)}</p>}
    <div id={goalId} className="v146-goal-expanded" hidden={!expanded}>
      <p className="v146-goal-full">{missionGoal(exercise)}</p>
      <p className="v146-goal-encouragement">Inténtalo primero a tu manera.</p>
      <div className="v146-goal-tools">
        <button type="button" aria-expanded={criteriaOpen} onClick={()=>setCriteriaOpen(value=>!value)}>Qué revisaré <span aria-hidden="true">{criteriaOpen?'−':'+'}</span></button>
        <button type="button" aria-expanded={helpOpen} onClick={()=>setHelpOpen(value=>!value)}>¿Necesitas ayuda? <span aria-hidden="true">{helpOpen?'−':'+'}</span></button>
      </div>
      {criteriaOpen && <div className="v146-reveal" aria-label="Criterios de evaluación"><strong>Para aprobar, revisaremos:</strong><ul>{exerciseCriteria(exercise).map((criterion,index)=><li key={`${index}-${criterion}`}>{criterion}</li>)}</ul></div>}
      {helpOpen && <div className="v146-reveal" aria-label="Ayuda opcional"><p>Primero prueba tu idea. Si te atoras, puedes consultar los pasos sin que se complete tu diagrama automáticamente.</p><button type="button" className="v146-guide-button" onClick={onHelp}>Abrir guía paso a paso →</button></div>}
    </div>
  </section>;
}
