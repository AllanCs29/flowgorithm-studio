/** Recorridos explicativos: cada instante se corresponde con un bloque real del ejemplo.
 * No ejecutan el motor ni sustituyen a los retos: son modelos pequeños para aprender a seguir flechas.
 */
export type VisualKind = 'start'|'declare'|'assign'|'input'|'output'|'decision'|'loop'|'comment'|'call'|'return'|'end';
export type VisualLane = 'main'|'yes'|'no'|'body'|'exit'|'callee';
export interface VisualBlock { readonly id:string; readonly label:string; readonly kind:VisualKind; readonly lane?:VisualLane; }
export interface VisualMoment {
  readonly block:string;
  readonly description:string;
  readonly memory?:Readonly<Record<string,string>>;
  readonly output?:string;
  readonly route?:string;
}
export interface VisualScenario {
  readonly intro:string;
  readonly mode?:'linear'|'branch'|'loop'|'do'|'function';
  readonly blocks:readonly VisualBlock[];
  readonly moments:readonly VisualMoment[];
}
const B=(id:string,label:string,kind:VisualKind,lane:VisualLane='main'):VisualBlock=>({id,label,kind,lane});
const M=(block:string,description:string,memory?:Readonly<Record<string,string>>,output?:string,route?:string):VisualMoment=>({block,description,memory,output,route});

export const visualLessons:Readonly<Record<string,VisualScenario>> = {
  flow: {intro:'Las flechas indican el orden: inicio, instrucción y final.',blocks:[B('start','Main','start'),B('out','Output "Hola"','output'),B('end','End','end')],moments:[
    M('start','Aquí comienza el programa. Todavía no ha mostrado nada.'),
    M('out','El programa sigue la flecha y escribe Hola en la pantalla.',{},'Hola'),
    M('end','Llegó a End. Ya no hay más instrucciones.',{},'Hola')
  ]},
  output: {intro:'Mostrar es como hablarle a la pantalla; las comillas marcan texto literal.',blocks:[B('start','Main','start'),B('out','Output "Hola, mundo"','output'),B('end','End','end')],moments:[
    M('start','El programa se prepara para mostrar un mensaje.'),
    M('out','Se muestra el texto entre comillas. Las comillas no aparecen en el resultado.',{},'Hola, mundo'),
    M('end','La ejecución termina y el mensaje permanece en Resultado.',{},'Hola, mundo')
  ]},
  declare: {intro:'Una variable es una cajita con nombre. Su tipo indica qué puede guardar.',blocks:[B('start','Main','start'),B('d','Integer edad','declare'),B('out','Output edad','output'),B('end','End','end')],moments:[
    M('start','Todavía no existe la cajita edad.'),
    M('d','Creamos una sola cajita llamada edad. Integer acepta enteros como 0, 18 y -2. No es un arreglo.',{edad:'0'}),
    M('out','Mostrar edad consulta el número guardado en la cajita (no el texto "edad").',{edad:'0'},'0'),
    M('end','La variable existió durante la ejecución; ahora el programa terminó.',{edad:'0'},'0')
  ]},
  assign: {intro:'En el bloque Asignar, = significa «calcula la expresión y guarda el resultado en la variable».',blocks:[B('d','Integer total','declare'),B('a','total = 7 + 8','assign'),B('out','Output total','output')],moments:[
    M('d','Primero declaramos la variable total. Integer empieza con 0, pero ese NO es el resultado de 7 + 8: todavía no hemos ejecutado el bloque Asignar.',{total:'0'}),
    M('a','Ahora sí: leemos 7 + 8, calculamos 15 y sustituimos el 0 inicial de total por 15. Esta operación sucede en el bloque Asignar.',{total:'15'}),
    M('out','Mostrar total lee el nuevo contenido de la cajita y escribe 15.',{total:'15'},'15')
  ]},
  input: {intro:'Entrada recibe un dato de la persona; Salida muestra un resultado.',blocks:[B('d','String nombre','declare'),B('i','Input nombre','input'),B('out','Output "Hola " & nombre','output')],moments:[
    M('d','Creamos nombre de tipo String: una cajita para texto.',{nombre:'""'}),
    M('i','Imagina que la persona escribe Ada. Entrada guarda ese texto dentro de nombre.',{nombre:'"Ada"'}),
    M('out','El símbolo & une el texto "Hola " con el contenido de nombre; + se reserva para sumar números.',{nombre:'"Ada"'},'Hola Ada')
  ]},
  if: {intro:'Un rombo hace una pregunta. Solo se recorre una rama: Sí o No.',mode:'branch',blocks:[
    B('i','Input edad','input'),B('cond','¿edad >= 18?','decision'),B('yes','Output "Mayor"','output','yes'),B('no','Output "Menor"','output','no'),B('end','Continuar','end','exit')
  ],moments:[
    M('i','Probamos con una persona de 17 años.',{edad:'17'}),
    M('cond','¿17 es mayor o igual que 18? No: la condición es falsa.',{edad:'17'},undefined,'No'),
    M('no','Seguimos únicamente la rama No; la rama Sí no se ejecuta.',{edad:'17'},'Menor','No'),
    M('end','Las dos rutas se juntan después de la decisión.',{edad:'17'},'Menor')
  ]},
  compare: {intro:'% calcula el residuo. Un número par deja residuo 0 al dividirlo entre 2.',mode:'branch',blocks:[
    B('i','Input numero','input'),B('cond','¿numero % 2 = 0?','decision'),B('yes','Output "Par"','output','yes'),B('no','Output "Impar"','output','no'),B('end','Continuar','end','exit')
  ],moments:[
    M('i','Imaginamos que la persona escribe 8.',{numero:'8'}),
    M('cond','8 dividido entre 2 no deja residuo: 8 % 2 vale 0. La condición es verdadera.',{numero:'8'},undefined,'Sí'),
    M('yes','Se toma únicamente la rama Sí y se muestra Par.',{numero:'8'},'Par','Sí'),
    M('end','Al terminar la rama, el programa sigue hacia abajo.',{numero:'8'},'Par')
  ]},
  while: {intro:'Mientras pregunta ANTES de cada vuelta. El contador debe cambiar para poder salir.',mode:'loop',blocks:[
    B('init','i = 1','assign'),B('cond','¿i <= 2?','loop'),B('out','Output i','output','body'),B('inc','i = i + 1','assign','body'),B('end','Salir del ciclo','end','exit')
  ],moments:[
    M('init','El contador empieza en 1.',{i:'1'}),
    M('cond','¿1 <= 2? Sí: entramos a la primera vuelta.',{i:'1'},undefined,'Sí'),
    M('out','Primera vuelta: mostramos 1.',{i:'1'},'1'),
    M('inc','Aumentamos i de 1 a 2 y regresamos a la condición.',{i:'2'},'1','↺ Volver'),
    M('cond','¿2 <= 2? Sí: hacemos otra vuelta.',{i:'2'},'1','Sí'),
    M('out','Segunda vuelta: mostramos 2.',{i:'2'},'1\n2'),
    M('inc','Aumentamos i de 2 a 3 y regresamos a preguntar.',{i:'3'},'1\n2','↺ Volver'),
    M('cond','¿3 <= 2? No: ya no entramos al cuerpo.',{i:'3'},'1\n2','No'),
    M('end','Salimos del ciclo. Se mostraron dos números.',{i:'3'},'1\n2')
  ]},
  do: {intro:'Hacer mientras ejecuta el cuerpo primero y pregunta después: siempre hay al menos una vuelta.',mode:'do',blocks:[
    B('init','i = 0','assign'),B('inc','i = i + 1','assign','body'),B('cond','¿i < 3?','loop'),B('end','Salir del ciclo','end','exit')
  ],moments:[
    M('init','Empezamos con i igual a 0.',{i:'0'}),
    M('inc','Primera vuelta: incrementamos i y ahora vale 1.',{i:'1'}),
    M('cond','¿1 < 3? Sí: volvemos al cuerpo.',{i:'1'},undefined,'Sí: ↺'),
    M('inc','Segunda vuelta: incrementamos i y ahora vale 2.',{i:'2'}),
    M('cond','¿2 < 3? Sí: volvemos al cuerpo.',{i:'2'},undefined,'Sí: ↺'),
    M('inc','Tercera vuelta: incrementamos i y ahora vale 3.',{i:'3'}),
    M('cond','¿3 < 3? No: salimos del ciclo.',{i:'3'},undefined,'No'),
    M('end','El cuerpo se ejecutó tres veces.',{i:'3'})
  ]},
  for: {intro:'Para es un contador automático: empieza en 1, avanza de 1 en 1 y llega hasta 4.',mode:'loop',blocks:[
    B('d','Integer i','declare'),B('cond','Para i = 1…4','loop'),B('out','Output i','output','body'),B('end','Salir del ciclo','end','exit')
  ],moments:[
    M('d','Declaramos una cajita para el contador i.',{i:'0'}),
    M('cond','El ciclo coloca i = 1 y comprueba que aún está dentro del rango.',{i:'1'},undefined,'Sí'),
    M('out','Primera vuelta: mostramos 1.',{i:'1'},'1'),
    M('cond','Para aumenta i a 2 automáticamente.',{i:'2'},'1','↺ Siguiente'),
    M('out','Segunda vuelta: mostramos 2.',{i:'2'},'1\n2'),
    M('cond','Para aumenta i a 3 automáticamente.',{i:'3'},'1\n2','↺ Siguiente'),
    M('out','Tercera vuelta: mostramos 3.',{i:'3'},'1\n2\n3'),
    M('cond','Para aumenta i a 4 automáticamente.',{i:'4'},'1\n2\n3','↺ Siguiente'),
    M('out','Cuarta vuelta: mostramos 4.',{i:'4'},'1\n2\n3\n4'),
    M('end','Cuando el contador sale del rango, el programa continúa.',{i:'5'},'1\n2\n3\n4')
  ]},
  comments: {intro:'Un comentario es una nota para humanos: no cambia los números ni el resultado.',blocks:[
    B('d','Integer total','declare'),B('c','Comentario: explicar la suma','comment'),B('a','total = 2 + 3','assign'),B('out','Output total','output')
  ],moments:[
    M('d','Primero creamos la cajita total para guardar un entero.',{total:'0'}),
    M('c','Leemos una nota que explica la intención del algoritmo. No cambia ningún valor.',{total:'0'}),
    M('a','La operación guarda 5 en la cajita total.',{total:'5'}),
    M('out','Mostrar lee total y escribe 5.',{total:'5'},'5')
  ]},
  accum: {intro:'Aquí sumaremos 1, 2 y 3. Un acumulador recuerda el total anterior y le añade lo nuevo.',mode:'loop',blocks:[
    B('init','suma = 0','assign'),B('cond','Para i = 1…3','loop'),B('a','suma = suma + i','assign','body'),B('out','Output suma','output','exit')
  ],moments:[
    M('init','La suma comienza en cero: nuestra cajita está vacía de cantidades.',{suma:'0'}),
    M('cond','Primera vuelta: i vale 1.',{suma:'0',i:'1'},undefined,'Sí'),
    M('a','Tomamos la suma anterior (0), añadimos el valor actual de i (1) y guardamos 1 en la cajita suma.',{suma:'1',i:'1'}),
    M('cond','Segunda vuelta: i vale 2.',{suma:'1',i:'2'},undefined,'↺ Volver'),
    M('a','Ahora guardamos 1 + 2 = 3, sin perder lo anterior.',{suma:'3',i:'2'}),
    M('cond','Tercera vuelta: i vale 3.',{suma:'3',i:'3'},undefined,'↺ Volver'),
    M('a','Tomamos la suma anterior (3), añadimos el valor actual de i (3) y guardamos 6 como nuevo total.',{suma:'6',i:'3'}),
    M('out','El ciclo termina y mostramos la suma final.',{suma:'6',i:'4'},'6')
  ]},
  factorial: {intro:'Para un factorial multiplicamos una secuencia. Empezamos en 1, no en 0.',mode:'loop',blocks:[
    B('i','Input n','input'),B('init','factorial = 1','assign'),B('cond','Para i = 1…n','loop'),B('a','factorial = factorial * i','assign','body'),B('out','Output factorial','output','exit')
  ],moments:[
    M('i','Probamos con n igual a 3.',{n:'3'}),
    M('init','La cajita factorial comienza en 1. Si comenzara en 0, todo producto sería 0.',{n:'3',factorial:'1'}),
    M('cond','Primera vuelta: i vale 1.',{n:'3',i:'1',factorial:'1'},undefined,'Sí'),
    M('a','1 × 1 = 1: guardamos el producto.',{n:'3',i:'1',factorial:'1'}),
    M('cond','Segunda vuelta: i vale 2.',{n:'3',i:'2',factorial:'1'},undefined,'↺ Volver'),
    M('a','1 × 2 = 2: actualizamos factorial.',{n:'3',i:'2',factorial:'2'}),
    M('cond','Tercera vuelta: i vale 3.',{n:'3',i:'3',factorial:'2'},undefined,'↺ Volver'),
    M('a','2 × 3 = 6. Ahora tenemos 3!.',{n:'3',i:'3',factorial:'6'}),
    M('out','Mostramos 6 como resultado.',{n:'3',factorial:'6'},'6')
  ]},
  functions: functionScenario('functions',4),
  parameters: functionScenario('parameters',3,5),
  integrated: {intro:'Un programa completo suele seguir cuatro pasos: leer, calcular, decidir y mostrar.',mode:'branch',blocks:[
    B('i','Input tres notas','input'),B('a','promedio = (a+b+c)/3','assign'),B('cond','¿promedio >= 6?','decision'),B('yes','Output "Aprobado"','output','yes'),B('no','Output "Reprobado"','output','no'),B('end','End','end','exit')
  ],moments:[
    M('i','La persona introduce tres notas numéricas.',{a:'6',b:'7',c:'8'}),
    M('a','Calculamos (6+7+8)/3 = 7. Real permite guardar decimales.',{a:'6',b:'7',c:'8',promedio:'7'}),
    M('cond','¿7 es mayor o igual que 6? Sí: elegimos una sola ruta.',{promedio:'7'},undefined,'Sí'),
    M('yes','Mostramos Aprobado. La otra salida no se ejecuta.',{promedio:'7'},'Aprobado','Sí'),
    M('end','Terminamos después de la rama seleccionada.',{promedio:'7'},'Aprobado')
  ]}
};


/** Modelo guiado: muestra Main y el diagrama de la función por separado.
 * Mantiene los nombres, tipos y bloques que se usan en el ejercicio del editor.
 */
export function functionScenario(kind:'functions'|'parameters',first:number,second=5):VisualScenario {
  const a=Math.round(Number.isFinite(first)?first:4),b=Math.round(Number.isFinite(second)?second:5);
  const sum=kind==='parameters';
  const label=sum?'sumar':'doble';
  const result=sum?a+b:a*2;
  const header=sum?'sumar(a: Integer, b: Integer): Integer':'doble(x: Integer): Integer';
  const expression=sum?'a + b':'x * 2';
  const mainArgs=sum?'x, y':'numero';
  const assigned:Record<string,string>=sum?{x:String(a),y:String(b),resultado:'0'}:{numero:String(a),resultado:'0'};
  const inside:Record<string,string>=sum?{...assigned,a:String(a),b:String(b)}:{...assigned,x:String(a)};
  const returned:Record<string,string>={...assigned,resultado:String(result)};
  return {
    mode:'function',
    intro:`Main llama a ${label}; el flujo salta al diagrama de esa función, ejecuta Retornar y vuelve a Main. Las variables locales de la función no son las mismas cajitas que las de Main.`,
    blocks:[
      B('main','Main','start'),
      B('dn',sum?'Integer x, y':'Integer numero','declare'),
      B('dr','Integer resultado','declare'),
      B('i',sum?'Input x, Input y':'Input numero','input'),
      B('call',`resultado = ${label}(${mainArgs})`,'assign'),
      B('out','Output resultado','output'),
      B('end','End','end'),
      B('helper',header,'start','callee'),
      B('ret',`Return ${expression}`,'return','callee')
    ],
    moments:[
      M('main','El programa comienza en Main. Todavía no se ha llamado a ninguna otra función.'),
      M('dn',`Declaramos las cajitas de Main para los datos que vamos a leer: ${sum?'x e y':'numero'}.`,sum?{x:'0',y:'0'}:{numero:'0'}),
      M('dr','Declaramos resultado como Integer. Empieza en 0, pero aún no es el valor calculado.',sum?{x:'0',y:'0',resultado:'0'}:{numero:'0',resultado:'0'}),
      M('i',`La persona introduce ${sum?`${a} y ${b}`:a}. Input guarda esos datos en las variables de Main.`,assigned),
      M('call',`La asignación resultado = ${label}(${mainArgs}) envía ${sum?`los argumentos ${a} y ${b}`:`el argumento ${a}`}. Ahora seguimos el recorrido dentro de la función.`,assigned,undefined,`Main → ${label}`),
      M('helper',`Al entrar, ${sum?`los parámetros a y b reciben ${a} y ${b}`:`el parámetro x recibe ${a}`}. Son cajitas locales de ${label}.`,inside,undefined,`Dentro de ${label}`),
      M('ret',`Retornar calcula ${sum?`${a} + ${b}`:`${a} * 2`} = ${result} y entrega ese número a Main. Todavía no se ha mostrado en pantalla.`,inside,undefined,`${label} → Main: ${result}`),
      M('call',`Main retoma la ejecución y guarda el retorno ${result} dentro de resultado. Antes tenía 0; ahora tiene ${result}.`,returned,undefined,'Volver a Main'),
      M('out',`Output resultado lee la cajita resultado y muestra ${result} en pantalla.`,returned,String(result)),
      M('end','Llegamos a End: la función se utilizó y Main terminó sin volver a copiar la operación.',returned,String(result))
    ]
  };
}

/** La prueba de asignación debe mostrar exactamente los mismos datos que pregunta. */
export const quizVisualOverrides:Readonly<Record<string,VisualScenario>> = {
  assign: {intro:'Situación de la pregunta: total empieza con 3. Sigue el orden de los bloques para pensar qué ocurre después.',blocks:[
    B('d','Integer total','declare'),B('init','total = 3','assign'),B('a','total = total + 2','assign'),B('out','Output total','output')
  ],moments:[
    M('d','Creamos una cajita llamada total.',{total:'0'}),
    M('init','Primero guardamos el número 3 en total.',{total:'3'}),
    M('a','Leemos el valor 3, calculamos 3 + 2 = 5 y reemplazamos el contenido de la cajita.',{total:'5'}),
    M('out','Mostrar total imprime 5.',{total:'5'},'5')
  ]}
};

export function scenarioFor(lessonId:string,quiz=false):VisualScenario|undefined {
  return (quiz && quizVisualOverrides[lessonId]) || visualLessons[lessonId];
}

export function assertScenario(scenario:VisualScenario):boolean {
  const ids=new Set(scenario.blocks.map(block=>block.id));
  return ids.size===scenario.blocks.length && scenario.moments.length>0 && scenario.moments.every(moment=>ids.has(moment.block));
}

/** Ejemplo real de Flowgorithm: resultado dinámico de Entrada → Asignar → Salida. */
export function circleScenario(radius:number):VisualScenario {
  const clean = Math.min(10,Math.max(0,Number.isFinite(radius)?radius:3));
  const area = Number((Math.PI*clean**2).toFixed(4));
  const r=String(clean), a=String(area);
  return {
    intro:'Ejemplo completo de Flowgorithm. Escribe otro radio y recorre de nuevo las figuras.',
    blocks:[
      B('start','Main','start'),
      B('declare','Real area, radius','declare'),
      B('input','Input radius','input'),
      B('assign','area = pi * radius ^ 2','assign'),
      B('output','Output "The area is " & area','output'),
      B('end','End','end')
    ],
    moments:[
      M('start','Main es el comienzo. Las flechas nos dicen hacia dónde avanzar.'),
      M('declare','Declarar Real area, radius crea DOS cajitas de números decimales. Su 0 es inicial: todavía no hemos leído el radio ni calculado el área.',{area:'0',radius:'0'}),
      M('input',`Input radius espera una respuesta. En este ejemplo escribiste ${r}: ese valor se guarda en radius.`,{area:'0',radius:r}),
      M('assign',`pi vale aproximadamente 3.1416. El símbolo ^ significa potencia: ${r} ^ 2 es ${clean**2}. Calculamos pi × ${clean**2} ≈ ${a} y lo guardamos en area.`,{area:a,radius:r}),
      M('output',`Output une el texto entre comillas con el número guardado en area. El símbolo & sirve para juntar texto y valores.`,{area:a,radius:r},`The area is ${a}`),
      M('end','End indica que el programa ya terminó. La pantalla conserva el resultado.',{area:a,radius:r},`The area is ${a}`)
    ]
  };
}

/** Explica si una cifra se inicializó, vino de Entrada o cambió al ejecutar un bloque. */
export function memoryValueState(
  kind: VisualKind, current: string, previous?: string
): string {
  if (kind === 'declare') return 'Valor inicial al declarar';
  if (kind === 'input') return 'Dato recibido en Entrada';
  if (previous === undefined) return 'Valor en este paso';
  if (previous === current) return 'No cambió en este paso';
  return `Antes: ${previous} → ahora: ${current}`;
}
