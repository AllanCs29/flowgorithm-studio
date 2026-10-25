import React, { useState } from 'react';
import { FlowFunction, RuntimeValue, TYPE_LABELS } from '../domain/models';
import { ExecutionContext } from '../interpreter/engine';
import { format, upcomingDecision, VisualFrame } from '../interpreter/visualTrace';

interface Props {
  func: FlowFunction;
  frames: readonly VisualFrame[];
  cursor: number;
  playing: boolean;
  speed: number;
  onSeek: (index: number) => void;
  onStep: () => void;
  onPlay: () => void;
  onSpeed: (ms: number) => void;
  onReset: () => void;
  onRun: () => void;
  onInput: () => void;
}
function label(value: RuntimeValue | undefined): string { return format(value); }
function ValueViewer({ value, changedIndices }: { value: RuntimeValue; changedIndices?: readonly number[] }): React.ReactElement {
  const [showAll, setShowAll] = useState(false);
  if (!Array.isArray(value)) return <code className="v7-value-text">{label(value)}</code>;
  const limit = showAll ? Math.min(200, value.length) : Math.min(12, value.length);
  return <div className="v7-array-wrap"><div className="v7-array-cells" aria-label={`Arreglo con ${value.length} elementos`}>
    {value.slice(0, limit).map((item, index) => <div key={index} className={`v7-array-cell ${changedIndices?.includes(index) ? 'changed' : ''}`}><span>[{index}]</span><strong>{label(item)}</strong></div>)}
  </div>{value.length > limit && <button className="v7-array-more" type="button" onClick={()=>setShowAll(true)}>Mostrar más ({value.length - limit} ocultos)</button>}{showAll && value.length > 200 && <small>Se muestran los primeros 200 elementos para mantener la aplicación fluida.</small>}</div>;
}

export function VisualDebugger({ func, frames, cursor, playing, speed, onSeek, onStep, onPlay, onSpeed, onReset, onRun, onInput }: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(true);
  const [prediction, setPrediction] = useState<{nodeId:string;stepCount:number;choice:boolean}|null>(null);
  const frame = frames[cursor] ?? frames[0];
  const context: ExecutionContext = frame.context;
  const next = context.currentNodeId ? func.nodes[context.currentNodeId] : undefined;
  const predicted = upcomingDecision(func, context);
  const predictionAlreadyMade = prediction && predicted && prediction.nodeId===predicted.nodeId && prediction.stepCount===context.stepCount;
  const verified = prediction && frame.decision && frame.decision.nodeId === prediction.nodeId && context.stepCount > prediction.stepCount;
  const changed = new Map(frame.changes.map(change => [change.name, change]));
  const isWaiting = context.status==='WAITING_INPUT';
  const isTerminal = ['FINISHED','ERROR','STOPPED'].includes(context.status);
  return <section className={`v7-simulator ${expanded?'expanded':'collapsed'}`} aria-label="Simulador visual de la ejecución">
    <div className="v7-simulator-top">
      <div className="v7-simulator-identity"><span className="v7-simulator-symbol" aria-hidden="true">◉</span><div><strong>Así piensa tu algoritmo</strong><span>{frame.label} · {context.status==='FINISHED'?'Terminado':context.status==='ERROR'?'Error':context.status==='WAITING_INPUT'?'Espera un dato':playing?'Animando':'En pausa'}</span></div></div>
      <button className="v7-toggle" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?'Ocultar detalles ▴':'Explorar la ejecución ▾'}</button>
    </div>
    {expanded && <div className="v7-simulator-content">
      <div className="v7-simulator-controls" role="group" aria-label="Controles de simulación">
        <button onClick={()=>onSeek(cursor-1)} disabled={cursor===0 || playing} title="Volver al estado anterior">◀ Anterior</button>
        {cursor < frames.length-1 ? <button onClick={()=>onSeek(cursor+1)} disabled={playing} title="Reproducir el siguiente estado ya grabado">Siguiente grabado ▶</button> : <button className="v7-primary" onClick={isWaiting?onInput:onStep} disabled={playing || isTerminal}>{isWaiting?'⌨ Dar un dato':'▶ Siguiente paso'}</button>}
        <button className={playing?'v7-pause':'v7-secondary'} onClick={onPlay} disabled={isTerminal || isWaiting} aria-pressed={playing}>{playing?'Ⅱ Pausar':'▷ Animar'}</button>
        <button onClick={onRun} disabled={playing || isTerminal || isWaiting}>⇥ Ejecutar todo</button>
        <button onClick={onReset} title="Reiniciar desde Inicio">↺</button>
        <label className="v7-speed">Velocidad<select value={speed} onChange={event=>onSpeed(Number(event.target.value))}><option value={1250}>Lenta</option><option value={750}>Normal</option><option value={320}>Rápida</option></select></label>
      </div>
      <div className="v7-timeline"><div className="v7-timeline-heading"><strong>Viaja por la ejecución</strong><span>Fotograma {cursor+1} de {frames.length}{frames[0].context.stepCount>0?' · se conservan los últimos pasos':''}</span></div><input aria-label="Recorrer los pasos ejecutados" type="range" min="0" max={Math.max(0,frames.length-1)} value={cursor} disabled={playing || frames.length===1} onChange={event=>onSeek(Number(event.target.value))}/><p>Retroceder aquí recupera los valores registrados, sin volver a ejecutar el programa.</p></div>
      <div className="v7-simulator-columns">
        <div className="v7-simulator-explain"><span className="v7-mini-kicker">¿QUÉ ACABA DE OCURRIR?</span><p className="v7-explanation" aria-live="polite">{frame.explanation}</p>
          {frame.decision && <div className={`v7-branch-badge ${frame.decision.passed?'yes':'no'}`}><strong>{frame.decision.passed?'✓ Sí / verdadero':'✕ No / falso'}</strong><span>{frame.decision.phase==='entry'?'Entrada al cuerpo del ciclo':'Ruta elegida por el programa'}</span></div>}
          {verified && <div className={`v7-prediction-result ${prediction.choice===frame.decision?.passed?'right':'wrong'}`} role="status">{prediction.choice===frame.decision?.passed?'¡Acertaste! Predijiste la rama correcta.':'Esta vez tomó la otra rama. Observa los valores y vuelve a intentarlo.'}</div>}
          {next && <p className="v7-next-step"><strong>Después:</strong> {TYPE_LABELS[next.type]} {next.type==='If'?'evaluará una condición.':next.type==='Assign'?'actualizará un dato.':'es la siguiente pieza.'}</p>}
          {predicted && !predictionAlreadyMade && <div className="v7-predict"><span className="v7-mini-kicker">ANTES DE EJECUTAR</span><h4>¿Qué crees que pasará?</h4><p>¿La condición <code>{predicted.expression}</code> será verdadera o falsa?</p><div className="v7-predict-choices"><button onClick={()=>setPrediction({nodeId:predicted.nodeId,stepCount:context.stepCount,choice:true})}>Creo que Sí</button><button onClick={()=>setPrediction({nodeId:predicted.nodeId,stepCount:context.stepCount,choice:false})}>Creo que No</button></div></div>}
          {predictionAlreadyMade && <p className="v7-predict-locked">Predicción guardada: <strong>{prediction.choice?'Sí':'No'}</strong>. Ejecuta el siguiente paso para comprobarla.</p>}
          {context.error && <p className="v7-trace-error" role="alert">{context.error}</p>}
        </div>
        <div className="v7-memory"><div className="v7-memory-heading"><div><span className="v7-mini-kicker">MEMORIA VIVA</span><h4>Variables y arreglos</h4></div><small>{frame.changes.length ? `${frame.changes.length} cambio(s)` : 'Sin cambios'}</small></div>
          {Object.keys(context.variables).length ? <div className="v7-memory-list">{Object.entries(context.variables).map(([name,value])=><div className={`v7-memory-row ${changed.has(name)?'changed':''}`} key={name}><div className="v7-memory-meta"><strong>{name}</strong>{changed.has(name)&&<span className="v7-changed-pill">Cambió</span>}</div><ValueViewer value={value} changedIndices={changed.get(name)?.changedIndices}/>{changed.has(name) && !Array.isArray(value) && <small>Antes: {label(changed.get(name)?.before)}</small>}</div>)}</div>:<p className="v7-memory-empty">Todavía no hay datos. Usa Declarar para crear la primera variable.</p>}
        </div>
      </div>
      {context.outputLog.length>0 && <div className="v7-output"><span className="v7-mini-kicker">LO QUE MOSTRÓ TU PROGRAMA</span><pre>{context.outputLog.join('')}</pre></div>}
      {frame.newOutput && <p className="v7-new-output">Nueva salida de este paso: <code>{frame.newOutput.replace(/\n/g,'↵')}</code></p>}
      <p className="v7-limit-note">Esta vista registra la función principal; una función llamada dentro de otra aparece resumida como una sola instrucción. El historial se limita a {450} fotogramas para cuidar el rendimiento.</p>
    </div>}
  </section>;
}
