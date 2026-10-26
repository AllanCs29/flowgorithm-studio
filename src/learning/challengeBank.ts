import { FlowNode, FlowProject, PrimitiveType, TYPE_LABELS, nodeId, functionId, projectId } from '../domain/models';
import { Exercise, ExerciseTest } from './learning';
import rawCatalog from './catalog.json';
import type { InteractionKind } from './interactionChallenges';

/** The complete 100-item syllabus. Items without tested programs are intentionally marked planned. */
export interface CatalogItem {
  readonly number: number;
  readonly world: number;
  readonly worldName: string;
  readonly title: string;
  readonly description: string;
  readonly check: string;
}
export const catalog = rawCatalog as readonly CatalogItem[];
export interface PracticeChallenge {
  readonly number: number;
  readonly exercise: Exercise;
  readonly solution: FlowProject;
  readonly example: string;
  readonly insight: string;
}

type Block =
  | { type: 'Declare'; name: string; dataType: PrimitiveType; arraySize?: string }
  | { type: 'Assign'; target: string; expression: string }
  | { type: 'Input'; target: string }
  | { type: 'Output'; expression: string; newLine: boolean }
  | { type: 'Comment'; text: string };
const d = (name:string,dataType:PrimitiveType='Integer',arraySize?:string):Block=>({type:'Declare',name,dataType,arraySize});
const a = (target:string,expression:string):Block=>({type:'Assign',target,expression});
const i = (target:string):Block=>({type:'Input',target});
const o = (expression:string):Block=>({type:'Output',expression,newLine:true});
const tests = (...pairs:readonly [readonly string[],string][]):ExerciseTest[] => pairs.map(([inputs,expectedOutput])=>({inputs,expectedOutput}));

function makeProject(title:string, blocks:readonly Block[]):FlowProject {
  const nodes:Record<string,FlowNode>={start:{id:nodeId('start'),type:'Start',next:nodeId(blocks.length?'b0':'end')},end:{id:nodeId('end'),type:'End'}};
  blocks.forEach((block,index)=>{nodes[`b${index}`]={...block,id:nodeId(`b${index}`),next:nodeId(index===blocks.length-1?'end':`b${index+1}`)} as FlowNode;});
  const fn=functionId('main');
  return {id:projectId(`bank-${title.replace(/\W+/g,'-')}`),metadata:{title,author:'Curso v6',version:'6.0'},mainFunctionId:fn,functions:{main:{id:fn,name:'Main',parameters:[],rootNodeId:nodeId('start'),nodes}}};
}
function change(project:FlowProject,key:string,patch:Record<string,unknown>):FlowProject {
  const main=project.functions[project.mainFunctionId];
  const current=main.nodes[key];
  if(!current)throw new Error(`No existe ${key}`);
  const nextNodes={...main.nodes,[key]:{...current,...patch} as FlowNode};
  return {...project,functions:{...project.functions,[project.mainFunctionId]:{...main,nodes:nextNodes}}};
}
const practice:PracticeChallenge[]=[];
function add(number:number,solution:FlowProject,brokenNode:string,brokenPatch:Record<string,unknown>,samples:readonly ExerciseTest[],hint:string,example:string,insight:string,required?:readonly FlowNode['type'][]):void {
  const info=catalog.find(item=>item.number===number);
  if(!info)throw new Error(`Falta el problema ${number}`);
  const project=change(solution,brokenNode,brokenPatch);
  // Se extraen las variables que usa la solución modelo en Salida.
  // No se exigen valores concretos, sino que la salida lea los datos calculados.
  const solutionMain=solution.functions[solution.mainFunctionId];
  const names=Object.values(solutionMain.nodes)
    .filter((node):node is Extract<FlowNode,{type:'Declare'}>=>node.type==='Declare')
    .flatMap(node=>node.name.split(',').map(name=>name.trim()).filter(Boolean));
  const outputs=Object.values(solutionMain.nodes).filter((node):node is Extract<FlowNode,{type:'Output'}>=>node.type==='Output');
  const outputReads=names.filter(name=>outputs.some(node=>
    new RegExp(`\\b${name}\\b`,'i').test(node.expression.replace(/"(?:\\.|[^"\\])*"/g,' '))));
  const corrected=solution.functions[solution.mainFunctionId].nodes[brokenNode];
  const checkForBlock=corrected.type==='If'?'El rombo Si debe decidir qué rama se ejecuta.':corrected.type==='Assign'?'El bloque Asignar debe calcular un valor y guardarlo en la variable.':corrected.type==='Output'?'Salida debe mostrar el valor o texto que indica el problema.':corrected.type==='Call'?'La llamada debe enviar los argumentos a la función correcta.':['For','While','Do'].includes(corrected.type)?'El ciclo debe recorrer sus vueltas siguiendo las flechas.':`Revisa qué hace la pieza ${TYPE_LABELS[corrected.type]}.`;
  const exercise:Exercise={
    id:`bank-${String(number).padStart(3,'0')}`,lessonId:`catalog-${number}`,level:info.world,
    title:`${String(number).padStart(3,'0')} · ${info.title}`,skill:info.worldName,
    goal:info.description+` Comprobaremos: ${info.check}`,
    hint,requiredTypes:required??[corrected.type],outputReads,
    criteria:[checkForBlock,'Mantén conectadas las piezas desde Inicio hasta Fin.','Comprueba cómo cambia el resultado cuando cambian los datos de Entrada (si los hay).'],
    instructions:['Observa el objetivo: el diagrama ya está construido, pero incluye un error intencional.', 'Toca el bloque señalado y busca qué no coincide con lo que pide el reto.', 'En Editar, corrige el dato y guarda el bloque. La pista y el ejemplo resuelto son opcionales.', 'Ejecuta y pulsa Comprobar: algunos retos se prueban con diferentes entradas.'],
    project,tests:[...samples]
  };
  practice.push({number,exercise,solution,example,insight});
}
function line(number:number,blocks:readonly Block[],brokenIndex:number,patch:Record<string,unknown>,cases:readonly ExerciseTest[],hint:string,example:string,insight='Observa el resultado del programa y corrige un bloque.'):void {
  const info=catalog[number-1];
  add(number,makeProject(info.title,blocks),`b${brokenIndex}`,patch,cases,hint,example,insight);
}
function formula(number:number,fields:readonly [string,PrimitiveType][],expression:string,broken:string,cases:readonly ExerciseTest[],hint:string,example:string):void {
  const blocks:Block[]=[...fields.map(([name,type])=>d(name,type)),...fields.map(([name])=>i(name)),o(expression)];
  line(number,blocks,blocks.length-1,{expression:broken},cases,hint,example,'Primero se guardan los valores de entrada; Salida evalúa la expresión con esos valores.');
}
function branch(number:number,fields:readonly [string,PrimitiveType][],condition:string,wrong:string,yes:string,no:string,cases:readonly ExerciseTest[],hint:string):void {
  const info=catalog[number-1];const prefix=[...fields.map(([name,type])=>d(name,type)),...fields.map(([name])=>i(name))];
  const base=makeProject(info.title,prefix);
  const main=base.functions[base.mainFunctionId];
  const last=`b${prefix.length-1}`;
  const nodes:Record<string,FlowNode>={...main.nodes,[last]:{...main.nodes[last],next:nodeId('decision')} as FlowNode,
    decision:{id:nodeId('decision'),type:'If',condition,trueNext:nodeId('yes'),falseNext:nodeId('no'),next:nodeId('end')},
    yes:{id:nodeId('yes'),type:'Output',expression:JSON.stringify(yes),newLine:true},
    no:{id:nodeId('no'),type:'Output',expression:JSON.stringify(no),newLine:true}};
  const correct={...base,functions:{main:{...main,nodes}}};
  add(number,correct,'decision',{condition:wrong},cases,hint,`Si (${condition}) → «${yes}»; en otro caso «${no}».`,'El rombo elige solo una rama. No es un ciclo.',['If','Input','Output']);
}
function repeat(number:number,variant:'For'|'While'|'Do',start:string,limit:string,wrong:string,cases:readonly ExerciseTest[],hint:string,mode:'ascending'|'descending'='ascending'):void {
  const info=catalog[number-1];
  const init:Block[]=[d('i'),a('i',start)];
  const initial=makeProject(info.title,init);const main=initial.functions[initial.mainFunctionId];
  const cond=variant==='For'?undefined:limit;
  const loop:FlowNode=variant==='For'?{id:nodeId('loop'),type:'For',variable:'i',start,end:limit,step:'1',direction:mode==='ascending'?'Inc':'Dec',bodyNext:nodeId('out'),next:nodeId('end')}:variant==='While'?{id:nodeId('loop'),type:'While',condition:cond??'false',bodyNext:nodeId('out'),next:nodeId('end')}:{id:nodeId('loop'),type:'Do',condition:cond??'false',bodyNext:nodeId('out'),next:nodeId('end')};
  const nodes:Record<string,FlowNode>={...main.nodes,b1:{...main.nodes.b1,next:nodeId('loop')} as FlowNode,loop,out:{id:nodeId('out'),type:'Output',expression:'i',newLine:true,next:variant==='For'?undefined:nodeId('inc')},...(variant==='For'?{}:{inc:{id:nodeId('inc'),type:'Assign',target:'i',expression:mode==='ascending'?'i + 1':'i - 1'} as FlowNode})};
  const solution={...initial,functions:{main:{...main,nodes}}};
  add(number,solution,'loop',variant==='For'?{end:wrong}:{condition:wrong},cases,hint,`${variant}: repite mostrando i; la condición de salida es ${limit}.`,'En cada vuelta debe acercarse el contador al límite.',['Output',variant]);
}

// Mundo 1: primeras salidas y acciones.
line(3,[o('"Hola, mundo"')],0,{expression:'"Cambia esto"'},tests([[],'Hola, mundo\n']),'Los textos literales llevan comillas dobles.','Salida: "Hola, mundo"');
line(4,[o('"Primera"'),o('"Segunda"')],0,{newLine:false},tests([[],'Primera\nSegunda\n']),'Activa «Añadir nueva línea al final» en la primera Salida.','Dos mensajes, cada uno en su línea.');
line(7,[o('"Primero"'),o('"Segundo"')],0,{expression:'"Segundo"'},tests([[],'Primero\nSegundo\n']),'El primer bloque debe escribir Primero.','Inicio → Mostrar Primero → Mostrar Segundo → Fin');
line(10,[o('"Flowgorithm Studio"'),o('"Hola"'),o('"Adiós"')],2,{expression:'"Hasta luego"'},tests([[],'Flowgorithm Studio\nHola\nAdiós\n']),'Corrige el mensaje del tercer bloque.','Tres salidas en orden.');
// Mundo 2: variables, tipos y asignaciones.
line(11,[d('edad'),o('edad')],1,{expression:'"edad"'},tests([[],'0\n']),'Una variable se muestra sin comillas.','Declarar edad Integer → Mostrar edad');
line(12,[d('edad'),a('edad','18'),o('edad')],1,{expression:'0'},tests([[],'18\n']),'La asignación debe guardar 18.','edad = 18');
line(13,[d('precio','Real'),a('precio','12.5'),o('precio')],1,{expression:'12'},tests([[],'12.5\n']),'Los decimales deben tener tipo Real.','precio = 12.5');
line(14,[d('ciudad','String'),a('ciudad','"México"'),o('ciudad')],1,{expression:'""'},tests([[],'México\n']),'String almacena texto entre comillas.','ciudad = "México"');
line(15,[d('activo','Boolean'),a('activo','true'),o('activo')],1,{expression:'false'},tests([[],'true\n']),'Boolean usa true o false (sin comillas).','activo = true');
line(16,[d('a'),d('b'),a('a','3'),a('b','8'),o('a'),o('b')],3,{expression:'0'},tests([[],'3\n8\n']),'Dos variables son dos cajas independientes.','a = 3; b = 8');
line(17,[d('contador'),a('contador','1'),a('contador','2'),o('contador')],2,{expression:'1'},tests([[],'2\n']),'Asignar otra vez reemplaza el valor anterior.','contador = 1; contador = 2');
line(19,[d('a'),d('b'),d('aux'),a('a','4'),a('b','9'),a('aux','a'),a('a','b'),a('b','aux'),o('a'),o('b')],7,{expression:'a'},tests([[],'9\n4\n']),'El auxiliar recuerda el valor original de a.','aux = a; a = b; b = aux');
line(20,[d('precio'),d('cantidad'),d('total'),a('precio','7'),a('cantidad','3'),a('total','precio * cantidad'),o('total')],5,{expression:'precio + cantidad'},tests([[],'21\n']),'Una compra multiplica precio por cantidad.','total = precio * cantidad');
// Mundo 3: entrada y operaciones con múltiples casos.
formula(21,[['nombre','String']],'"Hola, " & nombre','"Hola"',tests([['Luz'],'Hola, Luz\n'],[['Ada'],'Hola, Ada\n']),'En Flowgorithm, & concatena texto; + se reserva para las sumas.','"Hola, " & nombre');
formula(22,[['a','Integer'],['b','Integer']],'a + b','a - b',tests([['2','7'],'9\n'],[['-5','3'],'-2\n']),'Para sumar usa +.','2 + 7 = 9');
formula(23,[['pago','Integer'],['costo','Integer']],'pago - costo','pago + costo',tests([['20','13'],'7\n'],[['50','35'],'15\n']),'El cambio es pago menos costo.','20 - 13 = 7');
formula(24,[['precio','Integer'],['cantidad','Integer']],'precio * cantidad','precio + cantidad',tests([['12','4'],'48\n'],[['0','10'],'0\n']),'Multiplica usando *.','12 * 4 = 48');
formula(25,[['valor','Real']],'valor / 2','valor * 2',tests([['7'],'3.5\n'],[['-4'],'-2\n']),'Divide con /.','7 / 2 = 3.5');
formula(26,[['a','Integer'],['b','Integer'],['c','Integer']],'(a + b) * c','a + b * c',tests([['2','3','4'],'20\n'],[['1','2','0'],'0\n']),'Primero la suma entre paréntesis.','(2+3)*4 = 20');
formula(27,[['base','Real'],['altura','Real']],'base * altura / 2','base * altura',tests([['10','5'],'25\n'],[['8','3'],'12\n']),'Un triángulo es la mitad de base por altura.','Área = base * altura / 2');
formula(28,[['c','Real']],'c * 9 / 5 + 32','c + 32',tests([['0'],'32\n'],[['100'],'212\n'],[['-40'],'-40\n']),'Aplica °F = °C × 9 / 5 + 32.','0°C = 32°F');
// Mundo 4: decisión.
branch(31,[['edad','Integer']],'edad >= 18','edad > 18','Mayor','Menor',tests([['17'],'Menor\n'],[['18'],'Mayor\n'],[['30'],'Mayor\n']),'La edad 18 también debe entrar en la rama Sí.');
branch(33,[['n','Integer']],'n % 2 = 0','n > 0','Par','Impar',tests([['8'],'Par\n'],[['7'],'Impar\n'],[['-3'],'Impar\n'],[['0'],'Par\n']),'El residuo % 2 es cero cuando el número es par.');
branch(34,[['promedio','Real']],'promedio >= 6','promedio > 6','Aprobado','No',tests([['5.9'],'No\n'],[['6'],'Aprobado\n'],[['10'],'Aprobado\n']),'Incluye exactamente 6 usando >=.');
branch(37,[['numero','Integer']],'numero >= 1 and numero <= 100','numero > 1 and numero < 100','Sí','No',tests([['0'],'No\n'],[['1'],'Sí\n'],[['100'],'Sí\n'],[['101'],'No\n']),'Ambos extremos del intervalo están incluidos.');
// Ciclos.
repeat(41,'While','1','i <= 5','i < 5',tests([[],'1\n2\n3\n4\n5\n']),'El 5 también debe entrar en el ciclo.');
repeat(42,'While','5','i >= 1','i > 1',tests([[],'5\n4\n3\n2\n1\n']),'Debes incluir el 1.','descending');
repeat(43,'While','5','i < 5','i <= 5',tests([[],'']),'Un Mientras empieza evaluando: una condición falsa produce cero vueltas.');
repeat(44,'Do','1','i < 2','i < 3',tests([[],'1\n']),'En Hacer mientras el cuerpo corre antes de comprobar.');
repeat(51,'For','1','10','8',tests([[],'1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n']),'Fin debe ser 10.');
repeat(52,'For','10','1','3',tests([[],'10\n9\n8\n7\n6\n5\n4\n3\n2\n1\n']),'En modo decreciente el límite debe ser 1.','descending');
// Mundo 7: cadenas.
formula(61,[['nombre','String'],['apellido','String']],'nombre & " " & apellido','nombre & apellido',tests([['Ada','Lovelace'],'Ada Lovelace\n'],[['Luz','Sol'],'Luz Sol\n']),'Necesitas insertar un espacio literal.','nombre & " " & apellido');
formula(62,[['texto','String']],'len(texto)','texto',tests([['casa'],'4\n'],[[''],'0\n']),'La función len obtiene longitud.','len("casa") = 4');
formula(63,[['texto','String']],'texto[0] & " " & texto[len(texto)-1]','texto[0] & texto[0]',tests([['sol'],'s l\n'],[['ave'],'a e\n']),'Primer índice 0; último índice len(texto)-1.','"sol" → "s l"');
// Mundo 8 y 9: arreglos y matrices lineales.
line(71,[d('v','Integer','5'),o('v[4]')],1,{expression:'v[5]'},tests([[],'0\n']),'Con tamaño 5 los índices válidos son 0 a 4.','Declarar v Integer[5], Mostrar v[4]');
line(72,[d('v','Integer','5'),a('v[2]','7'),o('v[2]')],2,{expression:'v[1]'},tests([[],'7\n']),'Lee exactamente la posición 2.','v[2] = 7; Mostrar v[2]');
line(73,[d('v','Integer','5'),i('v[0]'),i('v[1]'),i('v[2]'),i('v[3]'),i('v[4]'),o('v[4]')],6,{expression:'v[0]'},tests([['1','2','3','4','5'],'5\n'],[['8','7','6','5','4'],'4\n']),'Cada entrada llena una posición diferente del vector.','Lee v[0] ... v[4], muestra el último');
line(74,[d('v','Integer','3'),i('v[0]'),i('v[1]'),i('v[2]'),o('v[0] + v[1] + v[2]')],4,{expression:'v[0] + v[1]'},tests([['2','3','4'],'9\n'],[['-2','7','1'],'6\n']),'Suma todos los índices del arreglo.','2+3+4=9');
line(75,[d('v','Real','3'),i('v[0]'),i('v[1]'),i('v[2]'),o('(v[0] + v[1] + v[2]) / 3')],4,{expression:'v[0] + v[1] + v[2]'},tests([['4','6','8'],'6\n'],[['1','2','3'],'2\n']),'Divide la suma total entre 3.','(4+6+8)/3=6');
line(81,[d('mat','Integer','6'),a('mat[5]','6'),o('mat[5]')],2,{expression:'mat[6]'},tests([[],'6\n']),'Una matriz 2×3 en un arreglo ocupa 6 índices, del 0 al 5.','Índice último 1*3+2=5');
line(82,[d('fila'),d('col'),d('tabla','Integer','6'),a('tabla[0]','1'),a('tabla[1]','2'),a('tabla[2]','3'),a('tabla[3]','4'),a('tabla[4]','5'),a('tabla[5]','6'),i('fila'),i('col'),o('tabla[fila * 3 + col]')],11,{expression:'tabla[fila * 2 + col]'},tests([['0','0'],'1\n'],[['0','2'],'3\n'],[['1','2'],'6\n']),'Para 3 columnas la fórmula correcta es fila*3+col.','fila=1, columna=2 → índice 5 → valor 6');
line(83,[d('m','Integer','9'),...Array.from({length:9},(_,index)=>i(`m[${index}]`)),o('m[8]')],10,{expression:'m[7]'},tests([['1','2','3','4','5','6','7','8','9'],'9\n'],[['9','8','7','6','5','4','3','2','1'],'1\n']),'Una cuadrícula 3×3 ocupa índices 0...8.','Se carga m[0]...m[8] y se muestra el último');
line(84,[d('fila'),d('m','Integer','4'),a('m[0]','1'),a('m[1]','2'),a('m[2]','3'),a('m[3]','4'),i('fila'),o('m[fila * 2] + m[fila * 2 + 1]')],7,{expression:'m[fila] + m[fila + 1]'},tests([['0'],'3\n'],[['1'],'7\n']),'Cada fila ocupa dos posiciones; primera = fila * 2.','fila 1: m[2]+m[3]=7');
line(85,[d('col'),d('m','Integer','4'),a('m[0]','1'),a('m[1]','2'),a('m[2]','3'),a('m[3]','4'),i('col'),o('m[col] + m[2 + col]')],7,{expression:'m[col] + m[1 + col]'},tests([['0'],'4\n'],[['1'],'6\n']),'Para bajar una fila saltas dos posiciones.','col 0: m[0]+m[2]=4');
line(86,[d('m','Integer','4'),a('m[0]','1'),a('m[1]','2'),a('m[2]','3'),a('m[3]','4'),o('m[0] + m[3]')],5,{expression:'m[0] + m[2]'},tests([[],'5\n']),'La diagonal principal 2×2 usa [0] y [3].','1+4=5');

// Additional graded challenges: all have executable solutions and diverse tests.
line(18,[d('valor'),a('valor','15'),o('valor')],2,{expression:'valorNoDeclarado'},tests([[],'15\n']),'La variable de salida debe existir y escribirse exactamente como se declaró.','Declarar valor; valor = 15; Mostrar valor');
line(29,[d('minutos'),i('minutos'),o('int(minutos / 60)'),o('minutos % 60')],2,{expression:'minutos / 60'},tests([['125'],'2\n5\n'],[['60'],'1\n0\n'],[['0'],'0\n0\n']),'int(minutos / 60) obtiene las horas completas.','125 minutos → 2 horas y 5 minutos');
function advancedBranch(number:number,inputs:readonly [string,PrimitiveType][],condition:string,wrong:string,yes:readonly Block[],no:readonly Block[],cases:readonly ExerciseTest[],hint:string):void {
  const info=catalog[number-1];
  const base=makeProject(info.title,[...inputs.map(([name,type])=>d(name,type)),...inputs.map(([name])=>i(name))]);
  const main=base.functions[base.mainFunctionId];const last=`b${inputs.length*2-1}`;
  const tail=(prefix:string,blocks:readonly Block[]):Record<string,FlowNode>=>Object.fromEntries(blocks.map((block,index)=>[`${prefix}${index}`,{...block,id:nodeId(`${prefix}${index}`),next:index===blocks.length-1?undefined:nodeId(`${prefix}${index+1}`)} as FlowNode]));
  const nodes:Record<string,FlowNode>={...main.nodes,[last]:{...main.nodes[last],next:nodeId('branch')} as FlowNode,branch:{id:nodeId('branch'),type:'If',condition,trueNext:nodeId('y0'),falseNext:nodeId('n0'),next:nodeId('end')},...tail('y',yes),...tail('n',no)};
  const solution={...base,functions:{main:{...main,nodes}}};
  add(number,solution,'branch',{condition:wrong},cases,hint,`Cuando ${condition}, ocurre una cosa; si no, otra.`,`Prueba varias entradas y observa qué rama se ejecuta.`,['If','Input','Output']);
}
advancedBranch(38,[['usuario','String'],['pin','Integer']],'usuario = "Ana" and pin = 1234','usuario = "Ana" or pin = 1234',[o('"Acceso"')],[o('"Denegado"')],tests([['Ana','1234'],'Acceso\n'],[['Ana','9999'],'Denegado\n'],[['Luis','1234'],'Denegado\n']),'Deben cumplirse AMBAS condiciones: usa and.');
// Generic loops with an input variable, a For block, and a body.
function inputFor(number:number,initial:readonly Block[],end:string,step:string,expression:string,broken:{block:'loop'|'body'|'after';field:string;value:unknown},cases:readonly ExerciseTest[],hint:string,after:readonly Block[]=[],start='1'):void {
  const info=catalog[number-1];const init=makeProject(info.title,[...initial]);const fn=init.functions[init.mainFunctionId], last=`b${initial.length-1}`;
  const body:FlowNode={id:nodeId('loopbody'),type:'Output',expression,newLine:true};
  const nodes:Record<string,FlowNode>={...fn.nodes,[last]:{...fn.nodes[last],next:nodeId('cycle')} as FlowNode,cycle:{id:nodeId('cycle'),type:'For',variable:'i',start,end,step,direction:'Inc',bodyNext:nodeId('loopbody'),next:nodeId(after.length?'after0':'end')},loopbody:body};
  after.forEach((block,index)=>{nodes[`after${index}`]={...block,id:nodeId(`after${index}`),next:nodeId(index===after.length-1?'end':`after${index+1}`)} as FlowNode;});
  const solution={...init,functions:{main:{...fn,nodes}}};
  const nodeKey=broken.block==='loop'?'cycle':broken.block==='body'?'loopbody':'after0';
  add(number,solution,nodeKey,{[broken.field]:broken.value},cases,hint,`Para i desde ${start} hasta ${end}, paso ${step}. Dentro: ${expression}.`,'El ciclo Para visita cada índice.',['For','Input','Output']);
}
inputFor(53,[d('n'),d('i'),i('n')],'n','2','i',{block:'loop',field:'start',value:'1'},tests([['8'],'2\n4\n6\n8\n'],[['1'],''],[['9'],'2\n4\n6\n8\n']),'Comienza en 2 y avanza de 2 en 2.',[], '2');
inputFor(54,[d('n'),d('i'),i('n')],'10','1','n * i',{block:'body',field:'expression',value:'n + i'},tests([['3'],'3\n6\n9\n12\n15\n18\n21\n24\n27\n30\n'],[['0'],'0\n'.repeat(10)]),'La tabla multiplica n por i, no suma.');
function accumulatorFor(number:number,init:string,bodyExpression:string,wrong:string,cases:readonly ExerciseTest[],hint:string):void {
  const info=catalog[number-1];const prefix=[d('n'),d('i'),d('total'),i('n'),a('total',init)];const base=makeProject(info.title,prefix);const fn=base.functions[base.mainFunctionId];
  const nodes:Record<string,FlowNode>={...fn.nodes,b4:{...fn.nodes.b4,next:nodeId('for')} as FlowNode,for:{id:nodeId('for'),type:'For',variable:'i',start:'1',end:'n',step:'1',direction:'Inc',bodyNext:nodeId('acc'),next:nodeId('show')},acc:{id:nodeId('acc'),type:'Assign',target:'total',expression:bodyExpression},show:{id:nodeId('show'),type:'Output',expression:'total',newLine:true,next:nodeId('end')}};
  const solution={...base,functions:{main:{...fn,nodes}}};
  add(number,solution,'acc',{expression:wrong},cases,hint,`total = ${init}; repetir total = ${bodyExpression} desde 1 hasta n.`,'No reinicies el acumulador dentro del ciclo.',['For','Input','Assign']);
}
accumulatorFor(55,'0','total + i','i',tests([['0'],'0\n'],[['4'],'10\n'],[['7'],'28\n']),'Total acumula lo anterior más el contador.');
accumulatorFor(56,'1','total * i','total + i',tests([['0'],'1\n'],[['4'],'24\n'],[['5'],'120\n']),'Factorial multiplica y comienza en 1.');
// A text loop to make single-character indexing useful.
function stringFor(number:number,body:readonly FlowNode[],correct:Record<string,FlowNode>,brokenKey:string,patch:Record<string,unknown>,cases:readonly ExerciseTest[],hint:string,example:string):void {
  const info=catalog[number-1];
  const initial=makeProject(info.title,[d('texto','String'),d('i'),i('texto')]);const fn=initial.functions[initial.mainFunctionId];
  const nodes:Record<string,FlowNode>={...fn.nodes,b2:{...fn.nodes.b2,next:nodeId('cycle')} as FlowNode,cycle:{id:nodeId('cycle'),type:'For',variable:'i',start:'0',end:'len(texto)-1',step:'1',direction:'Inc',bodyNext:nodeId('body'),next:nodeId('end')},...correct};
  if(body.length===0) throw new Error('Se necesita cuerpo');
  const solution={...initial,functions:{main:{...fn,nodes}}};
  add(number,solution,brokenKey,patch,cases,hint,example,'El índice comienza en 0 y puede depender de len(texto).',['For','Input','Output']);
}
stringFor(64,[{id:nodeId('body'),type:'Output',expression:'texto[i]',newLine:true}],{body:{id:nodeId('body'),type:'Output',expression:'texto[i]',newLine:true}},'body',{expression:'texto[0]'},tests([['pez'],'p\ne\nz\n'],[['a'],'a\n'],[[''],'']),'Muestra texto[i] en cada vuelta, no siempre texto[0].','Para i=0...len(texto)-1: Mostrar texto[i]');
// Matrix and vector indexing, with explicit bounds checks.
line(87,[d('mat','Integer','6'),a('mat[0]','1'),a('mat[1]','2'),a('mat[2]','3'),a('mat[3]','4'),a('mat[4]','5'),a('mat[5]','6'),o('mat[0]'),o('mat[3]'),o('mat[1]'),o('mat[4]'),o('mat[2]'),o('mat[5]')],8,{expression:'mat[4]'},tests([[],'1\n4\n2\n5\n3\n6\n']),'Transponer 2×3 significa recorrer columnas primero: 0,3,1,4,2,5.','Original: [1,2,3;4,5,6] → transpuesta [1,4;2,5;3,6]');

function customGraph(number:number,prefix:readonly Block[],entry:string,rest:Record<string,FlowNode>,brokenId:string,patch:Record<string,unknown>,cases:readonly ExerciseTest[],hint:string,example:string,required:readonly FlowNode['type'][]):void {
  const info=catalog[number-1],base=makeProject(info.title,prefix),fn=base.functions[base.mainFunctionId],tail=`b${prefix.length-1}`;
  const nodes:Record<string,FlowNode>={...fn.nodes,[tail]:{...fn.nodes[tail],next:nodeId(entry)} as FlowNode,...rest};
  const solution={...base,functions:{main:{...fn,nodes}}};
  add(number,solution,brokenId,patch,cases,hint,example,'Explora las condiciones y cambia una cosa a la vez.',['Output',...required]);
}
const out = (id:string,expression:string,next?:string):FlowNode=>({id:nodeId(id),type:'Output',expression,newLine:true,next:next?nodeId(next):undefined});
const dec = (id:string,condition:string,yes:string|undefined,no:string|undefined,next?:string):FlowNode=>({id:nodeId(id),type:'If',condition,trueNext:yes?nodeId(yes):undefined,falseNext:no?nodeId(no):undefined,next:next?nodeId(next):undefined});
const inc = (id:string,target:string,expression:string,next?:string):FlowNode=>({id:nodeId(id),type:'Assign',target,expression,next:next?nodeId(next):undefined});
const read = (id:string,target:string,next?:string):FlowNode=>({id:nodeId(id),type:'Input',target,next:next?nodeId(next):undefined});
const whileNode = (id:string,condition:string,body:string,next:string):FlowNode=>({id:nodeId(id),type:'While',condition,bodyNext:nodeId(body),next:nodeId(next)});
const forNode = (id:string,start:string,end:string,body:string,next:string,direction:'Inc'|'Dec'='Inc'):FlowNode=>({id:nodeId(id),type:'For',variable:'i',start,end,step:'1',direction,bodyNext:nodeId(body),next:nodeId(next)});
// More complex branching: a second If inside a No branch.
customGraph(30,[d('a'),d('b'),d('operador','String'),i('a'),i('b'),i('operador')],'decision',{decision:dec('decision','operador = "+"','yes','no','end'),yes:out('yes','a + b'),no:out('no','a * b')},'decision',{condition:'operador = "*"'},tests([['8','3','+'],'11\n'],[['8','3','*'],'24\n'],[['-2','5','+'],'3\n']),'El operador + debe elegir la suma.', 'Si operador = "+", sumar; de lo contrario multiplicar.',['If','Input']);
customGraph(32,[d('n'),i('n')],'sign',{sign:dec('sign','n > 0','pos','another','end'),pos:out('pos','"Positivo"'),another:dec('another','n < 0','neg','zero'),neg:out('neg','"Negativo"'),zero:out('zero','"Cero"')},'sign',{condition:'n >= 0'},tests([['-4'],'Negativo\n'],[['0'],'Cero\n'],[['7'],'Positivo\n']),'El cero no es positivo ni negativo. Usa n > 0.','Dos decisiones anidadas: n > 0; de lo contrario n < 0.',['If','Input']);
customGraph(35,[d('a'),d('b'),i('a'),i('b')],'max',{max:dec('max','a > b','aout','equal','end'),aout:out('aout','a'),equal:dec('equal','a = b','tie','bout'),tie:out('tie','"Iguales"'),bout:out('bout','b')},'max',{condition:'a >= b'},tests([['3','3'],'Iguales\n'],[['9','2'],'9\n'],[['-4','1'],'1\n']),'Con empate debe ir al segundo Si y escribir Iguales.','Si a>b mostrar a; si a=b mostrar Iguales; si no, mostrar b.',['If','Input']);
customGraph(36,[d('t','Real'),i('t')],'first',{first:dec('first','t < 10','cold','second','end'),cold:out('cold','"Fría"'),second:dec('second','t <= 25','warm','hot'),warm:out('warm','"Templada"'),hot:out('hot','"Caliente"')},'first',{condition:'t < 0'},tests([['-3'],'Fría\n'],[['9'],'Fría\n'],[['10'],'Templada\n'],[['25'],'Templada\n'],[['26'],'Caliente\n']),'Frío: cualquier valor menor de 10.','t<10 → Fría; t<=25 → Templada; en otro caso Caliente.',['If','Input']);
customGraph(40,[d('color','String'),i('color')],'red',{red:dec('red','color = "Rojo"','stop','green','end'),stop:out('stop','"Alto"'),green:dec('green','color = "Verde"','go','other'),go:out('go','"Avanza"'),other:out('other','"Error"')},'red',{condition:'color = "Azul"'},tests([['Rojo'],'Alto\n'],[['Verde'],'Avanza\n'],[['Amarillo'],'Error\n']),'Rojo debe producir Alto, no Azul.','Rojo: alto. Verde: avanza. Otro: error.',['If','Input']);
// Sentinel loops: read, repeat, then stop with valid input.
customGraph(45,[d('n'),i('n')],'check',{check:whileNode('check','n <= 0','again','show'),again:read('again','n'),show:out('show','n','end')},'check',{condition:'n < 0'},tests([['-2','0','9'],'9\n'],[['8'],'8\n']),'También debes repetir cuando el número sea cero.','Mientras n <= 0: pedir otro número.',['While','Input']);
customGraph(46,[d('clave','String'),i('clave')],'check',{check:whileNode('check','clave != "secreto"','again','show'),again:read('again','clave'),show:out('show','"Acceso"','end')},'check',{condition:'clave = "secreto"'},tests([['mal','otra','secreto'],'Acceso\n'],[['secreto'],'Acceso\n']),'Repite MIENTRAS sea diferente de secreto.','Mientras clave != "secreto", solicitarla otra vez.',['While','Input']);
customGraph(47,[d('n'),d('suma'),a('suma','0'),i('n')],'loop',{loop:whileNode('loop','n != 0','acc','result'),acc:inc('acc','suma','suma + n','again'),again:read('again','n'),result:out('result','suma','end')},'acc',{expression:'suma + 1'},tests([['3','4','0'],'7\n'],[['0'],'0\n'],[['-2','5','0'],'3\n']),'Agrega n al acumulador antes de pedir el siguiente.','Mientras n != 0: suma = suma+n; leer n.',['While','Assign','Input']);
customGraph(48,[d('n'),d('cuenta'),a('cuenta','0'),i('n')],'loop',{loop:whileNode('loop','n != 0','acc','result'),acc:inc('acc','cuenta','cuenta + 1','again'),again:read('again','n'),result:out('result','cuenta','end')},'acc',{expression:'cuenta + n'},tests([['1','2','0'],'2\n'],[['0'],'0\n'],[['10','20','30','0'],'3\n']),'El contador sube exactamente una unidad por entrada no cero.','Contar datos previos al centinela 0.',['While','Input','Assign']);
customGraph(49,[d('n'),d('digitos'),i('n'),a('digitos','1')],'loop',{loop:whileNode('loop','n >= 10','dividir','out'),dividir:inc('dividir','n','int(n / 10)','sumar'),sumar:inc('sumar','digitos','digitos + 1'),out:out('out','digitos','end')},'dividir',{expression:'n / 10'},tests([['0'],'1\n'],[['9'],'1\n'],[['437'],'3\n'],[['1000'],'4\n']),'Int(n / 10) elimina el último dígito sin producir decimales.','Cada paso n = int(n/10) reduce un dígito.',['While','Assign','Input']);
customGraph(50,[d('n'),i('n')],'loop',{loop:whileNode('loop','n != 7','warn','win'),warn:out('warn','"No"','again'),again:read('again','n'),win:out('win','"Acertaste"','end')},'loop',{condition:'n != 5'},tests([['7'],'Acertaste\n'],[['3','5','7'],'No\nNo\nAcertaste\n']),'En este juego, el número secreto es 7.','Si no es 7 muestra «No» y pide de nuevo.',['While','Input','Output']);
// Strings and arrays in loops.
customGraph(66,[d('texto','String'),d('i'),d('inverso','String'),i('texto'),a('inverso','""')],'loop',{loop:forNode('loop','len(texto)-1','0','append','result','Dec'),append:inc('append','inverso','inverso & texto[i]'),result:out('result','inverso','end')},'append',{expression:'texto[i] & inverso'},tests([['roma'],'amor\n'],[['a'],'a\n'],[[''],'\n']),'Añade cada letra al FINAL del resultado, recorriendo desde la última.','Para i de len(texto)-1 hasta 0: inverso = inverso & texto[i].',['For','Assign','Input']);
customGraph(68,[d('texto','String'),d('i'),d('cuenta'),i('texto'),a('cuenta','0')],'loop',{loop:forNode('loop','0','len(texto)-1','check','result'),check:dec('check','texto[i] = " "','acc',undefined),acc:inc('acc','cuenta','cuenta + 1'),result:out('result','cuenta','end')},'check',{condition:'texto[i] = "a"'},tests([['uno dos tres'],'2\n'],[[''],'0\n'],[['a b'],'1\n']),'Comprueba si texto[i] es el carácter de espacio.','Por cada carácter " ", sumar 1.',['For','If','Input']);
customGraph(70,[d('texto','String'),d('letra','String'),d('i'),d('cuenta'),i('texto'),i('letra'),a('cuenta','0')],'loop',{loop:forNode('loop','0','len(texto)-1','check','result'),check:dec('check','texto[i] = letra','acc',undefined),acc:inc('acc','cuenta','cuenta + 1'),result:out('result','cuenta','end')},'check',{condition:'texto[i] != letra'},tests([['banana','a'],'3\n'],[['sol','z'],'0\n'],[['aaaa','a'],'4\n']),'Compara igualdad (=) entre el carácter actual y letra.','Frecuencia: contar coincidencias de cada carácter.',['For','If','Input']);
customGraph(76,[d('v','Integer','3'),d('i'),d('mayor'),i('v[0]'),i('v[1]'),i('v[2]'),a('mayor','v[0]')],'loop',{loop:forNode('loop','1','2','check','result'),check:dec('check','v[i] > mayor','update',undefined),update:inc('update','mayor','v[i]'),result:out('result','mayor','end')},'check',{condition:'v[i] < mayor'},tests([['-9','-2','-5'],'-2\n'],[['1','9','3'],'9\n'],[['7','7','7'],'7\n']),'El mayor cambia solo si el candidato supera al valor actual.','Recorrer v[1] y v[2] comparando con mayor.',['For','If','Input']);
line(78,[d('v','Integer','3'),d('aux'),i('v[0]'),i('v[1]'),i('v[2]'),a('aux','v[0]'),a('v[0]','v[2]'),a('v[2]','aux'),o('v[0]'),o('v[1]'),o('v[2]')],7,{expression:'v[0]'},tests([['1','2','3'],'3\n2\n1\n'],[['8','9','6'],'6\n9\n8\n']),'Al final v[2] debe recuperar aux, el valor original de v[0].','Intercambiar extremos con una variable auxiliar.');


// v7: structured curriculum compiler. Every nested region has a single entry, and its
// tail returns to the owning If/For/While; the normal successor stays in `next`.
type ScriptStep = (Block & {tag?:string}) | {
  type: 'If'; condition: string; yes: readonly ScriptStep[]; no?: readonly ScriptStep[]; tag?: string
} | {type:'For';variable:string;start:string;end:string;step:string;direction?:'Inc'|'Dec';body:readonly ScriptStep[];tag?:string} |
{type:'While';condition:string;body:readonly ScriptStep[];tag?:string} |
{type:'Call';functionName:string;args:readonly string[];target?:string;tag?:string} |
{type:'Return';expression?:string;tag?:string};
const IF=(condition:string,yes:readonly ScriptStep[],no:readonly ScriptStep[]=[],tag?:string):ScriptStep=>({type:'If',condition,yes,no,tag});
const FOR=(variable:string,start:string,end:string,body:readonly ScriptStep[],tag?:string,step='1'):ScriptStep=>({type:'For',variable,start,end,step,body,tag});
const WHILE=(condition:string,body:readonly ScriptStep[],tag?:string):ScriptStep=>({type:'While',condition,body,tag});
const CALL=(functionName:string,args:readonly string[],target?:string,tag?:string):ScriptStep=>({type:'Call',functionName,args,target,tag});
const RET=(expression:string,tag?:string):ScriptStep=>({type:'Return',expression,tag});
function compileSteps(steps:readonly ScriptStep[],name:string,parameters:FlowProject['functions'][string]['parameters']=[],returnType?:PrimitiveType):FlowProject['functions'][string] {
  const nodes:Record<string,FlowNode>={};let counter=0;
  // `allocate` recurses only once; branch bodies don't point to the successor because
  // the interpreter stores the continuation on a control frame.
  const allocate=(sequence:readonly ScriptStep[],continuation?:string):string|undefined=>{
    const keys=sequence.map(item=>('tag' in item && item.tag ? item.tag : `s${counter++}`));
    for(let index=0;index<sequence.length;index++){
      const item=sequence[index],key=keys[index],next=keys[index+1]??continuation;
      const n=next?nodeId(next):undefined;
      if(item.type==='If'){
        const yes=allocate(item.yes),no=allocate(item.no??[]);
        nodes[key]={id:nodeId(key),type:'If',condition:item.condition,trueNext:yes?nodeId(yes):undefined,falseNext:no?nodeId(no):undefined,next:n};
      } else if(item.type==='For') {
        const body=allocate(item.body);
        nodes[key]={id:nodeId(key),type:'For',variable:item.variable,start:item.start,end:item.end,step:item.step,direction:item.direction??'Inc',bodyNext:body?nodeId(body):undefined,next:n};
      } else if(item.type==='While'){
        const body=allocate(item.body);
        nodes[key]={id:nodeId(key),type:'While',condition:item.condition,bodyNext:body?nodeId(body):undefined,next:n};
      } else if(item.type==='Call')nodes[key]={id:nodeId(key),type:'Call',functionName:item.functionName,args:item.args,target:item.target,next:n};
      else if(item.type==='Return')nodes[key]={id:nodeId(key),type:'Return',expression:item.expression,next:n};
      else nodes[key]={...item,id:nodeId(key),next:n} as FlowNode;
    }
    return keys[0];
  };
  // Keep unique names even across nested regions and independent functions.
  const entry=allocate(steps,`end_${name}`);
  nodes[`start_${name}`]={id:nodeId(`start_${name}`),type:'Start',next:nodeId(entry??`end_${name}`)};
  nodes[`end_${name}`]={id:nodeId(`end_${name}`),type:'End'};
  return {id:functionId(name),name,parameters,returnType:returnType?{kind:'Primitive',type:returnType}:undefined,nodes,rootNodeId:nodeId(`start_${name}`)};
}
function newScriptProject(number:number,script:readonly ScriptStep[],helpers:readonly FlowProject['functions'][string][]=[]):FlowProject {
  const info=catalog[number-1],main=compileSteps(script,'Main');
  const functions:Record<string,FlowProject['functions'][string]>={Main:main};
  helpers.forEach(fn=>{functions[fn.name]=fn;});
  return {id:projectId(`bank-${number}`),metadata:{title:info.title,author:'Flowgorithm Studio',version:'7'},mainFunctionId:main.id,functions};
}
function scriptChallenge(number:number,script:readonly ScriptStep[],brokenTag:string,patch:Record<string,unknown>,cases:readonly ExerciseTest[],hint:string,example:string,required:readonly FlowNode['type'][]=[],helpers:readonly FlowProject['functions'][string][]=[]):void {
  const project=newScriptProject(number,script,helpers),main=project.functions[project.mainFunctionId];
  if(!main.nodes[brokenTag])throw new Error(`Falta etiqueta ${brokenTag} en reto ${number}`);
  add(number,project,brokenTag,patch,cases,hint,example,'Aprende el patrón de solución y prueba entradas pequeñas, límites y casos especiales.',required);
}
const P=(name:string,type:PrimitiveType='Integer'):FlowProject['functions'][string]['parameters'][number]=>({name,type:{kind:'Primitive',type}});
const FN=(name:string,parameters:readonly ReturnType<typeof P>[],type:PrimitiveType,script:readonly ScriptStep[]):FlowProject['functions'][string]=>compileSteps(script,name,parameters,type);

// Decisiones anidadas y acumuladores con lectura variable.
scriptChallenge(39,[d('a'),d('b'),d('c'),i('a'),i('b'),i('c'),d('maximo'),a('maximo','a'),IF('b > maximo',[a('maximo','b')]),IF('c > maximo',[a('maximo','c')]),{...o('maximo'),tag:'answer'} as ScriptStep],'answer',{expression:'a'},tests([['7','12','5'],'12\n'],[['3','3','3'],'3\n'],[['-4','-1','-9'],'-1\n']),'Mostrar maximo, no el primer número.','Comparar cada número con maximo y actualizar solo si es mayor.',['If','Assign']);
scriptChallenge(57,[d('n'),d('i'),d('dato','Real'),d('suma','Real'),i('n'),a('suma','0'),FOR('i','1','n',[i('dato'),a('suma','suma + dato')]),IF('n > 0',[{...o('suma / n'),tag:'answer'} as ScriptStep],[o('0')])],'answer',{expression:'suma'},tests([['3','2','4','6'],'4\n'],[['0'],'0\n'],[['2','3','8'],'5.5\n']),'Divide la suma entre n.','Para cada dato sumar; si n>0, promedio=suma/n.',['For','If','Input']);
scriptChallenge(58,[d('n'),d('i'),d('nota'),d('aprobados'),i('n'),a('aprobados','0'),FOR('i','1','n',[i('nota'),IF('nota >= 6',[a('aprobados','aprobados + 1')])]),{...o('aprobados'),tag:'answer'} as ScriptStep],'answer',{expression:'n'},tests([['3','5','6','9'],'2\n'],[['0'],'0\n'],[['4','6','6','5','10'],'3\n']),'Imprime el contador aprobados.','Incrementa aprobados únicamente con nota >= 6.',['For','If']);
scriptChallenge(59,[d('n'),d('i'),d('j'),i('n'),FOR('i','1','n',[FOR('j','1','i',[{...{type:'Output',expression:'"*"',newLine:false},tag:'star'} as ScriptStep]),o('""')])],'star',{expression:'"-"'},tests([['0'],''],[['1'],'*\n'],[['3'],'*\n**\n***\n']),'Cada iteración imprime un asterisco sin salto de línea; al terminar la fila se imprime una nueva línea.','Dos Para anidados: j desde 1 hasta i.',['For','Output']);
scriptChallenge(60,[d('n'),d('i'),d('primo','Boolean'),i('n'),a('primo','true'),IF('n < 2',[a('primo','false')]),FOR('i','2','n - 1',[IF('n % i = 0',[a('primo','false')])]),IF('primo',[{...o('"Primo"'),tag:'answer'} as ScriptStep],[o('"No"')])],'answer',{expression:'"No"'},tests([['2'],'Primo\n'],[['17'],'Primo\n'],[['1'],'No\n'],[['21'],'No\n'],[['-3'],'No\n']),'La rama verdadera debe mostrar Primo.','Revisa todos los divisores de 2 a n-1; cero divisores implica primo.',['For','If']);
const vowel='letra = "a" or letra = "e" or letra = "i" or letra = "o" or letra = "u" or letra = "á" or letra = "é" or letra = "í" or letra = "ó" or letra = "ú"';
scriptChallenge(65,[d('texto','String'),d('i'),d('cuenta'),d('letra','String'),i('texto'),a('cuenta','0'),FOR('i','0','len(texto)-1',[a('letra','lower(texto[i])'),IF(vowel,[{...a('cuenta','cuenta + 1'),tag:'plus'} as ScriptStep])]),o('cuenta')],'plus',{expression:'cuenta + 2'},tests([['Murciélago'],'5\n'],[['AEIOU'],'5\n'],[['xyz'],'0\n'],[['Árbol'],'2\n']),'Cada vocal suma uno, incluyendo vocales acentuadas.','Convierte cada carácter a minúsculas y comprueba las diez vocales.',['For','If']);
scriptChallenge(67,[d('texto','String'),d('inverso','String'),d('i'),i('texto'),a('texto','lower(texto)'),a('inverso','""'),{type:'For',variable:'i',start:'len(texto)-1',end:'0',step:'1',direction:'Dec',body:[a('inverso','inverso & texto[i]')]},IF('texto = inverso',[{...o('"Sí"'),tag:'answer'} as ScriptStep],[o('"No"')])],'answer',{expression:'"No"'},tests([['Reconocer'],'Sí\n'],[['radar'],'Sí\n'],[['Casa'],'No\n'],[['Aa'],'Sí\n']),'La rama verdadera imprime Sí.','Ignora mayúsculas: invierte texto y compara.',['For','If']);
scriptChallenge(69,[d('nombre','String'),d('i'),d('iniciales','String'),i('nombre'),a('iniciales','""'),FOR('i','0','len(nombre)-1',[IF('nombre[i] != " " and (i = 0 or nombre[i-1] = " ")',[{...a('iniciales','iniciales & upper(nombre[i])'),tag:'append'} as ScriptStep])]),o('iniciales')],'append',{expression:'iniciales & nombre[i]'},tests([['Ana Maria Sol'],'AMS\n'],[['luz'],'L\n'],[['Juan  Carlos'],'JC\n'],[[''],'\n']),'Usa upper() para que las iniciales sean mayúsculas.','Toma la letra de índice cero y las que siguen después de un espacio.',['For','If']);
scriptChallenge(77,[d('v','Integer','3'),d('clave'),d('i'),d('pos'),i('v[0]'),i('v[1]'),i('v[2]'),i('clave'),a('pos','-1'),FOR('i','0','2',[IF('v[i] = clave and pos = -1',[{...a('pos','i'),tag:'found'} as ScriptStep])]),o('pos')],'found',{expression:'pos + 1'},tests([['4','6','2','6'],'1\n'],[['4','6','2','8'],'-1\n'],[['1','1','1','1'],'0\n']),'Guarda el índice actual i de la primera coincidencia.','Recorre elementos y conserva el primer índice coincidente.',['For','If']);
scriptChallenge(79,[d('v','Integer','4'),d('out','Integer','4'),d('i'),d('j'),d('cantidad'),d('repetido','Boolean'),i('v[0]'),i('v[1]'),i('v[2]'),i('v[3]'),a('cantidad','0'),FOR('i','0','3',[a('repetido','false'),FOR('j','0','cantidad-1',[IF('v[i] = out[j]',[a('repetido','true')])]),IF('not repetido',[{...a('out[cantidad]','v[i]'),tag:'keep'} as ScriptStep,a('cantidad','cantidad + 1')])]),FOR('i','0','cantidad-1',[o('out[i]')])],'keep',{expression:'v[0]'},tests([['3','3','2','3'],'3\n2\n'],[['4','2','4','2'],'4\n2\n'],[['1','2','3','4'],'1\n2\n3\n4\n']),'Copia al arreglo de salida el elemento actual v[i].','Busca cada valor entre los ya guardados; añade solo si no existe.',['For','If']);
scriptChallenge(80,[d('v','Integer','4'),d('i'),d('j'),d('aux'),i('v[0]'),i('v[1]'),i('v[2]'),i('v[3]'),FOR('i','0','2',[FOR('j','0','2-i',[IF('v[j] > v[j+1]',[a('aux','v[j]'),a('v[j]','v[j+1]'),{...a('v[j+1]','aux'),tag:'swap'} as ScriptStep])])]),FOR('i','0','3',[o('v[i]')])],'swap',{expression:'v[j]'},tests([['5','-1','5','2'],'-1\n2\n5\n5\n'],[['4','3','2','1'],'1\n2\n3\n4\n'],[['1','1','1','1'],'1\n1\n1\n1\n']),'Guarda el elemento original en aux antes de intercambiar.','Burbuja intercambia vecinos desordenados en dos ciclos.',['For','If']);
scriptChallenge(88,[d('A','Integer','4'),d('B','Integer','4'),d('C','Integer','4'),d('i'),d('j'),d('k'),i('A[0]'),i('A[1]'),i('A[2]'),i('A[3]'),i('B[0]'),i('B[1]'),i('B[2]'),i('B[3]'),FOR('i','0','1',[FOR('j','0','1',[a('C[i*2+j]','0'),FOR('k','0','1',[{...a('C[i*2+j]','C[i*2+j] + A[i*2+k] * B[k*2+j]'),tag:'multiply'} as ScriptStep])])]),FOR('i','0','3',[o('C[i]')])],'multiply',{expression:'C[i*2+j] + A[i*2+k] + B[k*2+j]'},tests([['1','0','0','1','2','3','4','5'],'2\n3\n4\n5\n'],[['1','2','3','4','5','6','7','8'],'19\n22\n43\n50\n']),'Cada celda multiplica fila por columna y suma los productos.','C[i,j] = Σ A[i,k] × B[k,j]. Los índices de matriz 2×2 se aplanan.',['For','Assign']);
// Funciones propias, parámetros tipados, llamadas explícitas y retorno.
const doubleFN=FN('doble',[P('x')],'Integer',[RET('x * 2','returnCorrect')]);
scriptChallenge(89,[d('x'),d('resultado'),i('x'),CALL('doble',['x'],'resultado','invoke'),o('resultado')],'invoke',{functionName:'triplica'},tests([['4'],'8\n'],[['-3'],'-6\n'],[['0'],'0\n']),'El nombre debe coincidir con la función doble.','Definición: doble(x) retorna x*2. Llamada: doble(x).',['Call','Input'],[doubleFN]);
const areaFN=FN('areaRectangulo',[P('base','Real'),P('altura','Real')],'Real',[RET('base * altura')]);
scriptChallenge(90,[d('base','Real'),d('altura','Real'),d('area','Real'),i('base'),i('altura'),CALL('areaRectangulo',['base','altura'],'area','invoke'),o('area')],'invoke',{args:['base','base']},tests([['3','5'],'15\n'],[['2.5','4'],'10\n']),'Envía base y altura en ese orden.','Retornar base × altura desde una función que recibe dos parámetros.',['Call','Input'],[areaFN]);
const validFN=FN('validar',[P('n')],'Boolean',[RET('n >= 0')]);
const squareFN=FN('cuadrado',[P('n')],'Integer',[RET('n * n')]);
scriptChallenge(91,[d('n'),d('ok','Boolean'),d('resultado'),i('n'),CALL('validar',['n'],'ok'),IF('ok',[CALL('cuadrado',['n'],'resultado','invoke'),o('resultado')],[o('"Error"')])],'invoke',{functionName:'validar'},tests([['4'],'16\n'],[['-2'],'Error\n'],[['0'],'0\n']),'En la rama válida usa cuadrado, no validar.','Separar validar(n) de cuadrado(n) y reutilizar los resultados.',['Call','If'],[validFN,squareFN]);
const isEvenFN=FN('esPar',[P('n')],'Boolean',[RET('n % 2 = 0')]);
scriptChallenge(92,[d('n'),d('respuesta','Boolean'),i('n'),CALL('esPar',['n'],'respuesta','invoke'),o('respuesta')],'invoke',{functionName:'esImpar'},tests([['-2'],'true\n'],[['7'],'false\n'],[['0'],'true\n']),'Llama a la función esPar(n).','La función booleana retorna n % 2 = 0.',['Call'],[isEvenFN]);
const maxFN=FN('maximo',[P('a'),P('b')],'Integer',[IF('a >= b',[RET('a')],[RET('b')])]);
scriptChallenge(93,[d('a'),d('b'),d('c'),d('res'),i('a'),i('b'),i('c'),CALL('maximo',['a','b'],'res'),CALL('maximo',['res','c'],'res','invoke'),o('res')],'invoke',{args:['a','c']},tests([['3','9','5'],'9\n'],[['10','-3','12'],'12\n'],[['7','7','7'],'7\n']),'Compara el resultado anterior con c, no compares a otra vez.','maximo(maximo(a,b),c), reutilizando la función.',['Call'],[maxFN]);
const factorialFN=FN('factorial',[P('n')],'Integer',[IF('n <= 1',[RET('1')],[RET('n * factorial(n - 1)')])]);
scriptChallenge(94,[d('n'),d('resultado'),i('n'),CALL('factorial',['n'],'resultado','invoke'),o('resultado')],'invoke',{functionName:'factoriales'},tests([['0'],'1\n'],[['5'],'120\n'],[['3'],'6\n'],[['1'],'1\n']),'Llama a factorial(n) y observa cómo llega al caso base.','factorial(0)=1; factorial(n)=n×factorial(n-1) para n>1.',['Call'],[factorialFN]);
const gcdFN=FN('mcd',[P('a'),P('b')],'Integer',[IF('b = 0',[RET('abs(a)')],[RET('mcd(b, a % b)')])]);
scriptChallenge(95,[d('a'),d('b'),d('resultado'),i('a'),i('b'),CALL('mcd',['a','b'],'resultado','invoke'),o('resultado')],'invoke',{functionName:'mcdIncorrecto'},tests([['48','18'],'6\n'],[['17','13'],'1\n'],[['0','9'],'9\n']),'El algoritmo usa mcd(a,b), conservando el orden de los argumentos.','Si b=0 retorna |a|; si no, mcd(b,a mod b).',['Call'],[gcdFN]);

// Proyectos integrados con entradas múltiples, validación, ciclos y resultados.
scriptChallenge(96,[d('n'),d('i'),d('a','Real'),d('b','Real'),d('prom','Real'),d('suma','Real'),i('n'),a('suma','0'),IF('n <= 0',[o('"Sin alumnos"')],[FOR('i','1','n',[i('a'),i('b'),a('prom','(a + b) / 2'),a('suma','suma + prom'),IF('prom >= 6',[o('"Aprobado"')],[o('"Reprobado"')])]),{...o('suma / n'),tag:'overall'} as ScriptStep])],'overall',{expression:'suma'},tests([['0'],'Sin alumnos\n'],[['2','6','6','5','7'],'Aprobado\nAprobado\n6\n'],[['2','4','6','6','8'],'Reprobado\nAprobado\n6\n']),'El promedio grupal debe dividir la suma entre n.','Por alumno: dos notas, un promedio y clasificación; al final promedio general.',['For','If','Input']);
scriptChallenge(97,[d('n'),d('i'),d('precio','Real'),d('cantidad'),d('total','Real'),d('correcto','Boolean'),i('n'),a('total','0'),a('correcto','true'),IF('n < 0',[a('correcto','false')]),FOR('i','1','n',[i('precio'),i('cantidad'),IF('precio < 0 or cantidad < 0',[a('correcto','false')],[a('total','total + precio * cantidad')])]),IF('correcto',[IF('total >= 100',[{...a('total','total * 0.9'),tag:'discount'} as ScriptStep]),o('round(total * 100) / 100')],[o('"Error"')])],'discount',{expression:'total * 0.8'},tests([['0'],'0\n'],[['2','10','2','20','3'],'80\n'],[['1','120','1'],'108\n'],[['1','-2','3'],'Error\n']),'El descuento aplicado es 10% al superar o igualar 100.','Leer N productos, sumar precio × cantidad, aplicar 10% si total≥100.',['For','If','Input']);
scriptChallenge(98,[d('id1','String'),d('id2','String'),d('stock1'),d('stock2'),d('buscar','String'),d('delta'),i('id1'),i('stock1'),i('id2'),i('stock2'),
  IF('id1 = id2',[o('"Duplicado"')],[
    i('buscar'),i('delta'),
    IF('buscar = id1',[IF('stock1 + delta >= 0',[{...o('stock1 + delta'),tag:'updated'} as ScriptStep],[o('"Sin stock"')])],
      [IF('buscar = id2',[IF('stock2 + delta >= 0',[o('stock2 + delta')],[o('"Sin stock"')])],[o('"No existe"')])])
  ])],'updated',{expression:'stock1 - delta'},tests(
    [['A1','10','B2','5','A1','-3'],'7\n'],
    [['A1','10','B2','5','B2','2'],'7\n'],
    [['A1','2','B2','5','A1','-5'],'Sin stock\n'],
    [['A1','4','A1','2'],'Duplicado\n'],
    [['A1','4','B2','2','X3','1'],'No existe\n']
  ),'Stock final = stock inicial + variación.','Crea dos productos con IDs distintos, rechaza ID duplicado, busca por clave y aplica cambios sin permitir stock negativo.',['If','Input']);
scriptChallenge(99,[d('n'),d('i'),d('nota','Real'),d('suma','Real'),d('mayor','Real'),d('menor','Real'),d('aprobados'),i('n'),a('suma','0'),a('aprobados','0'),IF('n <= 0',[o('"Sin datos"')],[FOR('i','1','n',[i('nota'),a('suma','suma + nota'),IF('i = 1',[a('mayor','nota'),a('menor','nota')],[IF('nota > mayor',[a('mayor','nota')]),IF('nota < menor',[a('menor','nota')])]),IF('nota >= 6',[a('aprobados','aprobados + 1')])]),o('suma / n'),o('mayor'),o('menor'),{...o('aprobados'),tag:'count'} as ScriptStep])],'count',{expression:'n'},tests([['0'],'Sin datos\n'],[['3','5','8','6'],'6.333333333333333\n8\n5\n2\n'],[['2','10','10'],'10\n10\n10\n2\n']),'El último dato es el número de aprobados (nota≥6), no n.','Estadística: media, máximo, mínimo y aprobados.',['For','If','Input']);
const bookFn=FN('indiceLibro',[P('codigo')],'Integer',[IF('codigo >= 1 and codigo <= 3',[RET('codigo - 1')],[RET('-1')])]);
scriptChallenge(100,[d('prestado','Boolean','3'),d('opcion'),d('codigo'),d('indice'),d('i'),i('opcion'),WHILE('opcion != 0',[
    IF('opcion = 1 or opcion = 2 or opcion = 3',[
      i('codigo'),CALL('indiceLibro',['codigo'],'indice','lookup'),IF('indice = -1',[o('"No existe"')],[
        IF('opcion = 1',[IF('prestado[indice]',[o('"No disponible"')],[a('prestado[indice]','true'),o('"Prestado"')])],
          [IF('opcion = 2',[IF('prestado[indice]',[a('prestado[indice]','false'),o('"Devuelto"')],[o('"No prestado"')])],
             [IF('prestado[indice]',[o('"Prestado"')],[o('"Disponible"')])])])
      ])
    ],[o('"Opción inválida"')]),i('opcion')
  ]),FOR('i','0','2',[IF('prestado[i]',[{...o('"En préstamo"'),tag:'report'} as ScriptStep],[o('"Disponible"')])])],'report',{expression:'"Disponible"'},tests(
  [['0'],'Disponible\nDisponible\nDisponible\n'],
  [['1','2','3','2','0'],'Prestado\nPrestado\nDisponible\nEn préstamo\nDisponible\n'],
  [['1','3','1','3','2','3','0'],'Prestado\nNo disponible\nDevuelto\nDisponible\nDisponible\nDisponible\n'],
  [['3','7','0'],'No existe\nDisponible\nDisponible\nDisponible\n']
),'El reporte final debe marcar cada libro prestado.','Menú: 1 prestar, 2 devolver, 3 consultar, 0 salir; valida el ID, usa un arreglo de préstamos y genera un reporte.',['While','For','If','Call','Input'],[bookFn]);

// Interacciones verificadas mediante eventos reales del editor (no mediante la salida de un programa).
function actionChallenge(number:number,kind:InteractionKind,blocks:readonly Block[],instructions:readonly string[],hint:string):void {
  const info=catalog[number-1];const project=makeProject(info.title,blocks);
  const exercise:Exercise={id:`bank-${String(number).padStart(3,'0')}`,lessonId:`catalog-${number}`,level:info.world,
    title:`${String(number).padStart(3,'0')} · ${info.title}`,skill:info.worldName,goal:info.description,
    hint,instructions,requiredTypes:[],tests:[],project,interaction:kind};
  practice.push({number,exercise,solution:project,example:info.check,insight:'La comprobación observa las acciones que realmente hagas en el editor.'});
}
actionChallenge(1,'select-order',[],['Toca el óvalo Inicio.', 'Después toca el óvalo Fin.', 'Pulsa Comprobar reto.'],'El algoritmo siempre comienza en Inicio y termina en Fin.');
actionChallenge(2,'open-editor',[o('"Hola"')],['Toca el bloque Salida.', 'Abre Editar (si ya se abrió, lo has conseguido).','Comprueba reto.'],'Salida es el paralelogramo que muestra información.');
actionChallenge(5,'cancel-edit',[o('"Original"')],['Toca Salida y entra en Editar.','Cambia el texto a "Nuevo" sin aplicarlo.','Pulsa Cancelar edición y luego Comprobar reto.'],'Cancelar edición restaura el texto anterior; no lo guarda.');
actionChallenge(6,'insert-output',[],['Toca Inicio.', 'Pulsa «+ Añadir pieza» y elige Salida.','Insértala después de Inicio, antes de Fin; comprueba el reto.'],'No necesitas arrastrar: pulsa Piezas, Salida y Después.');
actionChallenge(8,'delete-output',[o('"Eliminarme"')],['Toca Salida.','Abre Editar y pulsa Eliminar este bloque.','Confirma y comprueba que queda Inicio → Fin.'],'Fin nunca debe borrarse.');
actionChallenge(9,'step-and-reset',[o('"Ejecutando"')],['Pulsa Paso a paso al menos una vez.','Después pulsa Reiniciar.','Comprueba el reto.'],'Reiniciar devuelve la ejecución a Inicio.');

export const playableChallenges: readonly PracticeChallenge[] = practice.sort((a,b)=>a.number-b.number);
export function challengeFor(number:number):PracticeChallenge|undefined {return playableChallenges.find(item=>item.number===number);}
export function availability(number:number):'available'|'planned' {return challengeFor(number)?'available':'planned';}
