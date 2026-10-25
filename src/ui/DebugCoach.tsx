import React from 'react';
import { FlowFunction } from '../domain/models';
import { coachAdvice } from '../learning/errorCoach';
export function DebugCoach({error,func,onReview}: {error:string;func:FlowFunction;onReview:()=>void}):React.ReactElement {
 const advice=coachAdvice(error,func);
 return <div className="v10-coach"><span className="v10-eyebrow">TU ENTRENADOR DE DEPURACIÓN</span><h3>{advice.title}</h3><p><strong>Qué puede estar pasando:</strong> {advice.cause}</p><p><strong>Intenta esto:</strong> {advice.firstStep}</p><button className="v10-light" onClick={onReview}>Ver ejecución paso a paso →</button><small>Habilidad para repasar: {advice.lesson}. Es una pista basada en el error; no garantiza que sea la única causa.</small></div>;
}
