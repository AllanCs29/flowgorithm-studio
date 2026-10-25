import React, { useEffect, useState } from 'react';
import { scenarioFor, VisualBlock, VisualScenario, circleScenario, functionScenario, memoryValueState } from '../learning/visualLessons';

const startingMoment:Readonly<Record<string,readonly number[]>> = {
  flow:[0,1,2],output:[0,1,2],declare:[0,1,2],assign:[0,1,2],input:[0,1,2],
  if:[1,2,3],compare:[1,1,2],while:[1,2,3],do:[1,2,3],for:[1,1,2],
  comments:[0,1,2],accum:[0,2,4],factorial:[0,3,8],integrated:[0,1,2],
  functions:[0,4,6],parameters:[3,5,6]
};
const TYPE_NAMES:Readonly<Record<string,string>>={start:'Inicio (Main)',declare:'Declarar',assign:'Asignar',input:'Entrada',output:'Salida',decision:'Decisión',loop:'Ciclo',comment:'Comentario',call:'Llamar función',return:'Retornar',end:'Fin (End)'};

function Block({block,scenario,active,visited,onPick,disabled}: {
  block:VisualBlock;scenario:VisualScenario;active:boolean;visited:boolean;onPick:(id:string)=>void;disabled:boolean;
}):React.ReactElement {
  return <button type="button" className={`v11-flow-block kind-${block.kind} ${active?'is-active':''} ${visited?'is-visited':''}`}
    onClick={()=>onPick(block.id)} disabled={disabled}
    aria-current={active?'step':undefined} aria-label={`${TYPE_NAMES[block.kind]}: ${block.label}${active?', paso actual':''}`}
    title={disabled?'Responde para explorar cada paso':`Ver qué ocurre en: ${block.label}`}>
    <small>{TYPE_NAMES[block.kind]}</small><strong>{block.label}</strong>
    {active&&<span className="v11-active-tag">EN ESTE PASO</span>}
    {scenario.mode==='loop' && block.lane==='body' && <span className="v11-loop-mini">↺</span>}
  </button>;
}

function FlowDiagram({scenario,active,visited,onPick,locked}: {
  scenario:VisualScenario;active:string;visited:ReadonlySet<string>;onPick:(id:string)=>void;locked:boolean;
}):React.ReactElement {
  const make=(block:VisualBlock)=><Block key={block.id} block={block} scenario={scenario} active={active===block.id} visited={visited.has(block.id)} disabled={locked} onPick={onPick}/>;
  const arrow=(key:string)=> <span className="v11-flow-arrow" aria-hidden="true" key={key}>↓</span>;
  const base=scenario.blocks.filter(block=>block.lane==='main');
  const yes=scenario.blocks.find(block=>block.lane==='yes');
  const no=scenario.blocks.find(block=>block.lane==='no');
  const body=scenario.blocks.filter(block=>block.lane==='body');
  const exit=scenario.blocks.filter(block=>block.lane==='exit');
  if(scenario.mode==='function'){
    const helper=scenario.blocks.filter(block=>block.lane==='callee');
    return <div className="v13-functions-flow" aria-label="Dos diagramas: Main y la función llamada">
      <div className={`v13-function-column ${helper.some(block=>block.id===active)?'is-waiting':''}`}><span className="v13-function-heading">1 · PROGRAMA PRINCIPAL · MAIN</span><div className="v11-flow-graph">{base.flatMap((block,index)=>[make(block),index<base.length-1?arrow(`main${index}`):null])}</div></div>
      <div className="v13-function-link" aria-hidden="true"><span>⇢ LLAMAR</span><span>⇠ RETORNAR</span></div>
      <div className={`v13-function-column ${helper.some(block=>block.id===active)?'is-running':''}`}><span className="v13-function-heading">2 · FUNCIÓN REUTILIZABLE</span><div className="v11-flow-graph">{helper.flatMap((block,index)=>[make(block),index<helper.length-1?arrow(`callee${index}`):null])}</div></div>
    </div>;
  }
  if(scenario.mode==='branch'){
    return <div className="v11-flow-graph" aria-label="Diagrama de flujo con dos rutas">
      {base.flatMap((block,index)=>[make(block),index<base.length-1?arrow(`a${index}`):null])}
      <div className="v11-branch-routes">
        {yes&&<div className={`v11-branch-arm ${active===no?.id?'is-dimmed':''}`}><span className="v11-branch-name">↙ Sí</span>{make(yes)}</div>}
        {no&&<div className={`v11-branch-arm ${active===yes?.id?'is-dimmed':''}`}><span className="v11-branch-name">No ↘</span>{make(no)}</div>}
      </div>
      <div className="v11-merge-label">↘ Las ramas se unen ↙</div>
      {exit.map(block=>make(block))}
    </div>;
  }
  if(scenario.mode==='loop'||scenario.mode==='do'){
    const prefix=scenario.mode==='do'?base.filter(block=>block.kind!=='loop'):base;
    const condition=scenario.mode==='do'?base.find(block=>block.kind==='loop'):undefined;
    return <div className="v11-flow-graph" aria-label="Diagrama de flujo con ciclo">
      {prefix.flatMap((block,index)=>[make(block),index<prefix.length-1?arrow(`p${index}`):null])}
      {scenario.mode==='do' && arrow('do-start')}
      <div className="v11-loop-area">
        {scenario.mode==='do'&&body.map(block=>make(block))}
        {scenario.mode==='do'&&arrow('do-cond')}
        {condition&&make(condition)}
        {scenario.mode==='loop'&&body.map(block=><React.Fragment key={block.id}>{arrow(`b${block.id}`)}{make(block)}</React.Fragment>)}
        <div className="v11-loop-return">↺ Sí: vuelve a repetir {scenario.mode==='loop'?'la condición':'el cuerpo'}</div>
      </div>
      <span className="v11-flow-arrow" aria-hidden="true">↓</span>
      <span className="v11-exit-label">No: continuar</span>
      {exit.map(block=>make(block))}
    </div>;
  }
  return <div className="v11-flow-graph" aria-label="Diagrama de flujo lineal">{base.flatMap((block,index)=>[make(block),index<base.length-1?arrow(`l${index}`):null])}</div>;
}

export function VisualWalkthrough({lessonId,stepIndex,isQuiz,solved}: {
  lessonId:string;stepIndex:number;isQuiz:boolean;solved:boolean;
}):React.ReactElement|null {
  const scenario=scenarioFor(lessonId,isQuiz);
  if(!scenario)return null;
  return <div className="v12-lesson-visual-stack">
    <VisualScenarioView key={`${lessonId}:${stepIndex}:${isQuiz}`} scenario={scenario} lessonId={lessonId} stepIndex={stepIndex} isQuiz={isQuiz} solved={solved}/>
    {!isQuiz&&(['declare','assign','input'] as string[]).includes(lessonId)&&<CircleAreaLab/>}
    {!isQuiz&&(lessonId==='functions'||lessonId==='parameters')&&<FunctionLab kind={lessonId}/>}
  </div>;
}

function VisualScenarioView({scenario,lessonId,stepIndex,isQuiz,solved}: {
  scenario:VisualScenario;lessonId:string;stepIndex:number;isQuiz:boolean;solved:boolean;
}):React.ReactElement {
  const quizPreview=(isQuiz&&lessonId==='assign')?1:0;
  const suggested=startingMoment[lessonId]?.[stepIndex]??0;
  const [cursor,setCursor]=useState(isQuiz?quizPreview:Math.min(suggested,scenario.moments.length-1));
  const [autoPlay,setAutoPlay]=useState(false);
  const locked=isQuiz&&!solved;
  const lastIndex=scenario.moments.length-1;
  useEffect(()=>{
    if(!autoPlay||locked)return;
    if(cursor>=lastIndex){setAutoPlay(false);return;}
    const timer=window.setTimeout(()=>setCursor(index=>Math.min(index+1,lastIndex)),1700);
    return()=>window.clearTimeout(timer);
  },[autoPlay,locked,cursor,lastIndex]);
  const shownIndex=locked?quizPreview:cursor;
  const moment=scenario.moments[shownIndex];
  const visited=new Set(scenario.moments.slice(0,shownIndex+1).map(item=>item.block));
  const chooseBlock=(id:string)=>{
    const candidates=scenario.moments.map((m,i)=>m.block===id?i:-1).filter(index=>index>=0);
    if(candidates.length===0)return;
    setAutoPlay(false);
    setCursor(candidates.find(index=>index>cursor)??candidates[0]);
  };
  const valueEntries=Object.entries(moment.memory??{});
  const currentBlock=scenario.blocks.find(block=>block.id===moment.block);
  const previousMemory=shownIndex>0?scenario.moments[shownIndex-1].memory:undefined;
  const hasInitialValue=!locked&&currentBlock?.kind==='declare'&&valueEntries.length>0;
  const types:Record<string,string>={};
  for(const block of scenario.blocks.filter(item=>item.kind==='declare')){
    const suffix=block.label.match(/Declarar\s+([A-Za-z][A-Za-z0-9]*)\s*:\s*(Integer|Real|String|Boolean)/i);
    if(suffix)types[suffix[1]]=suffix[2];
    const prefix=block.label.match(/^(Integer|Real|String|Boolean)\s+(.+)$/i);
    if(prefix)for(const name of prefix[2].split(',').map(item=>item.trim()))types[name]=prefix[1];
  }
  return <aside className="v11-visual" aria-label="Ejemplo interactivo de diagrama de flujo">
    <div className="v11-visual-header"><div><span className="v11-visual-eyebrow">◈ EJEMPLO INTERACTIVO</span><h2>{isQuiz?'Mira la situación de la pregunta':'Sigue el recorrido del algoritmo'}</h2></div><div className="v11-visual-tools"><span className="v11-visual-counter">{locked?'Antes de responder':`Paso ${shownIndex+1} de ${scenario.moments.length}`}</span>{!locked&&<button type="button" className="v11-play-button" onClick={()=>{if(!autoPlay&&cursor===scenario.moments.length-1)setCursor(0);setAutoPlay(value=>!value);}}>{autoPlay?'Ⅱ Pausar':'▶ Reproducir'}</button>}</div></div>
    <p className="v11-visual-intro">{scenario.intro}</p><p className="v12-shape-hint">{scenario.mode==='function'?'Dos diagramas separados: Asignar llama una función con retorno; Retornar devuelve el resultado a Main. Toca cada bloque y sigue el resaltado.':'Observa las figuras: óvalo = Inicio/Fin · rectángulo dividido = Declarar · rectángulo = Asignar · paralelogramo = Entrada/Salida · rombo = decisión. Toca cada bloque.'}</p>
    <div className="v11-visual-grid">
      <FlowDiagram scenario={scenario} active={moment.block} visited={visited} onPick={chooseBlock} locked={locked}/>
      <div className="v11-flow-info" aria-live="polite" aria-atomic="true">
        {locked?<><span className="v11-info-label">OBSERVA Y PIENSA</span><p>{lessonId==='assign'?'La cajita total ya tiene un 3. ¿Qué pasará al ejecutar el siguiente bloque?': 'Recorre mentalmente el diagrama antes de elegir una respuesta.'}</p></>:<><span className="v11-info-label">¿QUÉ ESTÁ PASANDO?</span><p>{moment.description}</p></>}
        {moment.route&&!locked&&<div className="v11-route-pill">Ruta: {moment.route}</div>}
        {hasInitialValue&&<div className="v121-stage-note"><strong>Valor inicial ≠ resultado final</strong><span>Declarar crea la cajita con su valor inicial. Todavía no hemos leído datos ni hecho cuentas. Pulsa <b>Siguiente paso</b> para ver qué cambia.</span></div>}
        <div className="v11-memory-title"><span aria-hidden="true">▣</span> Cajitas · valor en este paso</div>
        {valueEntries.length?<div className="v11-memory-grid">{valueEntries.map(([name,value])=><div key={name} className={`v11-memory-box ${hasInitialValue?'v121-initial-memory':''}`}><span>{name}</span>{types[name]&&<small className={`v12-type-${types[name].toLowerCase()}`}>{types[name]}</small>}<strong>{value}</strong>{!locked&&currentBlock&&<em className="v121-memory-state">{memoryValueState(currentBlock.kind,value,previousMemory?.[name])}</em>}</div>)}</div>:<p className="v11-empty">Aún no hemos guardado datos.</p>}
        <div className="v11-output-title">▤ Resultado en pantalla</div>
        {!locked&&moment.output!==undefined?<pre className="v11-sample-output">{moment.output}</pre>:<div className="v11-empty">{locked?'Descúbrelo al responder.':'Todavía no hay un mensaje.'}</div>}
      </div>
    </div>
    {locked?<p className="v11-preview-hint">El resultado se descubrirá después de responder. Puedes comparar tus ideas con el recorrido completo.</p>:<div className="v11-trace-controls"><button type="button" onClick={()=>{setAutoPlay(false);setCursor(0);}} disabled={shownIndex===0}>↺ Reiniciar</button><div className="v11-trace-progress" aria-label={`Paso ${shownIndex+1} de ${scenario.moments.length}`}>{scenario.moments.map((_,index)=><button type="button" key={index} className={index===shownIndex?'active':''} onClick={()=>{setAutoPlay(false);setCursor(index);}} aria-label={`Ir al paso ${index+1}`} aria-current={index===shownIndex?'step':undefined}/>)}</div><button type="button" className="v11-trace-next" onClick={()=>{setAutoPlay(false);setCursor(index=>Math.min(index+1,scenario.moments.length-1));}} disabled={shownIndex===scenario.moments.length-1}>Siguiente paso →</button></div>}
    {isQuiz&&solved&&<p className="v11-solved-note">✓ Correcto. Ahora puedes tocar cualquier bloque y comprobar paso a paso por qué.</p>}
  </aside>;
}

/** Ejemplo opcional: permite leer un programa completo sin adelantarse a una evaluación. */
function CircleAreaLab():React.ReactElement {
  const [open,setOpen]=useState(false);
  const [radius,setRadius]=useState(3);
  return <section className="v12-circle-lab" aria-label="Explorar el programa de área del círculo">
    <button type="button" className="v12-circle-launch" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
      <span><small>EJEMPLO DEL FLOWGORITHM ORIGINAL</small><strong>¿Cómo se calcula el área de un círculo?</strong><em>Declarar → Entrada → Asignar → Salida</em></span>
      <span aria-hidden="true">{open?'−':'+'}</span>
    </button>
    {open&&<div className="v12-circle-expanded">
      <p>El radio es la distancia del centro del círculo hasta su borde. Cambia el número y comprueba qué hace cada figura.</p>
      <label className="v12-radius-control" htmlFor="v12-radius">Radio que escribirías en <code>Input radius</code>
        <strong>{radius}</strong>
      </label>
      <input id="v12-radius" type="range" min="0.5" max="10" step="0.5" value={radius} onChange={(event:{target:{value:string}})=>setRadius(Number(event.target.value))}/>
      <div className="v12-circle-equation" role="status">Área ≈ 3.1416 × {radius}² = <strong>{Number((Math.PI*radius**2).toFixed(4))}</strong></div>
      <VisualScenarioView key={`circle:${radius}`} scenario={circleScenario(radius)} lessonId="circle" stepIndex={0} isQuiz={false} solved={true}/>
      <p className="v12-circle-footnote">Es el mismo algoritmo de tu imagen. El resultado se redondea a cuatro decimales para que sea fácil de leer; <code>pi</code> tiene más precisión internamente.</p>
    </div>}
  </section>;
}


/** Laboratorio manipulable con los mismos nombres que los retos del editor. */
function FunctionLab({kind}:{kind:'functions'|'parameters'}):React.ReactElement {
  const [first,setFirst]=useState(kind==='functions'?4:3);
  const [second,setSecond]=useState(5);
  const isSum=kind==='parameters';
  const scenario=functionScenario(kind,first,second);
  const expected=isSum?first+second:first*2;
  return <section className="v13-function-lab" aria-label="Laboratorio de funciones">
    <div className="v13-lab-heading"><div><small>LABORATORIO · CAMBIA LOS ARGUMENTOS</small><h3>{isSum?'Prueba sumar(a, b)':'Prueba doble(x)'}</h3><p>Experimenta con distintos números. Los valores entran a los parámetros y el retorno vuelve a Main. Este ejemplo es una simulación guiada del algoritmo.</p></div><span className="v13-lab-chip">Resultado: {expected}</span></div>
    <div className="v13-function-fields"><label>Argumento {isSum?'x':'numero'} en Main <input type="number" min="-100" max="100" step="1" value={first} onChange={(event:{target:{value:string}})=>setFirst(Math.max(-100,Math.min(100,Math.trunc(Number(event.target.value)||0))))}/></label>
      {isSum&&<label>Argumento y en Main <input type="number" min="-100" max="100" step="1" value={second} onChange={(event:{target:{value:string}})=>setSecond(Math.max(-100,Math.min(100,Math.trunc(Number(event.target.value)||0))))}/></label>}</div>
    <div className="v13-function-meaning"><span><b>Argumento:</b> {isSum?`${first}, ${second}`:first} enviados desde Main</span><span><b>Parámetro:</b> {isSum?`a=${first}, b=${second}`:`x=${first}`} dentro de la función</span><span><b>Retornar:</b> {expected} llega a resultado en Main</span></div>
    <VisualScenarioView key={`lab-${kind}-${first}-${second}`} scenario={scenario} lessonId={kind} stepIndex={0} isQuiz={false} solved={true}/>
  </section>;
}
