import React, { useMemo, useState } from 'react';
import { evaluateMicro, evaluateOrdering, orderingPuzzles, masteryBySkill, microTasks, MicroTask, PracticeRecord, recommendMicro, Skill } from '../learning/skillArcade';
interface Props { readonly records: Readonly<Record<string,PracticeRecord>>; readonly onRecord:(id:string,passed:boolean)=>void;readonly onBack:()=>void; }
const skillLabels:Record<Skill,string>={secuencia:'Secuencias',variables:'Variables',condiciones:'Decisiones',ciclos:'Ciclos',arreglos:'Arreglos',funciones:'Funciones'};
const kindLabels={predict:'Predice el resultado',debug:'Detecta el error',order:'Ordena la solución'};
export function PracticeArcade({records,onRecord,onBack}:Props):React.ReactElement {
 const [skill,setSkill]=useState<Skill|'todas'>('todas');
 const [selected,setSelected]=useState<string>(()=>recommendMicro(records).id);
 const [choice,setChoice]=useState<number|null>(null);
 const [checked,setChecked]=useState(false);
 const [reveal,setReveal]=useState(false);
 const [orderParts,setOrderParts]=useState<readonly string[]>(()=>orderingPuzzles[recommendMicro(records).id]?.initial??[]);
 const challenges=useMemo(()=>microTasks.filter(t=>skill==='todas'||t.skill===skill),[skill]);
 const active=challenges.find(t=>t.id===selected)??challenges[0];
 const answer=active.kind==='order'?evaluateOrdering(active,orderParts):choice===null?null:evaluateMicro(active,choice);
 const mastery=masteryBySkill(records);
 const select=(t:MicroTask)=>{setSelected(t.id);setChoice(null);setChecked(false);setReveal(false);setOrderParts([...(orderingPuzzles[t.id]?.initial??[])]);};
 const movePart=(i:number,delta:number)=>{if(checked)return;const j=i+delta;if(j<0||j>=orderParts.length)return;const next=[...orderParts];[next[i],next[j]]=[next[j],next[i]];setOrderParts(next);};
 const next=()=>{const ix=challenges.findIndex(t=>t.id===active.id);select(challenges[(ix+1)%challenges.length]);};
 return <div className="v10-page">
  <header className="v10-top"><button onClick={onBack}>← Mi academia</button><div><span>PRÁCTICA INTELIGENTE</span><strong>Entrena tu pensamiento lógico</strong></div><span className="v10-pill">{microTasks.length} microretos</span></header>
  <main className="v10-page-content">
   <section className="v10-hero compact"><span className="v10-eyebrow">PREDICE · DESCUBRE · CORRIGE</span><h1>No necesitas empezar desde cero cada vez.</h1><p>Elige una respuesta, compruébala y entiende por qué. Si fallas, vuelve a practicar; el sistema registra qué habilidad necesita más atención.</p><button className="v10-white-button" onClick={()=>select(recommendMicro(records))}>✦ Practicar mi siguiente reto</button></section>
   <div className="v10-skill-grid">{mastery.map(item=><button key={item.skill} className={`v10-skill ${skill===item.skill?'active':''}`} onClick={()=>{setSkill(item.skill);const t=microTasks.find(t=>t.skill===item.skill);if(t)select(t);}}><strong>{skillLabels[item.skill]}</strong><span>{item.answered}/{item.total} intentados</span><div className="v10-skill-track"><i style={{width:`${item.mastery}%`}}/></div><small>{item.mastery}% de dominio estimado</small></button>)}</div>
   <div className="v10-arcade-layout"><aside className="v10-arcade-rail"><div className="v10-filter-title"><h2>Actividades</h2><button onClick={()=>setSkill('todas')}>Ver todas</button></div>{challenges.map((t,i)=><button key={t.id} onClick={()=>select(t)} className={`v10-micro-link ${active.id===t.id?'active':''}`}><span>{records[t.id]?.successes?'✓':String(i+1).padStart(2,'0')}</span><strong>{t.title}</strong><small>{kindLabels[t.kind]}</small></button>)}</aside>
   <section className="v10-arcade-work" aria-live="polite"><span className="v10-eyebrow">{skillLabels[active.skill]} · {kindLabels[active.kind]}</span><h2>{active.title}</h2><p className="v10-question">{active.prompt}</p><div className="v10-concept-box"><span>EJEMPLO PARA PENSAR</span><strong>{active.example}</strong></div>{active.kind==='order'?<div className="v10-order-puzzle"><p>Ordena las piezas de arriba a abajo. Usa las flechas para moverlas.</p>{orderParts.map((part,index)=><div className="v10-order-row" key={part}><span>{index+1}</span><strong>{part}</strong><div><button type="button" disabled={checked||index===0} onClick={()=>movePart(index,-1)} aria-label={`Subir ${part}`}>↑</button><button type="button" disabled={checked||index===orderParts.length-1} onClick={()=>movePart(index,1)} aria-label={`Bajar ${part}`}>↓</button></div></div>)}</div>:<div className="v10-options">{active.choices.map((label,index)=><button key={label} disabled={checked} aria-pressed={choice===index} className={`v10-option ${choice===index?'chosen':''} ${checked&&index===active.correct?'correct':''} ${checked&&choice===index&&index!==active.correct?'incorrect':''}`} onClick={()=>setChoice(index)}><span>{String.fromCharCode(65+index)}</span>{label}</button>)}</div>}
    {checked&&answer&&<div className={`v10-answer ${answer.passed?'correct':'incorrect'}`} role="status"><strong>{answer.passed?'¡Lo resolviste!':'Buen intento. Aprende de este error.'}</strong><p>{answer.passed?answer.message:active.explanation}</p></div>}
    {reveal&&!checked&&<div className="v10-answer"><strong>Pista</strong><p>{active.example} Piensa cómo cambia cada valor.</p></div>}
    <div className="v10-arcade-actions"><button className="v10-light" onClick={()=>setReveal(v=>!v)} disabled={checked}>💡 Ver pista</button>{!checked?<button className="v10-primary" disabled={active.kind!=='order'&&choice===null} onClick={()=>{if(active.kind!=='order'&&choice===null)return;const result=active.kind==='order'?evaluateOrdering(active,orderParts):evaluateMicro(active,choice as number);onRecord(active.id,result.passed);setChecked(true);}}>Comprobar respuesta →</button>:<button className="v10-primary" onClick={next}>Siguiente actividad →</button>}</div>
   </section></div>
  </main>
 </div>;
}
