import React, { useState } from 'react';
import { FlowNode, TYPE_LABELS } from '../domain/models';

const BLOCKS: ReadonlyArray<{ type: FlowNode['type']; icon: string; purpose: string; group: 'Básicos' | 'Decisiones y ciclos' | 'Avanzados'; supported: boolean }> = [
  { type: 'Output', icon: '▱', purpose: 'Mostrar un resultado', group: 'Básicos', supported: true },
  { type: 'Declare', icon: '▤', purpose: 'Crear una variable', group: 'Básicos', supported: true },
  { type: 'Assign', icon: '=', purpose: 'Guardar un valor', group: 'Básicos', supported: true },
  { type: 'Input', icon: '⌨', purpose: 'Pedir un dato', group: 'Básicos', supported: true },
  { type: 'If', icon: '◇', purpose: 'Elegir Sí o No', group: 'Decisiones y ciclos', supported: true },
  { type: 'While', icon: '↻', purpose: 'Repetir mientras se cumpla', group: 'Decisiones y ciclos', supported: true },
  { type: 'Do', icon: '⟳', purpose: 'Repetir al menos una vez', group: 'Decisiones y ciclos', supported: true },
  { type: 'For', icon: '∑', purpose: 'Contar repeticiones', group: 'Decisiones y ciclos', supported: true },
  { type: 'Comment', icon: '☷', purpose: 'Añadir una explicación', group: 'Avanzados', supported: true },
  { type: 'Call', icon: 'ƒ', purpose: 'Funciones (en el panel de Funciones)', group: 'Avanzados', supported: false },
  { type: 'Return', icon: '↩', purpose: 'Retornar desde la función', group: 'Avanzados', supported: false }
];

export function BlockPalette({ onInsert, canInsert, activeType, onHelp, onHelpBlock, suggestedType }: {
  onInsert: (type: FlowNode['type']) => void;
  canInsert: boolean;
  activeType?: FlowNode['type'] | null;
  onHelp?: () => void;
  onHelpBlock?: (type: FlowNode['type']) => void;
  suggestedType?: FlowNode['type'];
}): React.ReactElement {
  const [filter, setFilter] = useState('');
  const filtered = BLOCKS.filter(block => `${TYPE_LABELS[block.type]} ${block.purpose}`.toLowerCase().includes(filter.toLowerCase()));
  return <div className="palette-content">
    <div className="section-heading"><div><span className="eyebrow">BIBLIOTECA</span><h2>Piezas del diagrama</h2></div><button onClick={onHelp} title="Abrir guía de todos los bloques">Guía ↗</button></div>
    <p className="sidebar-lead"><span className="v142-palette-desktop">Pulsa para elegir una pieza o arrástrala sobre un bloque. Después indica dónde colocarla.</span><span className="v142-palette-mobile">Toca una pieza: no necesitas arrastrar. Después escribe sus datos; los ejemplos no se rellenan solos.</span></p>
    <label className="search-wrap"><span className="sr-only">Buscar bloques</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="⌕  Buscar un bloque..." /></label>
    {(['Básicos', 'Decisiones y ciclos', 'Avanzados'] as const).map(group => {
      const blocks = filtered.filter(item => item.group === group);
      return blocks.length > 0 && <section key={group} className="palette-group"><h3>{group}</h3><div className="modern-block-grid">
        {blocks.map(block => <div key={block.type} className={`block-choice ${activeType === block.type ? 'picked' : ''} ${suggestedType === block.type ? 'recommended' : ''}`}>
          <button type="button" className="block-pick" disabled={!canInsert || !block.supported} onClick={() => onInsert(block.type)} draggable={canInsert && block.supported}
            onDragStart={e => { e.dataTransfer.setData('application/x-flow-node', block.type); e.dataTransfer.effectAllowed = 'copy'; }} title={`Elegir ${TYPE_LABELS[block.type]} · arrastrable`}>
            <span className="block-icon" aria-hidden="true">{block.icon}</span><span className="block-text"><strong>{TYPE_LABELS[block.type]}</strong><small>{block.purpose}</small></span>
          </button>
          <button className="block-info" type="button" aria-label={`Aprender sobre ${TYPE_LABELS[block.type]}`} onClick={() => onHelpBlock?.(block.type)}>ⓘ</button>
        </div>)}
      </div></section>;
    })}
    {filtered.length === 0 && <p className="empty">No encontramos ese bloque.</p>}
    <p className="support-note">ⓘ abre un ejemplo para aprender a usar cada bloque. Las funciones se crean desde Opciones → Funciones.</p>
  </div>;
}
