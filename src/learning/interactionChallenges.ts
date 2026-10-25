import { FlowFunction, FlowNode } from '../domain/models';
export type InteractionKind = 'select-order'|'open-editor'|'cancel-edit'|'insert-output'|'delete-output'|'step-and-reset';
export interface InteractionEvent { readonly action: 'select'|'edit'|'cancel'|'insert'|'delete'|'step'|'reset'; readonly type?: FlowNode['type']; readonly id?: string; }
export interface InteractionResult { readonly passed: boolean; readonly feedback: readonly string[] }
export function checkInteraction(kind: InteractionKind, func: FlowFunction, history: readonly InteractionEvent[]): InteractionResult {
  const feedback:string[]=[];
  const nodes=Object.values(func.nodes);
  const event=(action:InteractionEvent['action'],type?:FlowNode['type'])=>history.some(h=>h.action===action && (!type||h.type===type));
  const selected=history.filter(h=>h.action==='select');
  if(kind==='select-order') {
    const first=selected.findIndex(e=>e.type==='Start');
    if(first<0||!selected.slice(first+1).some(e=>e.type==='End'))feedback.push('Toca Inicio y después Fin en ese orden.');
  }
  if(kind==='open-editor' && !(event('select','Output') && event('edit','Output')))feedback.push('Selecciona Salida y abre su panel Editar.');
  if(kind==='cancel-edit') {
    if(!event('cancel','Output'))feedback.push('Modifica el texto de Salida y pulsa «Cancelar edición» sin aplicar cambios.');
    if(!nodes.some(n=>n.type==='Output'&&n.expression==='"Original"'))feedback.push('El mensaje original debe conservarse exactamente.');
  }
  if(kind==='insert-output') {
    const root=func.nodes[func.rootNodeId];
    const after=root?.next ? func.nodes[root.next]:undefined;
    if(!event('insert','Output')||after?.type!=='Output'||!after.next||func.nodes[after.next]?.type!=='End')feedback.push('Selecciona Inicio, inserta una Salida después de Inicio y conserva Fin al final.');
  }
  if(kind==='delete-output') {
    const root=func.nodes[func.rootNodeId];
    if(!event('delete','Output')||nodes.some(n=>n.type==='Output')||!root.next||func.nodes[root.next]?.type!=='End')feedback.push('Elimina la Salida usando «Eliminar este bloque». Inicio debe conectar directamente con Fin.');
  }
  if(kind==='step-and-reset') {
    const reset=history.findIndex(e=>e.action==='reset');
    const count=history.slice(0,reset<0?undefined:reset).filter(e=>e.action==='step').length;
    if(reset<0 || count!==1)feedback.push('Pulsa «Paso a paso» exactamente una vez y después «Reiniciar».');
  }
  return {passed:feedback.length===0,feedback};
}
