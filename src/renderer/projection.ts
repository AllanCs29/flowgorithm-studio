import { FlowFunction, FlowNode, NodeId, TYPE_LABELS } from '../domain/models';
import { LayoutMap } from '../layout/layoutEngine';
export interface ProjectedNode { readonly id: NodeId; readonly node: FlowNode; readonly label: string; readonly x: number; readonly y: number; readonly width: number; readonly height: number; }
export function projectNodes(func: FlowFunction, layout: LayoutMap): ProjectedNode[] {
  return Object.values(func.nodes).flatMap(node => { const p = layout.nodes[node.id]; if (!p) return []; return [{ id: node.id, node, label: TYPE_LABELS[node.type], ...p }]; });
}