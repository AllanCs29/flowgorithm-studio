import React, { useMemo, useRef, useState } from 'react';
import { catalog, challengeFor, playableChallenges } from '../learning/challengeBank';

export function ChallengeLibrary({completed,onBack,onBegin}:{completed:ReadonlySet<string>;onBack:()=>void;onBegin:(number:number)=>void}):React.ReactElement {
  const [world,setWorld]=useState(0);
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<number|null>(3);
  const [previewDone,setPreviewDone]=useState(false);
  const detailRef=useRef<HTMLElement|null>(null);
  const ready=playableChallenges.length;
  const completedCount=playableChallenges.filter(p=>completed.has(p.exercise.id)).length;
  const worlds=[...new Map(catalog.map(item=>[item.world,item.worldName])).entries()];
  const visible=useMemo(()=>catalog.filter(item=>(!world||item.world===world)&&(!query||`${item.number} ${item.title} ${item.description}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')))),[world,query]);
  const item=catalog.find(c=>c.number===selected);
  const challenge=item?challengeFor(item.number):undefined;
  const select=(number:number)=>{setSelected(number);setPreviewDone(false);if(typeof window!=='undefined' && window.matchMedia('(max-width: 900px)').matches) window.requestAnimationFrame(()=>detailRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));};
  return <div className="v6-library">
    <header className="v6-library-top"><button className="v6-nav-back" onClick={onBack}>← Mis clases</button><div className="v6-brand">◇ <strong>Laboratorio de lógica</strong></div><span className="v6-progress-brief">{completedCount}/{ready} retos superados</span></header>
    <main className="v6-library-layout">
      <section className="v6-library-left" aria-label="Catálogo de retos">
        <div className="v6-library-intro"><span className="v6-kicker">PRÁCTICA POR NIVELES</span><h1>100 retos para pensar mejor.</h1><p>Empieza con una habilidad sencilla y sube de dificultad. Cada reto está listo para practicar: los primeros evalúan acciones del editor y los demás prueban tu algoritmo con varias entradas.</p>
          <div className="v6-counts"><div><strong>100</strong><small>problemas en la ruta</small></div><div><strong>{ready}</strong><small>practicables hoy</small></div><div><strong>{completedCount}</strong><small>superados</small></div></div>
        </div>
        <div className="v6-library-filters"><label className="v6-search">Buscar ejercicio<input aria-label="Buscar retos" type="search" placeholder="Ej. arreglos, sumas, ciclos..." value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="v6-filter">Mundo<select value={world} onChange={e=>{setWorld(Number(e.target.value));setSelected(null);}}><option value={0}>Todos los mundos</option>{worlds.map(([id,name])=><option key={id} value={id}>{id}. {name}</option>)}</select></label></div>
        <div className="v6-exercise-list">{visible.map(exercise=>{const playable=challengeFor(exercise.number);const done=playable&&completed.has(playable.exercise.id);return <button key={exercise.number} className={`v6-exercise-tile ${selected===exercise.number?'active':''}`} onClick={()=>select(exercise.number)} aria-pressed={selected===exercise.number}><span className={`v6-exercise-num ${done?'done':''}`}>{done?'✓':String(exercise.number).padStart(3,'0')}</span><span className="v6-exercise-info"><strong>{exercise.title}</strong><small>Mundo {exercise.world} · {exercise.description}</small></span><span className={`v6-exercise-status ${playable?'ready':'future'}`}>{done?'Superado':playable?'Practicar':'No disponible'}</span></button>})}{visible.length===0&&<p className="v6-empty">No encontramos ejercicios con esa búsqueda.</p>}</div>
      </section>
      <aside ref={detailRef} className="v6-library-detail" aria-label="Tutorial del reto seleccionado">
        {item?<><div className="v6-detail-heading"><span className="v6-kicker">MUNDO {item.world} · EJERCICIO {String(item.number).padStart(3,'0')}</span><h2>{item.title}</h2><p>{item.description}</p></div><div className="v6-detail-card"><strong>¿Qué aprenderás?</strong><p>{item.check}</p></div>
          {challenge?<><div className="v6-detail-card highlight"><strong>1. Mira el ejemplo</strong><p>{challenge.example}</p><div className="v6-mini-flow"><span>Inicio</span><b>↓</b><span>Piensa el problema</span><b>↓</b><span>Compara el resultado</span></div></div><div className="v6-detail-card"><strong>2. Piensa antes de tocar</strong><p>{challenge.insight}</p><button className="v6-preview-check" onClick={()=>setPreviewDone(v=>!v)} aria-pressed={previewDone}>{previewDone?'✓ Entendido: listo para intentarlo':'Ya entendí el ejemplo'}</button>{previewDone&&<p className="v6-preview-success" role="status">¡Bien! Encontrarás una pista dentro del editor si te atoras.</p>}</div><button className="v6-play" disabled={!previewDone} onClick={()=>onBegin(item.number)}>3. Abrir práctica interactiva →</button><p className="v6-detail-footnote">En los retos de interfaz se comprueban tus acciones. En los de algoritmos, arreglarás un diagrama y lo probaremos con varias entradas.</p></>:<div className="v6-detail-pending"><strong>Esta práctica necesita más desarrollo.</strong><p>El temario está definido, pero todavía no hay un algoritmo ejecutable, pruebas completas y tutorial suficientes para habilitarla. Los retos de esta ruta están habilitados.</p><button onClick={()=>{const next=playableChallenges.find(p=>p.number>item.number)??playableChallenges[0];select(next.number);}}>Ver un reto practicable →</button></div>}</>:<div className="v6-detail-placeholder"><h2>Elige un ejercicio</h2><p>Toca cualquiera de los 100 problemas para ver su explicación y disponibilidad.</p></div>}
      </aside>
    </main>
  </div>;
}
