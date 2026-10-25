import { FlowFunction, FlowNode, NodeId } from './models';

export type StructuralPointer = 'next' | 'trueNext' | 'falseNext' | 'bodyNext';
export type InsertPosition = 'Before' | 'After' | 'InsideTrue' | 'InsideFalse' | 'InsideBody';
export interface ParentReference { readonly parentId: NodeId; readonly pointer: StructuralPointer }

export function parentOf(func: FlowFunction, target: NodeId): ParentReference | null {
  for (const n of Object.values(func.nodes)) {
    if (n.next === target) return { parentId: n.id, pointer: 'next' };
    if (n.type === 'If' && n.trueNext === target) return { parentId: n.id, pointer: 'trueNext' };
    if (n.type === 'If' && n.falseNext === target) return { parentId: n.id, pointer: 'falseNext' };
    if ((n.type === 'While' || n.type === 'Do' || n.type === 'For') && n.bodyNext === target) return { parentId: n.id, pointer: 'bodyNext' };
  }
  return null;
}

export function childrenOf(node: FlowNode): NodeId[] {
  const out: NodeId[] = [];
  if (node.next) out.push(node.next);
  if (node.type === 'If') { if (node.trueNext) out.push(node.trueNext); if (node.falseNext) out.push(node.falseNext); }
  if ((node.type === 'While' || node.type === 'Do' || node.type === 'For') && node.bodyNext) out.push(node.bodyNext);
  return out;
}

function setPointer(node: FlowNode, pointer: StructuralPointer, value: NodeId | undefined): FlowNode {
  switch (pointer) {
    case 'next': return { ...node, next: value } as FlowNode;
    case 'trueNext': if (node.type !== 'If') throw new Error('La rama verdadera solo pertenece a Si.'); return { ...node, trueNext: value };
    case 'falseNext': if (node.type !== 'If') throw new Error('La rama falsa solo pertenece a Si.'); return { ...node, falseNext: value };
    case 'bodyNext': if (node.type !== 'While' && node.type !== 'Do' && node.type !== 'For') throw new Error('El cuerpo solo pertenece a un ciclo.'); return { ...node, bodyNext: value };
  }
}

/** Desconecta un bloque individual y cierra la secuencia por su sucesor. Devuelve una nueva función. */
export function detachNode(func: FlowFunction, id: NodeId): FlowFunction {
  if (id === func.rootNodeId || func.nodes[id]?.type === 'Start') throw new Error('No se puede mover el bloque Inicio.');
  const node = func.nodes[id];
  if (!node) throw new Error(`No existe el bloque ${id}.`);
  if (node.type === 'End') throw new Error('No se puede mover el bloque Fin.');
  const parent = parentOf(func, id);
  if (!parent) throw new Error('El bloque no tiene un padre estructural.');
  const nodes: Record<string, FlowNode> = { ...func.nodes };
  nodes[parent.parentId] = setPointer(nodes[parent.parentId], parent.pointer, node.next);
  nodes[id] = { ...node, next: undefined } as FlowNode;
  return { ...func, nodes };
}

export function insertNode(func: FlowFunction, node: FlowNode, anchorId: NodeId, position: InsertPosition): FlowFunction {
  const anchor = func.nodes[anchorId];
  if (!anchor) throw new Error('No se encontró el bloque de referencia.');
  if (func.nodes[node.id]) throw new Error(`Ya existe un bloque con ID ${node.id}.`);
  if (node.type === 'Start' || node.type === 'End') throw new Error('Inicio y Fin no se insertan desde la paleta.');
  const nodes: Record<string, FlowNode> = { ...func.nodes, [node.id]: node };
  if (position === 'Before') {
    if (anchor.type === 'Start' || anchorId === func.rootNodeId) throw new Error('No se puede insertar antes de Inicio.');
    const parent = parentOf(func, anchorId);
    if (!parent) throw new Error('El bloque de referencia no tiene padre.');
    nodes[node.id] = { ...node, next: anchorId } as FlowNode;
    nodes[parent.parentId] = setPointer(nodes[parent.parentId], parent.pointer, node.id);
  } else if (position === 'After') {
    if (anchor.type === 'End') throw new Error('No se puede insertar después de Fin.');
    nodes[node.id] = { ...node, next: anchor.next } as FlowNode;
    nodes[anchorId] = { ...anchor, next: node.id } as FlowNode;
  } else if (position === 'InsideTrue' || position === 'InsideFalse') {
    if (anchor.type !== 'If') throw new Error('Selecciona un bloque Si para insertar en una rama.');
    const pointer: StructuralPointer = position === 'InsideTrue' ? 'trueNext' : 'falseNext';
    const prev = position === 'InsideTrue' ? anchor.trueNext : anchor.falseNext;
    nodes[node.id] = { ...node, next: prev } as FlowNode;
    nodes[anchorId] = setPointer(anchor, pointer, node.id);
  } else {
    if (anchor.type !== 'While' && anchor.type !== 'Do' && anchor.type !== 'For') throw new Error('Selecciona un ciclo para insertar en su cuerpo.');
    const prev = anchor.bodyNext;
    nodes[node.id] = { ...node, next: prev } as FlowNode;
    nodes[anchorId] = setPointer(anchor, 'bodyNext', node.id);
  }
  return { ...func, nodes };
}

export function isReachable(func: FlowFunction, from: NodeId, target: NodeId): boolean {
  const pending: NodeId[] = [from]; const seen = new Set<NodeId>();
  while (pending.length) { const id = pending.pop()!; if (id === target) return true; if (seen.has(id)) continue; seen.add(id); const n = func.nodes[id]; if (n) pending.push(...childrenOf(n)); }
  return false;
}

/** Returns whether target belongs to the nested branch/body subtree of root, excluding root.next siblings. */
function isNestedDescendant(func: FlowFunction, rootId: NodeId, targetId: NodeId): boolean {
  const root = func.nodes[rootId]; if (!root) return false;
  const nestedRoots: NodeId[] = [];
  if (root.type === 'If') { if (root.trueNext) nestedRoots.push(root.trueNext); if (root.falseNext) nestedRoots.push(root.falseNext); }
  if ((root.type === 'While' || root.type === 'Do' || root.type === 'For') && root.bodyNext) nestedRoots.push(root.bodyNext);
  const visited = new Set<NodeId>(); const pending = [...nestedRoots];
  while (pending.length) { const id = pending.pop()!; if (id === targetId) return true; if (visited.has(id)) continue; visited.add(id); const child = func.nodes[id]; if (child) pending.push(...childrenOf(child)); }
  return false;
}

export function moveNode(func: FlowFunction, targetId: NodeId, anchorId: NodeId, position: InsertPosition): FlowFunction {
  if (targetId === anchorId || isNestedDescendant(func, targetId, anchorId)) throw new Error('El movimiento crearía un ciclo estructural.');
  const target = func.nodes[targetId];
  if (!target || target.type === 'Start' || target.type === 'End') throw new Error('Este bloque no puede moverse.');
  const detached = detachNode(func, targetId);
  const node = detached.nodes[targetId];
  const nodes = { ...detached.nodes }; delete nodes[targetId];
  return insertNode({ ...detached, nodes }, node, anchorId, position);
}

export function deleteNode(func: FlowFunction, id: NodeId): FlowFunction {
  const node = func.nodes[id];
  if (!node || node.type === 'Start' || node.type === 'End' || id === func.rootNodeId) throw new Error('Este bloque no puede eliminarse.');
  const parent = parentOf(func, id);
  if (!parent) throw new Error('El bloque no tiene padre estructural.');
  const nodes: Record<string, FlowNode> = { ...func.nodes };
  nodes[parent.parentId] = setPointer(nodes[parent.parentId], parent.pointer, node.next);
  delete nodes[id];
  // Elimina los descendientes exclusivos de sus ramas/cuerpo; conserva el sucesor secuencial.
  const roots: NodeId[] = [];
  if (node.type === 'If') { if (node.trueNext) roots.push(node.trueNext); if (node.falseNext) roots.push(node.falseNext); }
  if ((node.type === 'While' || node.type === 'Do' || node.type === 'For') && node.bodyNext) roots.push(node.bodyNext);
  const toDelete = new Set<NodeId>();
  const visitBranch = (childId: NodeId) => { if (toDelete.has(childId)) return; toDelete.add(childId); const child = nodes[childId]; if (!child) return; if (child.next) visitBranch(child.next); if (child.type === 'If') { if (child.trueNext) visitBranch(child.trueNext); if (child.falseNext) visitBranch(child.falseNext); } if ((child.type === 'While' || child.type === 'Do' || child.type === 'For') && child.bodyNext) visitBranch(child.bodyNext); };
  roots.forEach(visitBranch);
  // Remove a branch node only if its parent is in the deletion set or is the deleted node.
  for (const childId of toDelete) { const p = parentOf({ ...func, nodes }, childId); if (p && p.parentId !== id && !toDelete.has(p.parentId)) continue; delete nodes[childId]; }
  return { ...func, nodes };
}

export function replaceNode(func: FlowFunction, updated: FlowNode): FlowFunction {
  const old = func.nodes[updated.id];
  if (!old) throw new Error('El bloque a editar ya no existe.');
  if (old.type !== updated.type) throw new Error('No se puede cambiar el tipo semántico de un bloque desde el inspector.');
  return { ...func, nodes: { ...func.nodes, [updated.id]: updated } };
}

export interface ValidationResult { readonly valid: boolean; readonly errors: readonly string[]; }
export function validateProject(project: import('./models').FlowProject): ValidationResult {
  const errors: string[] = [];
  if (!project || !project.functions || typeof project.functions !== 'object') {
    return { valid: false, errors: ['El proyecto no contiene un mapa de funciones válido.'] };
  }
  if (!project.functions[project.mainFunctionId]) errors.push('La función principal no existe.');
  for (const [functionKey, func] of Object.entries(project.functions)) {
    if (!func || !func.nodes || typeof func.nodes !== 'object') {
      errors.push(`${functionKey}: no contiene un mapa de bloques válido.`);
      continue;
    }
    const root = func.nodes[func.rootNodeId];
    if (!root || root.type !== 'Start') errors.push(`${func.name}: rootNodeId debe apuntar a Inicio.`);
    const starts = Object.values(func.nodes).filter(node => node.type === 'Start');
    if (starts.length !== 1) errors.push(`${func.name}: debe existir exactamente un bloque Inicio (hay ${starts.length}).`);
    if (root && root.type === 'Start' && starts[0]?.id !== root.id) errors.push(`${func.name}: Inicio debe ser el bloque raíz.`);
    for (const node of Object.values(func.nodes)) {
      if (node.type === 'End' && node.next) errors.push(`${func.name}: el bloque Fin ${node.id} no puede tener un bloque siguiente.`);
    }
    const colors = new Map<NodeId, 0 | 1 | 2>();
    const visited = new Set<NodeId>();
    const parentCounts = new Map<NodeId, number>();
    for (const node of Object.values(func.nodes)) {
      for (const child of childrenOf(node)) parentCounts.set(child, (parentCounts.get(child) ?? 0) + 1);
    }
    for (const [id, count] of parentCounts) if (count > 1) errors.push(`${func.name}: ${id} tiene ${count} padres.`);
    const visit = (id: NodeId) => {
      const color = colors.get(id) ?? 0;
      if (color === 1) { errors.push(`${func.name}: ciclo detectado en ${id}.`); return; }
      if (color === 2) return;
      const node = func.nodes[id];
      if (!node) { errors.push(`${func.name}: referencia inexistente ${id}.`); return; }
      colors.set(id, 1); visited.add(id);
      for (const child of childrenOf(node)) visit(child);
      colors.set(id, 2);
    };
    if (root) visit(func.rootNodeId);
    if (visited.size !== Object.keys(func.nodes).length) errors.push(`${func.name}: existen bloques huérfanos o inalcanzables.`);
  }
  return { valid: errors.length === 0, errors };
}
