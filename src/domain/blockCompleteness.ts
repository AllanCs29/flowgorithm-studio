import { FlowFunction, FlowNode, TYPE_LABELS } from './models';

/** El editor no debe inventar respuestas por el estudiante. */
export type RequiredField = { readonly key: string; readonly label: string };
export function missingFields(node: FlowNode): RequiredField[] {
  const required: RequiredField[] = [];
  const need = (key: string, label: string, value: string | undefined) => {
    if (!value?.trim()) required.push({ key, label });
  };
  switch (node.type) {
    case 'Declare': need('name', 'nombre de la variable', node.name); break;
    case 'Assign': need('target', 'variable destino', node.target); need('expression', 'expresión o valor', node.expression); break;
    case 'Input': need('target', 'variable donde guardar la entrada', node.target); break;
    case 'Output': need('expression', 'texto o valor que se mostrará', node.expression); break;
    case 'If': case 'While': case 'Do': need('condition', 'condición', node.condition); break;
    case 'For':
      need('variable', 'contador', node.variable);
      need('start', 'valor inicial', node.start);
      need('end', 'valor final', node.end);
      need('step', 'incremento', node.step);
      break;
    case 'Call': need('functionName', 'nombre de la función', node.functionName); break;
    // Retornar sin valor se permite en funciones que no devuelven un dato.
    case 'Start': case 'End': case 'Return': case 'Comment': break;
  }
  return required;
}
export function firstIncompleteNode(func: FlowFunction): { node: FlowNode; field: RequiredField } | null {
  for (const node of Object.values(func.nodes)) {
    const [field] = node.type === 'Return' && func.returnType && !node.expression?.trim()
      ? [{ key: 'expression', label: 'valor que debe retornar la función' }]
      : missingFields(node);
    if (field) return { node, field };
  }
  return null;
}
export function incompleteMessage(node: FlowNode, field: RequiredField): string {
  return `Antes de ejecutar, completa ${TYPE_LABELS[node.type]}: falta ${field.label}. Toca el bloque marcado para editarlo.`;
}
