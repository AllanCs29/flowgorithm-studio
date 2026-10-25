export type CTypeName = 'Integer' | 'Real' | 'String' | 'Boolean' | 'Void';
export function cType(type: string): string {
  switch (type) { case 'Real': return 'double'; case 'String': return 'char *'; case 'Boolean': return 'bool'; case 'Void': return 'void'; default: return 'int'; }
}
