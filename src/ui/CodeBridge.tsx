import React from 'react';
import { FlowNode, TYPE_LABELS } from '../domain/models';
import { pedagogicalCode } from '../learning/codeBridge';
import { LanguageId } from '../generators';
export function CodeBridge({node,language,onLanguage,onFullCode}: {node?:FlowNode;language:LanguageId;onLanguage:(l:LanguageId)=>void;onFullCode:()=>void}):React.ReactElement {
 const info=node?pedagogicalCode(node,language):null;
 return <div className="v10-bridge"><span className="v10-eyebrow">DEL DIAGRAMA AL CÓDIGO</span><h3>El mismo pensamiento, otro lenguaje</h3><p>Toca un bloque del diagrama y observa su equivalente. Es un ejemplo didáctico; el código completo se genera aparte.</p><label>Lenguaje<select value={language} onChange={e=>onLanguage(e.target.value as LanguageId)}>{(['python','javascript','c','cpp','java'] as const).map(l=><option value={l} key={l}>{l==='cpp'?'C++':l==='c'?'C':l==='javascript'?'JavaScript':l==='java'?'Java':'Python'}</option>)}</select></label>{node&&info?<><div className="v10-bridge-shape"><small>PIEZA DEL DIAGRAMA</small><strong>{TYPE_LABELS[node.type]}</strong></div><pre className="v10-code-sample">{info.code}</pre><div className="v10-answer"><strong>¿Qué significa?</strong><p>{info.meaning}</p><small>{info.note}</small></div></>:<div className="v10-empty-state">Selecciona una pieza para entender cómo se traduce al código.</div>}<button className="v10-primary v10-wide" onClick={onFullCode}>Ver código generado completo →</button></div>;
}
