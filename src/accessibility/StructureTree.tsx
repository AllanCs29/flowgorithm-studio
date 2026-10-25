import React from 'react';
import { FlowFunction, FlowNode, NodeId, TYPE_LABELS } from '../domain/models';
import { childrenOf } from '../domain/structural';
export function StructureTree({ func, selectedId, onSelect }: { func: FlowFunction; selectedId?: NodeId; onSelect: (id: NodeId) => void }): React.ReactElement {
  const seen = new Set<NodeId>();
  const render = (id: NodeId, depth: number): React.ReactElement | null => {
    const node: FlowNode | undefined = func.nodes[id]; if (!node || seen.has(id)) return null; seen.add(id);
    return <li key={id} style={{ marginLeft: depth * 12 }}><button className={`tree-item ${selectedId === id ? 'selected' : ''}`} onClick={() => onSelect(id)} aria-current={selectedId === id ? 'true' : undefined}><span>{TYPE_LABELS[node.type]}</span><small>{node.type === 'Assign' ? `${node.target} ← ${node.expression}` : node.type === 'Output' ? node.expression : node.type === 'If' ? node.condition : node.type === 'Declare' ? node.name : node.type === 'Input' ? node.target : node.type === 'Comment' ? node.text : id}</small></button>{childrenOf(node).map(child => render(child, depth + 1))}</li>;
  };
  return <ul className="structure-tree" aria-label="Árbol estructural del diagrama">{render(func.rootNodeId, 0)}</ul>;
}