import { FlowNode } from '../domain/models';
import { LanguageId } from '../generators';
export function pedagogicalCode(node:FlowNode,lang:LanguageId):{code:string;meaning:string;note:string}{
 const py=lang==='python';const js=lang==='javascript';
 const tail=py?'':';';
 switch(node.type){
 case 'Start':return {code:py?'def main():':'int main() {',meaning:'Indica dónde comienza la ejecución.',note:'La forma exacta depende del lenguaje.'};
 case 'End':return {code:py?'# Fin del programa':'}',meaning:'Marca el final del diagrama.',note:'No es una instrucción idéntica en todos los lenguajes.'};
 case 'Declare':{ if(node.name.includes(',')){
    const names=node.name.split(',').map(name=>name.trim()).filter(Boolean);
    const one=(name:string)=>py?`${name} = ${node.dataType==='String'?'""':node.dataType==='Boolean'?'False':'0'}`:js?`let ${name} = ${node.dataType==='String'?'""':node.dataType==='Boolean'?'false':'0'};`:`${node.dataType==='Integer'?'int':node.dataType==='Real'?'double':node.dataType==='Boolean'?'bool':'string'} ${name}${tail}`;
    return {code:names.map(one).join('\n'),meaning:`Declara ${names.length} variables del mismo tipo (${node.dataType}).`,note:'En Flowgorithm puedes separar nombres con comas dentro de Declare.'};
   }
 return {code:py?`${node.name} = ${node.arraySize?'[0] * '+node.arraySize:node.dataType==='String'?'""':node.dataType==='Boolean'?'False':'0'}`:js?`let ${node.name} = ${node.arraySize?`Array(${node.arraySize}).fill(0)`:'0'};`:`${node.dataType==='Integer'?'int':node.dataType==='Real'?'double':node.dataType==='Boolean'?'bool':'string'} ${node.name}${node.arraySize?`[${node.arraySize}]`:''}${tail}`,meaning:node.arraySize?'Reserva varias casillas con índices.':'Crea una variable que guarda un único valor.',note:'Los arreglos usan índices desde 0.'}; }
 case 'Assign':return {code:`${node.target} = ${node.expression}${tail}`,meaning:'Calcula primero la expresión y después guarda el resultado.',note:'Un solo = asigna. Comparar igualdad normalmente usa ==.'};
 case 'Input':return {code:py?`${node.target} = input()`:`${node.target} = leerDato()${tail}`,meaning:'Pide un dato al usuario y lo guarda.',note:py?'Python requiere convertir a int/float si necesitas números.':'leerDato() es pseudocódigo; consulta Código generado para la implementación completa.'};
 case 'Output':return {code:py?`print(${node.expression})`:js?`console.log(${node.expression});`:`print(${node.expression})`,meaning:'Muestra el resultado de una expresión.',note:py?'print muestra texto o números.':'Es un ejemplo didáctico, no siempre la sintaxis exacta del lenguaje.'};
 case 'If':return {code:py?`if ${node.condition}:\n    # Rama Sí\nelse:\n    # Rama No`:`if (${node.condition}) {\n  // Sí\n} else {\n  // No\n}`,meaning:'Evalúa una condición y elige una rama.',note:'Si no repite: Mientras, Hacer y Para sí son ciclos.'};
 case 'While':return {code:py?`while ${node.condition}:\n    # Repetir`:`while (${node.condition}) {\n  // Repetir\n}`,meaning:'Comprueba antes de cada vuelta si debe repetir.',note:'La condición debe poder cambiar para evitar ciclos infinitos.'};
 case 'Do':return {code:py?`# Ejecutar el cuerpo al menos una vez\nwhile condicion:\n    pass`:`do {\n  // cuerpo\n} while (${node.condition});`,meaning:'Ejecuta al menos una vez antes de comprobar.',note:'En Python no existe do-while nativo; el ejemplo es conceptual.'};
 case 'For':return {code:py?`for ${node.variable} in range(${node.start}, (${node.end}) + 1, ${node.step}):\n    pass`:`for (${node.variable}=${node.start}; ${node.variable}<=${node.end}; ${node.variable}+=${node.step}) {}`,meaning:'Avanza un contador entre límites.',note:'La dirección descendente requiere cambiar el comparador y el paso; consulta el generador.'};
 case 'Call':return {code:`${node.target?node.target+' = ':''}${node.functionName}(${node.args.join(', ')})${tail}`,meaning:'Invoca una función para reutilizar un algoritmo.',note:'Asegúrate de definir la función antes de llamarla.'};
 case 'Return':return {code:`return ${node.expression??''}${tail}`,meaning:'Entrega el resultado de la función al llamador.',note:'La función termina cuando ejecuta Retornar.'};
 case 'Comment':return {code:`${py?'#':'//'} ${node.text}`,meaning:'Documenta lo que hace el algoritmo.',note:'Un comentario no altera los valores.'};
 }
}
