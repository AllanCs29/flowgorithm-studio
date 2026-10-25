import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlowFunction, FlowNode, NodeId, TYPE_LABELS } from '../domain/models';
import { LayoutEngine, DEFAULT_LAYOUT, LayoutOptions } from '../layout/layoutEngine';
import { projectNodes } from '../renderer/projection';
import { resolveDropTarget } from '../interaction/dropResolver';
import { InteractionController, PointerInput } from '../interaction/controller';
import { InsertPosition } from '../domain/structural';
import { insertionTargets } from './workspaceModel';

const engine = new LayoutEngine();
function nodeText(n: FlowNode): string { switch (n.type) { case 'Start': return 'Main'; case 'End': return 'End'; case 'Declare': return `${n.dataType} ${n.name}${n.arraySize ? `[${n.arraySize}]` : ''}`; case 'Assign': return `${n.target} = ${n.expression}`; case 'Input': return `Input ${n.target}`; case 'Output': return `Output ${n.expression}`; case 'If': return n.condition; case 'While': return n.condition; case 'Do': return `Hacer… mientras ${n.condition}`; case 'For': return `${n.variable} = ${n.start} … ${n.end}`; case 'Call': return `${n.functionName}(…)`; case 'Return': return n.expression ? `Retornar ${n.expression}` : 'Retornar'; case 'Comment': return n.text; } }
function shape(node: FlowNode): string { if (node.type === 'Start' || node.type === 'End') return 'pill'; if (node.type === 'If') return 'diamond'; if (node.type === 'Input') return 'io io-input'; if (node.type === 'Output') return 'io io-output'; if (node.type === 'Declare') return 'declare'; if (node.type === 'Assign') return 'assign'; if (node.type === 'While' || node.type === 'Do' || node.type === 'For') return 'loop'; if (node.type === 'Comment') return 'comment'; return 'rect'; }
function pointerEvent(e: React.PointerEvent<SVGElement>): PointerInput {
  const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget.tagName.toLowerCase() === 'svg' ? e.currentTarget as unknown as SVGSVGElement : null);
  let x = e.clientX; let y = e.clientY;
  if (svg) { const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY; const matrix = svg.getScreenCTM(); if (matrix) { const local = point.matrixTransform(matrix.inverse()); x = local.x; y = local.y; } }
  return { pointerId: e.pointerId, pointerType: e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse', button: e.button, x, y, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey };
}
export function FlowchartCanvas({ func, selectedIds, activeNodeId, nextNodeId, activeDecision, onSelect, onMove, onDropPalette, onInsertAt, pendingType, orientation, zoom = 1, guidedNodeId }: { func: FlowFunction; selectedIds: ReadonlySet<NodeId>; activeNodeId?: NodeId; nextNodeId?: NodeId; activeDecision?: { readonly nodeId: NodeId; readonly passed: boolean; readonly phase?: 'entry'|'check' }; onSelect: (id: NodeId, multi: boolean) => void; onMove: (id: NodeId, anchor: NodeId, position: import('../domain/structural').InsertPosition) => void; onDropPalette?: (type: FlowNode['type'], anchor: NodeId, position?: InsertPosition) => void; onInsertAt?: (anchor: NodeId, position: InsertPosition) => void; pendingType?: FlowNode['type'] | null; orientation: LayoutOptions['orientation']; zoom?: number; guidedNodeId?: NodeId }): React.ReactElement {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const layout = useMemo(() => engine.calculate(func, { ...DEFAULT_LAYOUT, orientation }), [func, orientation]); const nodes = useMemo(() => projectNodes(func, layout), [func, layout]);
  useEffect(() => {
    const viewport=viewportRef.current, next=activeNodeId && layout.nodes[activeNodeId];
    if(!viewport || !next)return;
    const centerX=(next.x+next.width/2)*zoom;
    const centerY=(next.y+next.height/2)*zoom;
    if(centerX<viewport.scrollLeft+32 || centerX>viewport.scrollLeft+viewport.clientWidth-32)
      viewport.scrollLeft=Math.max(0,centerX-viewport.clientWidth/2);
    if(centerY<viewport.scrollTop+24 || centerY>viewport.scrollTop+viewport.clientHeight-24)
      viewport.scrollTop=Math.max(0,centerY-viewport.clientHeight/2);
  },[activeNodeId,layout,zoom]);
  const [drag, setDrag] = useState<{ id: NodeId; originX: number; originY: number; dx: number; dy: number } | null>(null);
  const controller = useMemo(() => new InteractionController(intent => { if (intent.type === 'SELECT') onSelect(intent.nodeId, intent.multi); if (intent.type === 'DESELECT') onSelect('' as NodeId, false); if (intent.type === 'START_DRAG') setDrag({ id: intent.nodeId, originX: intent.x, originY: intent.y, dx: 0, dy: 0 }); if (intent.type === 'UPDATE_DRAG') setDrag(old => old && old.id === intent.nodeId ? { ...old, dx: intent.x - old.originX, dy: intent.y - old.originY } : old); if (intent.type === 'END_DRAG') { const target = resolveDropTarget(func, layout, intent.nodeId, intent.x, intent.y); if (target) onMove(intent.nodeId, target.anchorId, target.position); setDrag(null); } }), [func, layout, onMove, onSelect]);
  const pointerHandlers = (id: NodeId) => ({ onPointerDown: (e: React.PointerEvent<SVGElement>) => { e.currentTarget.setPointerCapture?.(e.pointerId); controller.pointerDownNode(id, pointerEvent(e)); }, onPointerMove: (e: React.PointerEvent<SVGElement>) => controller.pointerMove(id, pointerEvent(e)), onPointerUp: (e: React.PointerEvent<SVGElement>) => controller.pointerUp(id, pointerEvent(e)), onPointerCancel: (e: React.PointerEvent<SVGElement>) => controller.pointerCancel(e.pointerId), onContextMenu: (e: React.MouseEvent<SVGElement>) => e.preventDefault() });
  const poly = (from: NodeId, to: NodeId, kind: string) => {
    const a = layout.nodes[from], b = layout.nodes[to]; if (!a || !b) return '';
    if (layout.orientation === 'Horizontal') {
      const x1 = a.x + a.width / 2, y1 = a.y + a.height, x2 = b.x + b.width / 2, y2 = b.y;
      if (kind === 'true' || kind === 'false' || kind === 'body') return `M ${x1} ${a.y + a.height / 2} C ${x1} ${y1 + 10}, ${x2} ${y2 - 10}, ${x2} ${y2}`;
      const sx = a.x + a.width, sy = a.y + a.height / 2, ex = b.x, ey = b.y + b.height / 2, midX = (sx + ex) / 2;
      return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ey}, ${ex} ${ey}`;
    }
    if (kind === 'true' || kind === 'false' || kind === 'body') { const startX = a.x + a.width; const startY = a.y + a.height / 2; const endX = b.x; const endY = b.y + b.height / 2; const midX = (startX + endX) / 2; return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`; }
    const x1 = a.x + a.width / 2, y1 = a.y + a.height, x2 = b.x + b.width / 2, y2 = b.y; const midY = (y1 + y2) / 2; return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };
  return <div ref={viewportRef} className="canvas-viewport" onKeyDown={e => controller.keyDown(e.key, e)} onDragOver={e => { if(e.dataTransfer.types.includes('application/x-flow-node')) e.preventDefault(); }} onDrop={e => { const type=e.dataTransfer.getData('application/x-flow-node') as FlowNode['type']; if(!type) return; e.preventDefault(); const element = e.target as Element; const target=element.closest('[data-flow-node]'); const id=target?.getAttribute('data-flow-node') as NodeId | null; const specific=element.closest('[data-insert-position]')?.getAttribute('data-insert-position') as InsertPosition | null; if(id && func.nodes[id]) onDropPalette?.(type,id,specific??(func.nodes[id].type==='End'?'Before':'After'));  }} tabIndex={0} aria-label="Canvas estructural del diagrama"><svg className="flow-canvas" style={{ zoom }} width={layout.width + 150} height={layout.height + 100} viewBox={`0 0 ${layout.width + 150} ${layout.height + 100}`} role="application" aria-label="Diagrama de flujo interactivo"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#71829c" /></marker></defs>
    {layout.edges.map(edge => <g key={edge.id}><path d={edge.path ?? poly(edge.from,edge.to,edge.kind)} className={`edge edge-${edge.kind} ${activeDecision?.nodeId===edge.from && ((activeDecision.passed && (edge.kind==='true'||edge.kind==='body'))||(!activeDecision.passed && (edge.kind==='false'||((edge.id.endsWith(':exit')||edge.id.endsWith(':next-tail'))&&edge.kind==='next'))))?'v7-executed-edge':''} ${edge.kind==='return'&&edge.from===activeNodeId&&edge.to===nextNodeId?'v7-return-edge':''}`}  markerEnd={edge.kind==='merge'?'':"url(#arrow)"} />{edge.label && <text className={`edge-label edge-label-${edge.kind}`} x={edge.labelX} y={edge.labelY}>{edge.label}</text>}</g>)}
    {nodes.map(item => { const p = item; const x = p.x + (drag?.id === p.id ? drag.dx : 0), y = p.y + (drag?.id === p.id ? drag.dy : 0); const selected = selectedIds.has(p.id); const active = activeNodeId === p.id; const upcoming = nextNodeId === p.id && !active; const guided = guidedNodeId === p.id; const shp = shape(p.node); const common = { className: `node-shape ${shp} ${selected ? 'selected' : ''} ${active ? 'execution-current' : ''} ${upcoming ? 'v7-next-node' : ''} ${guided ? 'learning-target' : ''} ${drag?.id === p.id ? 'dragging' : ''}` };
      return <g key={p.id} id={`flow-node-${p.id}`} data-flow-node={p.id} transform={`translate(${x} ${y})`} {...pointerHandlers(p.id)} role="button" aria-label={`${TYPE_LABELS[p.node.type]}: ${nodeText(p.node)}${active ? ' · último bloque ejecutado' : upcoming ? ' · se ejecutará a continuación' : ''}`} aria-current={active ? 'step' : undefined} tabIndex={0} onClick={e => { if (e.detail !== 0) onSelect(p.id, false); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id, e.shiftKey || e.ctrlKey || e.metaKey); } if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) { const index = nodes.findIndex(n => n.id === p.id); const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1; const target = nodes[(index + delta + nodes.length) % nodes.length]; if (target) { e.preventDefault(); onSelect(target.id, false); requestAnimationFrame(() => document.getElementById(`flow-node-${target.id}`)?.focus()); } } }}>
        {shp === 'diamond' ? <polygon {...common} points={`${p.width/2},0 ${p.width},${p.height/2} ${p.width/2},${p.height} 0,${p.height/2}`} /> : shp === 'pill' ? <rect {...common} x="0" y="0" width={p.width} height={p.height} rx={p.height/2} /> : shp.startsWith('io') ? <polygon {...common} points={`20,0 ${p.width},0 ${p.width-20},${p.height} 0,${p.height}`} /> : <rect {...common} x="0" y="0" width={p.width} height={p.height} rx="0" />}
        {p.node.type==='Declare'&&<g className="v12-declare-divider" aria-hidden="true"><path d={`M ${p.width*.10} 0 V ${p.height} M 0 ${p.height*.24} H ${p.width}`} /></g>}
        <text className="node-type" x={p.width/2} y={p.height/2 - 5}>{TYPE_LABELS[p.node.type]}</text><text className="node-label" x={p.width/2} y={p.height/2 + 13}>{nodeText(p.node).slice(0, 27)}</text>
        {pendingType && selected && insertionTargets(p.node).map((position, index) => {
          const label = position === 'InsideTrue' ? '+ Sí' : position === 'InsideFalse' ? '+ No' : position === 'InsideBody' ? '+ Cuerpo' : position === 'Before' ? '+ Antes' : '+ Después';
          const width = position === 'InsideBody' ? 88 : 74;
          const x = position === 'InsideTrue' || position === 'InsideBody' ? p.width+8 : position === 'InsideFalse' ? -80 : p.width / 2-width/2;
          const y = position === 'Before' ? -30 : position === 'After' ? p.height+6 : 7 + index * 3;
          return <g key={position} data-insert-position={position} className="svg-insert" transform={`translate(${x} ${y})`} role="button" aria-label={`Insertar ${TYPE_LABELS[pendingType]}: ${label}`} tabIndex={0}
            onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onInsertAt?.(p.id,position); }} onKeyDown={event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onInsertAt?.(p.id,position);}}}>
            <rect width={width} height="25" rx="11" /><text x={width/2} y="17">{label}</text>
          </g>;
        })}
      </g>;
    })}
  </svg></div>;
}