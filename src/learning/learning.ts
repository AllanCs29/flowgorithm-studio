import { FlowNode, FlowProject, functionId, nodeId, projectId } from '../domain/models';

export interface LessonStep { readonly title: string; readonly body: string; readonly action: string; }
export interface Lesson {
  readonly id: string;
  readonly level: number;
  readonly title: string;
  readonly summary: string;
  readonly minutes: number;
  readonly block: FlowNode['type'];
  readonly steps: readonly LessonStep[];
  readonly example: string;
  readonly diagram: readonly string[];
}
import type { InteractionKind } from './interactionChallenges';
export interface ExerciseTest { readonly inputs: readonly string[]; readonly expectedOutput: string; }
export interface Exercise {
  readonly id: string;
  readonly lessonId: string;
  readonly level: number;
  readonly title: string;
  readonly skill: string;
  readonly goal: string;
  readonly hint: string;
  readonly instructions: readonly string[];
  readonly tests: readonly ExerciseTest[];
  readonly requiredTypes: readonly FlowNode['type'][];
  readonly project: FlowProject;
  readonly interaction?: InteractionKind;
}

const step = (title: string, body: string, action: string): LessonStep => ({ title, body, action });
export const lessons: readonly Lesson[] = [
  { id: 'flow', level: 1, block: 'Start', title: 'Conoce el editor', summary: 'Descubre dónde dar clic y cómo se recorren las flechas.', minutes: 4, example: 'Inicio → Salida → Fin', diagram: ['▶ Inicio', '↓', '▱ Output "Hola"', '↓', '◼ Fin'], steps: [
    step('1 · Lee el diagrama', 'La ejecución comienza en Inicio, continúa por las flechas y termina en Fin.', 'Haz clic en un bloque del lienzo para resaltarlo.'),
    step('2 · Ubica las herramientas', 'En el editor, toca un bloque del diagrama. Abre «Editar» para cambiarlo, «Piezas» para añadir y «Resultado» para ver la ejecución. En móvil están en la barra inferior.', 'Toca «Salida» en el diagrama, abre «Editar» y después encuentra «Resultado».'),
    step('3 · Ejecuta una instrucción', 'Paso a paso ejecuta el bloque siguiente. Ejecutar recorre todo el programa.', 'Pulsa Paso a paso; observa el bloque activo. Después usa Reiniciar.')
  ] },
  { id: 'output', level: 1, block: 'Output', title: 'Tu primer mensaje', summary: 'Aprende a mostrar texto y resultados.', minutes: 5, example: 'Mostrar "Hola, mundo"', diagram: ['▶ Inicio', '↓', '▱ Output "Hola, mundo"', '↓', '◼ Fin'], steps: [
    step('1 · Salida', 'Mostrar escribe un texto o el resultado de una expresión en la consola.', 'Pulsa el bloque Salida del diagrama.'),
    step('2 · Comillas', 'El texto literal va entre comillas dobles; una variable va sin ellas.', 'Toca «Editar», cambia Expresión por "Hola, mundo" y pulsa Aplicar cambios.'),
    step('3 · Revisa la consola', 'El resultado aparece en «Resultado». Una nueva línea agrega un salto de línea al final.', 'Pulsa «Ejecutar», abre «Resultado» y mira tu salida; «Reiniciar» vuelve al principio.')
  ] },
  { id: 'declare', level: 2, block: 'Declare', title: 'La caja de datos: Declarar', summary: 'Crea variables y distingue Integer, Real, String y Boolean.', minutes: 6, example: 'Integer edad', diagram: ['▶ Inicio', '↓', '▤ Integer edad', '↓', '▱ Output edad', '↓', '◼ Fin'], steps: [
    step('1 · ¿Qué es una variable?', 'Es una caja con nombre que conserva un valor mientras el programa se ejecuta.', 'Toca «Piezas» y busca «Declarar».'),
    step('2 · Elige un tipo', 'Integer guarda enteros, Real decimales, String texto y Boolean true/false.', 'Crea un bloque Declarar antes de la salida.'),
    step('3 · Ponle nombre', 'Escribe edad como Nombre y deja Integer como Tipo. Aplicar cambios guarda la configuración.', 'Ejecuta paso a paso y mira edad en Variables.')
  ] },
  { id: 'assign', level: 2, block: 'Assign', title: 'Asignar y hacer cuentas', summary: 'Aprende qué significa = dentro de Asignar y cómo guardar un cálculo.', minutes: 7, example: 'total = 7 + 8', diagram: ['▤ Integer total', '↓', '▭ total = 7 + 8', '↓', '▱ Output total'], steps: [
    step('1 · Dos campos', 'Asignar tiene dos partes: a la izquierda está la variable donde se guardará el dato; a la derecha está la expresión que se calcula. El bloque usa el signo =.', 'Selecciona el bloque Asignar.'),
    step('2 · Operadores', '+ suma; - resta; * multiplica; / divide; ^ eleva a una potencia; % obtiene el residuo. Primero se calcula y después se guarda.', 'Cambia su expresión y observa el resultado de 7 + 8.'),
    step('3 · Reasignar', 'Puedes actualizar el valor: contador = contador + 1.', 'Ejecuta paso a paso y revisa Variables después de Asignar.')
  ] },
  { id: 'input', level: 3, block: 'Input', title: 'Leer datos del usuario', summary: 'Haz que el programa pregunte un valor y lo utilice.', minutes: 7, example: 'Leer nombre → Mostrar "Hola " & nombre', diagram: ['▤ String nombre', '↓', '▱ Input nombre', '↓', '▱ Output "Hola " & nombre'], steps: [
    step('1 · Declara primero', 'Una Entrada necesita una variable existente del tipo correcto.', 'Localiza Declarar nombre.'),
    step('2 · Espera al usuario', 'Cuando la ejecución llega a Entrada aparece un cuadro donde introducir un valor.', 'Pulsa Ejecutar e introduce Ada cuando lo solicite.'),
    step('3 · Concatena texto', 'En Flowgorithm, el símbolo & une textos. El signo + suma números.', 'Configura la salida para que escriba Hola Ada.')
  ] },
  { id: 'if', level: 4, block: 'If', title: 'Si / Sino: toma decisiones', summary: 'Elige una de dos rutas. No es un ciclo.', minutes: 9, example: 'Si edad >= 18 → Sí: "Mayor" | No: "Menor"', diagram: ['◇ ¿edad >= 18?', '↙ Sí        No ↘', 'Mostrar Mayor    Mostrar Menor', '↘             ↙', 'Continuar'], steps: [
    step('1 · Una pregunta', 'Si evalúa una condición verdadera o falsa; por ejemplo edad >= 18 o n % 2 = 0.', 'Inserta Si debajo del bloque Entrada.'),
    step('2 · Dos salidas distintas', 'Si la condición es verdadera se ejecuta únicamente la rama Sí; si es falsa únicamente la rama No.', 'Selecciona Si. Usa los botones “En rama Sí” y “En rama No” para colocar una Salida en cada rama.'),
    step('3 · Las ramas se unen', 'Después de ejecutar una de las ramas, el flujo continúa debajo del rombo. Para repetir, usa Mientras o Para.', 'Prueba dos valores distintos, por ejemplo 17 y 18.')
  ] },
  { id: 'compare', level: 4, block: 'If', title: 'Comparaciones y operadores', summary: 'Practica >, <, >=, <=, =, <> y el residuo.', minutes: 7, example: 'n % 2 = 0', diagram: ['◇ ¿n % 2 = 0?', '↙ Sí       No ↘', 'Mostrar Par   Mostrar Impar'], steps: [
    step('1 · Los operadores', 'En una condición de Flowgorithm, = compara si dos valores son iguales. <> pregunta si son diferentes; >= es mayor o igual y % calcula el residuo.', 'Lee la condición del ejemplo par/impar.'),
    step('2 · Prueba bordes', '8 % 2 vale 0, mientras que 7 % 2 vale 1.', 'Prueba entradas 8, 7 y 0.'),
    step('3 · Comprueba ambas ramas', 'Un algoritmo debe manejar casos verdaderos y falsos, no solo un ejemplo.', 'Usa Comprobar reto para correr varios casos automáticamente.')
  ] },
  { id: 'while', level: 5, block: 'While', title: 'Mientras: tu primer ciclo', summary: 'Repite un grupo de instrucciones mientras se cumpla una condición.', minutes: 9, example: 'Mientras i <= 2: mostrar i; i = i + 1', diagram: ['◇ ¿i <= 2?', '│ Sí: Mostrar i', '│      i = i + 1', '└── ↰ Volver al ciclo', 'No ↓ continuar'], steps: [
    step('1 · La condición va al principio', 'Si es falsa al comenzar, no se ejecuta el cuerpo ni una sola vez.', 'Localiza el bloque Mientras.'),
    step('2 · Añade el cuerpo', 'Los bloques que se repiten van “Dentro del ciclo”.', 'Coloca Salida y Asignar dentro del cuerpo de Mientras.'),
    step('3 · Evita ciclos infinitos', 'Actualiza i para que la condición deje de ser verdadera; el editor tiene un límite de seguridad.', 'Ejecuta paso a paso y observa i.')
  ] },
  { id: 'do', level: 6, block: 'Do', title: 'Hacer mientras: al menos una vez', summary: 'Ejecuta primero el cuerpo y comprueba la condición después.', minutes: 7, example: 'Con i = 0: hacer i = i + 1; mientras i < 3', diagram: ['↓ Entrar al cuerpo', '▭ i = i + 1', '↓', '◇ ¿i < 3?', 'Sí ↰ repetir · No ↓ salir'], steps: [
    step('1 · La diferencia esencial', 'Hacer mientras ejecuta el cuerpo antes de evaluar la condición.', 'Compara el ejemplo con Mientras.'),
    step('2 · Condición de repetición', 'Si la condición es verdadera, vuelve a comenzar el cuerpo.', 'Introduce una asignación dentro del ciclo.'),
    step('3 · Comprueba el resultado', 'Incluso con condición falsa inicialmente, el cuerpo se habrá ejecutado una vez.', 'Ejecuta paso a paso y anota cuántas veces se muestra la salida.')
  ] },
  { id: 'for', level: 7, block: 'For', title: 'Para: contar sin perderte', summary: 'Repite desde un inicio hasta un fin con paso definido.', minutes: 8, example: 'Para i = 1 hasta 4, paso 1', diagram: ['▤ Declarar i', '↓', '◇ Para i=1…4', '│ Mostrar i', '└── ↰ siguiente i'], steps: [
    step('1 · Variable contadora', 'La variable del ciclo Para tiene que ser Integer y estar declarada.', 'Busca i en Declarar.'),
    step('2 · Inicio, fin y paso', 'El ciclo recorre el rango de forma inclusiva. Dirección puede incrementar o decrementar.', 'Toca el bloque «Para», abre «Editar» y localiza sus controles.'),
    step('3 · Compara con Mientras', 'Para es ideal cuando sabes de antemano cuántas vueltas necesitas.', 'Recorre el ejemplo con Paso a paso.')
  ] },
  { id: 'comments', level: 7, block: 'Comment', title: 'Comenta y depura', summary: 'Documenta tu algoritmo y aprende a detectar errores.', minutes: 5, example: 'Declarar total; comentario; total = 2 + 3', diagram: ['▤ Declarar total', '↓', '☷ Comentario', '↓', '▭ total = 2 + 3'], steps: [
    step('1 · Notas', 'Comentario explica qué hace el programa, pero no modifica su resultado.', 'Inserta Comentario y escribe un mensaje.'),
    step('2 · Paso a paso', 'La consola muestra salidas; Variables muestra el estado; la línea resaltada indica dónde estás.', 'Usa Ejecutar y Reiniciar.'),
    step('3 · Comprueba, no adivines', 'Prueba los valores límite y casos distintos antes de dar por terminado un problema.', 'Completa los casos de prueba del reto.')
  ] },
  { id: 'accum', level: 8, block: 'While', title: 'Acumuladores', summary: 'Suma una secuencia completa de valores.', minutes: 10, example: 'suma = 0; Para i=1…n: suma = suma + i', diagram: ['▭ suma = 0', '↓', '◇ Para i=1…n', '│ suma = suma + i', '└── ↰ repetir', '↓ Mostrar suma'], steps: [
    step('1 · Inicializa la suma', 'Un acumulador comienza normalmente en 0.', 'Selecciona la asignación de suma.'),
    step('2 · Actualiza en cada vuelta', 'Después de cada iteración guarda suma + i en suma.', 'Inserta la operación dentro del ciclo.'),
    step('3 · Comprueba casos', 'Si n es 4, el resultado debe ser 1+2+3+4 = 10.', 'Prueba 0, 4 y 7.')
  ] },
  { id: 'factorial', level: 9, block: 'For', title: 'Reto avanzado: factorial', summary: 'Combina entrada, asignaciones y un ciclo.', minutes: 12, example: 'factorial = 1; para i=1…n: factorial = factorial * i', diagram: ['▱ Input n', '↓', '▭ factorial = 1', '↓', '◇ Para i=1…n', '│ factorial = factorial * i', '└── ↰ repetir', '↓ Mostrar factorial'], steps: [
    step('1 · Planifica', 'El factorial de 4 es 4×3×2×1 = 24. Por convenio, 0! = 1.', 'Traza a mano 0, 3 y 4.'),
    step('2 · Usa un producto acumulado', 'Comienza factorial en 1, no en 0, y multiplícalo por la variable del ciclo.', 'Ajusta la expresión del bloque Asignar.'),
    step('3 · Verifica', 'Comprobar reto ejecuta varias entradas automáticamente.', 'Prueba 0, 4 y 5 antes de pasar al siguiente nivel.')
  ] },
  { id: 'integrated', level: 10, block: 'If', title: 'Proyecto final: promedio y aprobación', summary: 'Une entrada, cuentas, decisiones y salida como un programador.', minutes: 15, example: 'Leer a,b,c → promedio = (a+b+c)/3 → Si promedio >= 6', diagram: ['▱ Input 3 notas', '↓', '▭ Calcular promedio', '↓', '◇ ¿promedio >= 6?', '↙ Aprobado   Reprobado ↘'], steps: [
    step('1 · Descompón el problema', 'Primero captura las notas, luego calcula el promedio y al final decide.', 'Identifica los bloques Entrada, Asignar y Si.'),
    step('2 · Respeta el tipo', 'Para un promedio con decimales utiliza Real.', 'Comprueba el tipo de la variable promedio.'),
    step('3 · Prueba límites', 'Un 6 debe aprobar; un promedio menor debe reprobar. Las salidas deben coincidir exactamente.', 'Prueba un caso que apruebe y otro que repruebe.')
  ] },
  { id: 'functions', level: 11, block: 'Assign', title: 'Funciones: reutiliza una solución', summary: 'Comprende Main, Llamar función y Retornar con un diagrama que salta de un lugar a otro.', minutes: 9, example: 'doble(x: Integer): Integer → Return x * 2', diagram: ['Main: Input numero', '↓', 'resultado = doble(numero)', '↳ doble(x: Integer): Integer', '  Return x * 2', '↰ Main: Output resultado'], steps: [
    step('1 · Una máquina pequeña', 'Una función es una mini-receta con nombre. La escribes una vez y puedes usarla muchas veces, como una máquina que recibe un número y entrega su doble.', 'En el diagrama identifica dónde está Main y dónde está la función doble.'),
    step('2 · Llamar cambia de diagrama', 'Main es el punto de partida. En Flowgorithm original, Asignar resultado = doble(numero) llama a doble para calcular un valor; luego el programa regresa a Main. Llamar función como bloque separado se usa para funciones sin valor de retorno.', 'Toca resultado = doble(numero) y luego Retornar para ver el salto y el regreso.'),
    step('3 · Retornar entrega un resultado', 'La función doble recibe un parámetro x de tipo Integer, calcula x * 2 y devuelve ese número. Main lo guarda en resultado y después lo muestra.', 'Abre Funciones en el editor y cambia el Retornar de doble para que devuelva x * 2.')
  ] },
  { id: 'parameters', level: 11, block: 'Return', title: 'Parámetros, argumentos y retorno', summary: 'Aprende a pasar dos valores y devolver una suma, sin confundir nombres ni tipos.', minutes: 10, example: 'sumar(a: Integer, b: Integer): Integer → Return a + b', diagram: ['Main: Input x, y', '↓', 'resultado = sumar(x, y)', '↳ sumar(a: Integer, b: Integer): Integer', '  Return a + b', '↰ Main: Output resultado'], steps: [
    step('1 · Parámetro vs. argumento', 'Parámetros son las cajitas de entrada que DEFINE la función: a y b. Argumentos son los valores REALES que le envía Main: por ejemplo 3 y 5.', 'Cambia los valores del laboratorio y mira cómo entran en a y b.'),
    step('2 · Los tipos importan', 'sumar(a: Integer, b: Integer) recibe dos enteros. El tipo de retorno Integer indica que devolverá un entero. Las variables de la función son locales, no sustituyen las de Main.', 'Observa cómo el resultado viaja de Retornar hasta la variable resultado de Main.'),
    step('3 · Reutiliza sin copiar', 'Puedes llamar sumar(3, 5) y después sumar(10, 2): la función es la misma, solo cambian los argumentos. Un error común es escribir a - b en vez de a + b.', 'En el editor, entra a Funciones → sumar, corrige Retornar a + b y verifica varios datos.')
  ] }
];

function proj(title: string, nodes: Record<string, FlowNode>): FlowProject {
  const mainId = functionId('main');
  return { id: projectId(`aula-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`), metadata: { title, author: 'Aula de lógica', version: '2' }, mainFunctionId: mainId,
    functions: { main: { id: mainId, name: 'Main', parameters: [], rootNodeId: nodeId('start'), nodes } } };
}
/** Proyecto con Main y una segunda función real: el ejercicio modifica su bloque Retornar. */
function functionProject(title:string,nodes:Record<string,FlowNode>,name:string,params:readonly {name:string;type:'Integer'|'Real'|'String'|'Boolean'}[],returnExpression:string):FlowProject {
  const basic=proj(title,nodes);
  const id=functionId(name);
  const helperNodes:Record<string,FlowNode>={
    helperStart:{id:nodeId('helperStart'),type:'Start',next:nodeId('helperReturn')},
    helperReturn:{id:nodeId('helperReturn'),type:'Return',expression:returnExpression,next:nodeId('helperEnd')},
    helperEnd:{id:nodeId('helperEnd'),type:'End'}
  };
  return {...basic,functions:{...basic.functions,[id]:{id,name,rootNodeId:nodeId('helperStart'),parameters:params.map(param=>({name:param.name,type:{kind:'Primitive',type:param.type}})),returnType:{kind:'Primitive',type:'Integer'},nodes:helperNodes}}};
}
const n = nodeId;
const S = (next: string): FlowNode => ({ id:n('start'),type:'Start',next:n(next) });
const E: FlowNode = { id:n('end'),type:'End' };
const O = (key: string, expression: string, next?: string): FlowNode => ({ id:n(key),type:'Output',expression,newLine:true,next:next ? n(next):undefined });
const A = (key:string,target:string,expression:string,next?:string): FlowNode => ({ id:n(key),type:'Assign',target,expression,next:next ? n(next):undefined });
const D = (key:string,name:string,dataType: 'Integer'|'Real'|'String'|'Boolean',next?:string): FlowNode => ({ id:n(key),type:'Declare',name,dataType,next:next ? n(next):undefined });
const I = (key:string,target:string,next?:string): FlowNode => ({ id:n(key),type:'Input',target,next:next ? n(next):undefined });
const T = (inputs: string[], expectedOutput: string): ExerciseTest => ({ inputs, expectedOutput });
function challenge(id:string,lessonId:string,level:number,title:string,skill:string,goal:string,hint:string,instructions:string[],tests: ExerciseTest[],requiredTypes: FlowNode['type'][], nodes: Record<string, FlowNode>): Exercise {
  return {id,lessonId,level,title,skill,goal,hint,instructions,tests,requiredTypes,project:proj(`Reto ${level} - ${title}`,nodes)};
}
export const exercises: readonly Exercise[] = [
 challenge('first-run','flow',1,'Mi primera ejecución','Inicio → Fin','Ejecuta y modifica el mensaje inicial para que aparezca exactamente Listo.', 'Selecciona Salida, cambia Expresión por "Listo" y aplica.', ['Haz clic en Salida.','En «Editar» introduce "Listo".','Pulsa «Aplicar cambios» y luego «Ejecutar».','Pulsa «Comprobar mi reto» para validar tu resultado.'],[T([],'Listo\n')],['Output'],{start:S('out'),out:O('out','"Cambia este texto"','end'),end:E}),
 challenge('hello-world','output',1,'Hola, mundo','Salida','Configura el bloque Salida para imprimir Hola, mundo.', 'El texto debe ir entre comillas dobles.', ['Selecciona Salida.','Pon "Hola, mundo" en Expresión.','Aplica cambios y comprueba.'],[T([],'Hola, mundo\n')],['Output'],{start:S('out'),out:O('out','"Tu saludo"','end'),end:E}),
 challenge('variable','declare',2,'Mi primera variable','Declarar','Agrega un bloque Declarar llamado edad de tipo Integer antes de Salida; el programa debe mostrar 0.', 'Selecciona Inicio, abre «Piezas», elige Declarar y colócalo después de Inicio.', ['Selecciona Inicio.','Pulsa Declarar.','Insértalo después de Inicio y configura edad / Integer.','Muestra edad y comprueba.'],[T([],'0\n')],['Declare','Output'],{start:S('out'),out:O('out','edad','end'),end:E}),
 challenge('sum','assign',2,'Suma 7 + 8','Asignar','Repara la operación total para imprimir 15.', 'Cambia la expresión de Asignar total por 7 + 8.', ['Selecciona Asignar total.','Cambia Expresión por 7 + 8.','Aplica y comprueba.'],[T([],'15\n')],['Declare','Assign','Output'],{start:S('d'),d:D('d','total','Integer','a'),a:A('a','total','0','out'),out:O('out','total','end'),end:E}),
 challenge('greeting','input',3,'Saludo interactivo','Entrada','Con cualquier nombre introducido, muestra Hola, NOMBRE (con coma y espacio).', 'Usa "Hola, " & nombre.', ['Revisa Declarar nombre / String.','Ejecuta y escribe Ada.','Cambia la expresión de Salida.','Comprueba varios nombres.'],[T(['Ada'],'Hola, Ada\n'),T(['Luz'],'Hola, Luz\n')],['Input','Output'],{start:S('d'),d:D('d','nombre','String','i'),i:I('i','nombre','out'),out:O('out','"Hola " & nombre','end'),end:E}),
 challenge('age','if',4,'Mayor de edad','Si / Sino','Añade un bloque Salida a cada rama del Si: Mayor si edad >= 18; Menor en caso contrario.', 'Elige Si y usa insertar En rama Sí / En rama No con el bloque Salida.', ['Selecciona el bloque Si.','Abre «Piezas», elige Salida y colócala en «Rama Sí» y configura "Mayor".','Selecciona de nuevo Si, agrega Salida en «Rama No» y configura "Menor".','Comprueba 17, 18 y 30.'],[T(['17'],'Menor\n'),T(['18'],'Mayor\n'),T(['30'],'Mayor\n')],['If','Input','Output'],{start:S('d'),d:D('d','edad','Integer','i'),i:I('i','edad','if'),if:{id:n('if'),type:'If',condition:'edad >= 18',next:n('end')},end:E}),
 challenge('even-odd','compare',4,'Par o impar','Condiciones','Corrige la condición y muestra Par para los pares e Impar para los impares.', 'numero % 2 = 0', ['Selecciona Si.','Usa % y = para la condición.','Comprueba con números positivos, negativos y cero.'],[T(['8'],'Par\n'),T(['7'],'Impar\n'),T(['0'],'Par\n'),T(['-3'],'Impar\n')],['If'],{start:S('d'),d:D('d','numero','Integer','i'),i:I('i','numero','if'),if:{id:n('if'),type:'If',condition:'numero > 0',trueNext:n('yes'),falseNext:n('no'),next:n('end')},yes:O('yes','"Par"'),no:O('no','"Impar"'),end:E}),
 challenge('counter','while',5,'Cuenta hasta cinco','Mientras','Corrige la condición de Mientras para que aparezca 1,2,3,4,5, cada uno en una línea.', 'El contador empieza en 1 y se incrementa después de mostrarlo.', ['Selecciona Mientras.','Revisa el valor de i tras cada vuelta.','Haz que también entre cuando i vale 5.','Comprueba.'],[T([],'1\n2\n3\n4\n5\n')],['While','Assign'],{start:S('d'),d:D('d','i','Integer','a'),a:A('a','i','1','while'),while:{id:n('while'),type:'While',condition:'i < 4',bodyNext:n('out'),next:n('end')},out:O('out','i','inc'),inc:A('inc','i','i + 1'),end:E}),
 challenge('do-once','do',6,'Hazlo al menos una vez','Hacer mientras','Cambia la condición para que el ciclo imprima 1,2,3, incluso si la condición se evalúa después del cuerpo.', 'El cuerpo inicia con una salida y luego incrementa i.', ['Lee el contador inicial.','Selecciona Hacer mientras.','Ajusta la condición para terminar cuando i valga 4.','Comprueba.'],[T([],'1\n2\n3\n')],['Do'],{start:S('d'),d:D('d','i','Integer','a'),a:A('a','i','1','do'),do:{id:n('do'),type:'Do',condition:'i < 2',bodyNext:n('out'),next:n('end')},out:O('out','i','inc'),inc:A('inc','i','i + 1'),end:E}),
 challenge('for-count','for',7,'Para: cuenta hasta cuatro','Para','Ajusta el límite del ciclo Para para mostrar 1,2,3,4.', 'Configura Fin=4, Paso=1, Incrementar.', ['Selecciona Para.','Observa Inicio, Fin, Paso y Dirección.','Cambia Fin.','Comprueba.'],[T([],'1\n2\n3\n4\n')],['For'],{start:S('d'),d:D('d','i','Integer','for'),for:{id:n('for'),type:'For',variable:'i',start:'1',end:'2',step:'1',direction:'Inc',bodyNext:n('out'),next:n('end')},out:O('out','i'),end:E}),
 challenge('documentation','comments',7,'Documenta tu solución','Comentario','Añade un comentario antes de Salida y cambia el mensaje final por Hecho.', 'Los comentarios no afectan la salida; el reto requiere un bloque Comentario.', ['Selecciona Inicio.','Inserta Comentario después y escribe tu explicación.','Configura Salida.','Comprueba.'],[T([],'Hecho\n')],['Comment','Output'],{start:S('out'),out:O('out','"Pendiente"','end'),end:E}),
 challenge('accumulate','accum',8,'Suma del 1 al N','Acumuladores','Corrige el acumulador para calcular la suma de 1 a N con un ciclo Para.', 'En el cuerpo del ciclo usa suma + i. Para N=4 debe dar 10.', ['Observa suma inicial en 0.','Selecciona Asignar dentro de Para.','Corrige la fórmula.','Comprueba varios N.'],[T(['0'],'0\n'),T(['4'],'10\n'),T(['7'],'28\n')],['For','Input','Assign'],{start:S('dn'),dn:D('dn','n','Integer','ds'),ds:D('ds','suma','Integer','di'),di:D('di','i','Integer','input'),input:I('input','n','init'),init:A('init','suma','0','for'),for:{id:n('for'),type:'For',variable:'i',start:'1',end:'n',step:'1',direction:'Inc',bodyNext:n('add'),next:n('out')},add:A('add','suma','suma + 0'),out:O('out','suma','end'),end:E}),
 challenge('factorial','factorial',9,'Factorial','Algoritmo combinado','Calcula n! con un ciclo Para y un acumulador. Debe funcionar para 0, 3, 4 y 5.', 'Inicializa factorial en 1. Luego multiplica factorial por i en cada vuelta.', ['Revisa la inicialización en 1.','Encuentra el bloque Asignar dentro del ciclo.','Cambia su expresión.','Comprueba cuatro casos.'],[T(['0'],'1\n'),T(['3'],'6\n'),T(['4'],'24\n'),T(['5'],'120\n')],['For','Assign','Input'],{start:S('dn'),dn:D('dn','n','Integer','df'),df:D('df','factorial','Integer','di'),di:D('di','i','Integer','input'),input:I('input','n','init'),init:A('init','factorial','1','for'),for:{id:n('for'),type:'For',variable:'i',start:'1',end:'n',step:'1',direction:'Inc',bodyNext:n('mul'),next:n('out')},mul:A('mul','factorial','factorial + i'),out:O('out','factorial','end'),end:E}),
 challenge('final-grades','integrated',10,'Proyecto final: promedios','Proyecto completo','Calcula promedio de tres notas y muestra Aprobado si es >= 6, o Reprobado en caso contrario.', 'Asegúrate de usar Real para el promedio y (a + b + c) / 3 como expresión.', ['Revisa las entradas a, b y c.','Corrige la asignación del promedio.','Comprueba la condición del Si.','Valida ambas ramas y valores límite.'],[T(['6','6','6'],'Aprobado\n'),T(['5','5','5'],'Reprobado\n'),T(['10','8','9'],'Aprobado\n'),T(['4','6','7'],'Reprobado\n')],['If','Input','Assign'],{start:S('da'),da:D('da','a','Real','db'),db:D('db','b','Real','dc'),dc:D('dc','c','Real','dp'),dp:D('dp','promedio','Real','ia'),ia:I('ia','a','ib'),ib:I('ib','b','ic'),ic:I('ic','c','calc'),calc:A('calc','promedio','a + b + c','if'),if:{id:n('if'),type:'If',condition:'promedio >= 6',trueNext:n('yes'),falseNext:n('no'),next:n('end')},yes:O('yes','"Aprobado"'),no:O('no','"Reprobado"'),end:E}),
 {id:'function-double',lessonId:'functions',level:11,title:'Repara la función doble',skill:'Llamar y Retornar',goal:'Main recibe un número, llama a doble(numero) y muestra el doble. Corrige el Retornar de la función doble para distintos valores.',hint:'En Funciones elige doble y cambia Retornar a x * 2. El parámetro x recibe cada número que escribe la persona.',instructions:['Abre Funciones del algoritmo y entra a doble(x).','Selecciona el bloque Retornar.','Escribe la expresión x * 2 y aplica los cambios.','Regresa a Main y pulsa Comprobar mi reto: probaremos números distintos.'],tests:[T(['3'],'6\n'),T(['7'],'14\n'),T(['0'],'0\n'),T(['-2'],'-4\n')],requiredTypes:['Assign','Input','Output'],project:functionProject('Reto funciones - doble',{
    start:S('d'),d:D('d','numero','Integer','dr'),dr:D('dr','resultado','Integer','i'),i:I('i','numero','call'),
    call:A('call','resultado','doble(numero)','out'),
    out:O('out','resultado','end'),end:E
  },'doble',[{name:'x',type:'Integer'}],'x + 1')},
 {id:'function-sum',lessonId:'parameters',level:11,title:'Suma usando parámetros',skill:'Parámetros y retorno',goal:'Main pasa dos enteros a sumar(a, b) desde Asignar, guarda el retorno y lo muestra. Corrige la función para que sume ambos valores.',hint:'En Funciones abre sumar. a y b son parámetros locales. Retornar debe calcular a + b, no a - b.',instructions:['Abre Funciones del algoritmo y selecciona sumar(a,b).','En Retornar cambia la expresión por a + b.','Vuelve a Main: observa cómo Asignar llama sumar(x, y).','Comprueba varios pares, incluso 0 y números negativos.'],tests:[T(['3','5'],'8\n'),T(['10','2'],'12\n'),T(['0','0'],'0\n'),T(['-4','2'],'-2\n')],requiredTypes:['Assign','Input','Output'],project:functionProject('Reto funciones - sumar',{
    start:S('dx'),dx:D('dx','x','Integer','dy'),dy:D('dy','y','Integer','dr'),dr:D('dr','resultado','Integer','ix'),
    ix:I('ix','x','iy'),iy:I('iy','y','call'),call:A('call','resultado','sumar(x, y)','out'),out:O('out','resultado','end'),end:E
  },'sumar',[{name:'a',type:'Integer'},{name:'b',type:'Integer'}],'a - b')}
];

export function findExercise(exerciseId: string): Exercise | undefined { return exercises.find(exercise => exercise.id === exerciseId); }
export function allowedExercise(exerciseId: string, completed: ReadonlySet<string>): boolean {
  const index = exercises.findIndex(exercise => exercise.id === exerciseId);
  return index >= 0 && (index === 0 || completed.has(exercises[index - 1].id));
}
export function gradeExercise(exercise: Exercise, func: import('../domain/models').FlowFunction, run: (inputs: readonly string[]) => {status: string; outputLog: string[]; error?: string}): { passed: boolean; feedback: readonly string[] } {
  const feedback: string[] = [];
  const types = new Set(Object.values(func.nodes).map(node => node.type));
  for (const type of exercise.requiredTypes) if (!types.has(type)) feedback.push(`Falta usar el bloque ${type}.`);
  for (let index = 0; index < exercise.tests.length; index++) {
    const test = exercise.tests[index];
    const result = run(test.inputs);
    if (result.status !== 'FINISHED' || result.outputLog.join('') !== test.expectedOutput) {
      const got = result.status === 'ERROR' ? `error: ${result.error}` : result.status === 'WAITING_INPUT' ? 'falta una entrada' : JSON.stringify(result.outputLog.join(''));
      feedback.push(`Prueba ${index + 1} (${test.inputs.length ? test.inputs.join(', ') : 'sin entrada'}): se esperaba ${JSON.stringify(test.expectedOutput)}, se obtuvo ${got}.`);
    }
  }
  return { passed: feedback.length === 0, feedback };
}
