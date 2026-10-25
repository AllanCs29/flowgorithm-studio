import { FlowFunction, FlowNode, FlowProject, PrimitiveType, functionId, nodeId, projectId } from '../../domain/models';
import { CompatibilityError } from '../../generators/errors';
const supported = new Set(['start', 'end', 'declare', 'assign', 'input', 'output', 'if', 'while', 'dowhile', 'for', 'comment', 'return']);
const str = (el: Element, name: string, fallback = '') => el.getAttribute(name) ?? fallback;
function mapNode(el: Element, id: string): FlowNode {
  const type = el.tagName.toLowerCase(); const nid = nodeId(id);
  if (!supported.has(type)) throw new CompatibilityError(`El bloque <${type}> todavía no está implementado por el importador.`, type);
  switch (type) {
    case 'start': return { id: nid, type: 'Start' };
    case 'end': return { id: nid, type: 'End' };
    case 'declare': { const rawType = str(el, 'type', 'Integer'); if (!['Integer', 'Real', 'String', 'Boolean'].includes(rawType)) throw new CompatibilityError(`Tipo de dato de Flowgorithm no soportado: ${rawType}.`, 'data-type'); const rawArray = str(el, 'array', ''); const rawSize = str(el, 'size', ''); const arraySize = rawArray.toLowerCase() === 'false' ? undefined : rawArray.toLowerCase() === 'true' ? (rawSize || '0') : (rawArray || undefined); if (arraySize && arraySize.includes(',')) throw new CompatibilityError('Este proyecto solo admite arreglos unidimensionales; el arreglo importado parece multidimensional.', 'array-dimension'); return { id: nid, type: 'Declare', name: str(el, 'name', 'variable'), dataType: rawType as PrimitiveType, arraySize }; }
    case 'assign': return { id: nid, type: 'Assign', target: str(el, 'variable', 'variable'), expression: str(el, 'expression', '0') };
    case 'input': return { id: nid, type: 'Input', target: str(el, 'variable', 'variable') };
    case 'output': return { id: nid, type: 'Output', expression: str(el, 'expression', '""'), newLine: str(el, 'newline', 'True').toLowerCase() !== 'false' };
    case 'if': return { id: nid, type: 'If', condition: str(el, 'expression', 'false') };
    case 'while': return { id: nid, type: 'While', condition: str(el, 'expression', 'false') };
    case 'dowhile': return { id: nid, type: 'Do', condition: str(el, 'expression', 'false') };
    case 'for': { const directionValue = str(el, 'direction', 'Inc'); const direction = directionValue.toLowerCase() === 'inc' ? 'Inc' : directionValue.toLowerCase() === 'dec' ? 'Dec' : directionValue; if (direction !== 'Inc' && direction !== 'Dec') throw new CompatibilityError(`Dirección del ciclo Para no reconocida: ${direction}.`, 'for-direction'); return { id: nid, type: 'For', variable: str(el, 'variable', 'i'), start: str(el, 'start', '0'), end: str(el, 'end', '10'), step: str(el, 'step', '1'), direction }; }
    case 'comment': return { id: nid, type: 'Comment', text: str(el, 'text', '') };
    case 'return': return { id: nid, type: 'Return', expression: str(el, 'expression', '') || undefined };
    default: throw new CompatibilityError(`Bloque no soportado: ${type}`, type);
  }
}
function nested(el: Element, tag: string): Element | undefined { return Array.from(el.children).find(c => c.tagName.toLowerCase() === tag); }
function readSequence(parent: Element, nodes: Record<string, FlowNode>, counter: { value: number }): string | undefined {
  let first: string | undefined; let previous: string | undefined;
  for (const el of Array.from(parent.children)) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'parameters' || tag === 'attributes' || tag === 'attribute') continue;
    if (!supported.has(tag)) throw new CompatibilityError(`El bloque <${tag}> todavía no está implementado por el importador.`, tag);
    let id = str(el, 'id', `xml_${counter.value++}`);
    while (nodes[id]) id = `xml_${counter.value++}`;
    let node = mapNode(el, id);
    // Nested structured regions are parsed independently, preserving their first node as the branch/body pointer.
    if (node.type === 'If') {
      const thenEl = nested(el, 'then'); const elseEl = nested(el, 'else');
      const trueNext = thenEl ? readSequence(thenEl, nodes, counter) : undefined;
      const falseNext = elseEl ? readSequence(elseEl, nodes, counter) : undefined;
      node = { ...node, trueNext: trueNext ? nodeId(trueNext) : undefined, falseNext: falseNext ? nodeId(falseNext) : undefined };
    } else if (node.type === 'While' || node.type === 'Do' || node.type === 'For') {
      const bodyEl = nested(el, 'body'); const bodyNext = bodyEl ? readSequence(bodyEl, nodes, counter) : undefined;
      node = { ...node, bodyNext: bodyNext ? nodeId(bodyNext) : undefined } as FlowNode;
    }
    nodes[id] = node;
    if (!first) first = id;
    if (previous) nodes[previous] = { ...nodes[previous], next: nodeId(id) } as FlowNode;
    previous = id;
  }
  return first;
}
/** Supports the common Flowgorithm sequence/control blocks; unsupported XML tags fail explicitly. */
export function importFprg(xml: string): FlowProject {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new CompatibilityError('XML .fprg inválido.', 'xml-parser');
  const funcs = Array.from(doc.getElementsByTagName('function'));
  if (!funcs.length) throw new CompatibilityError('No se encontró ninguna función <function>.', 'function');
  const functions: Record<string, FlowFunction> = {}; const counter = { value: 1 };
  for (const el of funcs) {
    const name = str(el, 'name', 'Main'); const id = name === 'Main' ? 'main' : `fn_${name}`;
    const body = nested(el, 'body'); if (!body) throw new CompatibilityError(`La función ${name} no tiene <body>.`, 'function-body');
    const nodes: Record<string, FlowNode> = {}; const first = readSequence(body, nodes, counter);
    if (!first) throw new CompatibilityError(`La función ${name} está vacía.`, 'empty-function');
    let rootId = first;
    if (nodes[first].type !== 'Start') {
      rootId = `synthetic_start_${counter.value++}`;
      nodes[rootId] = { id: nodeId(rootId), type: 'Start', next: nodeId(first) };
    }
    if (nodes[rootId].type !== 'Start') throw new CompatibilityError(`La función ${name} no inicia con Start.`, 'function-root');
    // En un .fprg nativo, los óvalos Main y End son implícitos: el XML
    // normalmente solo guarda los bloques dentro de <body>.
    if (!Object.values(nodes).some(node => node.type === 'End')) {
      const endId = `synthetic_end_${counter.value++}`;
      nodes[endId] = { id: nodeId(endId), type: 'End' };
      let tail = rootId;
      const visited = new Set<string>();
      while (nodes[tail].next && !visited.has(tail)) {
        visited.add(tail);
        tail = nodes[tail].next!;
      }
      nodes[tail] = { ...nodes[tail], next: nodeId(endId) } as FlowNode;
    }
    functions[id] = { id: functionId(id), name, parameters: [], nodes, rootNodeId: nodeId(rootId) };
  }
  const main = functions.main ?? Object.values(functions)[0];
  return { id: projectId('imported'), metadata: { title: 'Proyecto importado', author: '', version: '1.0' }, functions, mainFunctionId: main.id };
}
function esc(value: string): string { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function emitNode(func: FlowFunction, nodeIdValue: string, seen: Set<string>): string {
  if (seen.has(nodeIdValue)) throw new CompatibilityError('El diagrama contiene un ciclo o una unión que no puede representarse en este subconjunto XML.', 'graph-shape'); seen.add(nodeIdValue);
  const n = func.nodes[nodeIdValue]; if (!n) throw new CompatibilityError(`Referencia inexistente ${nodeIdValue}.`, 'dangling-reference');
  const attrs = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
  const seq = (id?: string) => id ? emitNode(func, id, seen) : '';
  let xml = '';
  switch (n.type) {
    case 'Start': xml = '<start />'; break; case 'End': xml = '<end />'; break;
    case 'Declare': xml = `<declare ${attrs({ name: n.name, type: n.dataType, array: n.arraySize ? 'True' : 'False', size: n.arraySize ?? '' })} />`; break;
    case 'Assign': xml = `<assign ${attrs({ variable: n.target, expression: n.expression })} />`; break;
    case 'Input': xml = `<input ${attrs({ variable: n.target })} />`; break;
    case 'Output': xml = `<output ${attrs({ expression: n.expression, newline: n.newLine ? 'True' : 'False' })} />`; break;
    case 'If': { const branchSeen = new Set(seen); const trueXml = n.trueNext ? emitNode(func, n.trueNext, branchSeen) : ''; const falseXml = n.falseNext ? emitNode(func, n.falseNext, new Set(seen)) : ''; xml = `<if ${attrs({ expression: n.condition })}><then>${trueXml}</then><else>${falseXml}</else></if>`; break; }
    case 'While': case 'Do': case 'For': { const bodyId = n.bodyNext; const body = bodyId ? emitNode(func, bodyId, new Set(seen)) : ''; if (n.type === 'While') xml = `<while ${attrs({ expression: n.condition })}><body>${body}</body></while>`; else if (n.type === 'Do') xml = `<dowhile ${attrs({ expression: n.condition })}><body>${body}</body></dowhile>`; else xml = `<for ${attrs({ variable: n.variable, start: n.start, end: n.end, step: n.step, direction: n.direction })}><body>${body}</body></for>`; break; }
    case 'Comment': xml = `<comment ${attrs({ text: n.text })} />`; break; case 'Return': xml = `<return ${attrs(n.expression ? { expression: n.expression } : {})} />`; break;
    case 'Call': throw new CompatibilityError('Exportar llamadas aún no es compatible.', 'call');
  }
  return xml + seq(n.next);
}
export function exportFprg(project: FlowProject): string {
  const funcs = Object.values(project.functions).map(fn => { const body = emitNode(fn, fn.rootNodeId, new Set()); return `<function name="${esc(fn.name)}" type="None"><parameters /><body>${body}</body></function>`; }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<flowgorithm fileversion="4.2"><attributes><attribute name="name" value="${esc(project.metadata.title)}" /></attributes>${funcs}</flowgorithm>`;
}