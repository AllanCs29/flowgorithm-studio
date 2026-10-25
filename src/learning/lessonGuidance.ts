import { FlowFunction, FlowNode, NodeId } from '../domain/models';

const aliases: readonly {label:string;type:FlowNode['type']}[] = [
  {label:'inicio',type:'Start'}, {label:'salida',type:'Output'}, {label:'mostrar',type:'Output'},
  {label:'declarar',type:'Declare'}, {label:'asignar',type:'Assign'}, {label:'entrada',type:'Input'},
  {label:'leer',type:'Input'}, {label:'mientras',type:'While'}, {label:'hacer',type:'Do'},
  {label:'para',type:'For'}, {label:'comentario',type:'Comment'}, {label:'si',type:'If'}
];

/** Helpful highlight, not a substitute for the student's actual correctness check. */
export function guidedTarget(func:FlowFunction, instruction:string, selected?:NodeId):NodeId|undefined {
  const lower=instruction.toLocaleLowerCase('es');
  const targetPhrase=/(?:selecciona|haz clic en|toca|revisa|encuentra|pulsa el bloque)\s+(?:el\s+bloque\s+)?(?:la\s+)?(?:el\s+)?([a-záéíóúñ]+)/i.exec(lower);
  const wanted=targetPhrase?.[1];
  const ordered=wanted?[...aliases.filter(item=>item.label===wanted),...aliases.filter(item=>item.label!==wanted)]:aliases;
  // Un nombre de pieza citado en la instrucción es mejor que señalar un bloque arbitrario.
  for(const item of ordered){
    if ((wanted===item.label || new RegExp(`\\b${item.label}\\b`,'i').test(lower))){
      const node=Object.values(func.nodes).find(node=>node.type===item.type);
      if(node)return node.id;
    }
  }
  return selected;
}
