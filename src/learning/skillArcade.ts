/** Retos autónomos de predicción, depuración y ordenación. No sustituye la evaluación del diagrama. */
export type MicroKind = 'predict' | 'debug' | 'order';
export type Skill = 'secuencia' | 'variables' | 'condiciones' | 'ciclos' | 'arreglos' | 'funciones';
export interface MicroTask {
  readonly id:string; readonly kind:MicroKind; readonly skill:Skill; readonly title:string;
  readonly prompt:string; readonly choices:readonly string[]; readonly correct:number;
  readonly explanation:string; readonly example:string;
}
export interface PracticeRecord { readonly attempts:number; readonly successes:number; readonly lastAt:number; readonly nextReviewAt:number; }
const task=(id:string,kind:MicroKind,skill:Skill,title:string,prompt:string,choices:string[],correct:number,explanation:string,example:string):MicroTask=>({id,kind,skill,title,prompt,choices,correct,explanation,example});
export const microTasks:readonly MicroTask[]=[
 task('s1','predict','secuencia','¿Por dónde empieza?','En Inicio → Salida → Fin, ¿qué bloque se ejecuta primero?',['Salida','Inicio','Fin'],1,'Inicio es siempre el punto de entrada.','Inicio → Mostrar "Hola" → Fin'),
 task('s2','order','secuencia','Arma tu saludo','¿Cuál es el orden válido para saludar?',['Inicio → Salida → Fin','Salida → Inicio → Fin','Fin → Inicio → Salida'],0,'Un programa parte de Inicio, muestra la salida y termina.','Toca una respuesta para ordenar el diagrama.'),
 task('s3','debug','secuencia','Texto sin comillas','Una Salida tiene expresión Hola y falla. ¿Qué cambiarías?',['Usar "Hola"','Añadir un ciclo','Cambiar Inicio'],0,'El texto literal va entre comillas; Hola sin comillas se interpreta como variable.','Mostrar "Hola"'),
 task('s4','predict','secuencia','Dos salidas','Salida "A" seguida de Salida "B". ¿Qué aparece primero?',['B','A','Nada'],1,'Las instrucciones siguen el orden del diagrama.','Inicio → Mostrar "A" → Mostrar "B" → Fin'),
 task('v1','predict','variables','La caja cambia','x = 3; x = x + 2. ¿Cuánto vale x?',['2','3','5'],2,'La segunda asignación toma el valor anterior (3) y suma 2.','Declarar x → x = 3 → x = x + 2'),
 task('v2','debug','variables','Arreglo o número','Quiero guardar una sola edad. ¿Cuál es la declaración correcta?',['Integer edad[25]','Integer edad','String edad[3]'],1,'Sin tamaño entre corchetes es una sola variable; con tamaño es un arreglo.','Declarar Integer edad'),
 task('v3','order','variables','Primero declara','¿Qué secuencia es correcta?',['Mostrar x → Declarar x','Declarar x → Asignar x = 4 → Mostrar x','Asignar x = 4 → Declarar x'],1,'Primero declaras, después asignas y finalmente muestras.','Declarar → Asignar → Salida'),
 task('v4','debug','variables','¿Por qué no calcula?','¿Qué falta si usas total = total + 1 y total no existe?',['Un bloque Si','Un bloque Declarar total','Un bloque Fin nuevo'],1,'No se puede asignar a una variable que no se ha declarado.','Declarar Integer total → Asignar'),
 task('c1','predict','condiciones','Mayor o menor','Si edad >= 18, con edad = 17, ¿qué ruta toma?',['Sí','No','Ambas'],1,'17 no cumple la condición, por lo que sigue la rama No.','Si edad >= 18 → Sí/No'),
 task('c2','debug','condiciones','Comparar paridad','¿Qué expresión detecta un número par?',['n % 2 = 0','n = n + 2','n / 2 > 0'],0,'El residuo al dividir entre 2 es cero para números pares.','Si n % 2 = 0'),
 task('c3','predict','condiciones','Dos caminos','¿Cuántas ramas ejecuta un Si en cada evaluación?',['Siempre dos','Una','Ninguna'],1,'If elige una de sus ramas; no es un ciclo.','◇ Si → Sí o No'),
 task('c4','debug','condiciones','Condición sin límite','Si nota > 6, ¿qué pasa con una nota exactamente igual a 6?',['Aprueba','No entra a la rama Sí','Se repite'],1,'La comparación > excluye 6; >= incluye 6.','nota >= 6'),
 task('l1','predict','ciclos','Contar tres','i=1; Mientras i <= 3: Mostrar i; i = i+1. ¿Cuántas veces muestra?',['2','3','4'],1,'Se ejecuta con i=1, 2 y 3; con 4 se detiene.','1 → 2 → 3 → salir'),
 task('l2','debug','ciclos','El ciclo infinito','Mientras i < 5, pero nunca actualizas i. ¿Qué falta?',['Una salida nueva','i = i + 1','Otro Inicio'],1,'La condición nunca cambia si no actualizas el contador.','Mientras i<5 → i = i+1'),
 task('l3','predict','ciclos','Hacer mientras','¿Cuántas veces corre como mínimo Hacer mientras?',['Una','Cero','Diez'],0,'Hacer ejecuta el cuerpo antes de comprobar la condición.','Hacer → acción → evaluar'),
 task('l4','order','ciclos','Acumulador','¿Qué secuencia suma de 1 a N?',['suma=0 → Para i: suma=suma+i → Mostrar suma','Mostrar suma → Declarar suma','suma=i → Reiniciar suma en cada vuelta'],0,'El acumulador se inicializa una sola vez fuera del ciclo.','suma = 0; repetir suma = suma + i'),
 task('a1','predict','arreglos','Índices iniciales','En datos=[9,4,7], ¿qué vale datos[0]?',['9','4','7'],0,'El primer índice de un arreglo es 0.','[0]=9 · [1]=4 · [2]=7'),
 task('a2','debug','arreglos','Índice fuera del rango','Un arreglo de tamaño 3 permite índices 0, 1, 2. ¿Cuál falla?',['datos[2]','datos[1]','datos[3]'],2,'El último índice válido es tamaño - 1.','Arreglo de 3 casillas'),
 task('a3','predict','arreglos','Matriz lineal','Una matriz de 3 columnas se guarda en un arreglo. Fila 1, columna 2, empezando por 0: índice...',['3','5','6'],1,'La posición lineal se calcula fila × columnas + columna = 1×3+2 = 5.','índice = fila * columnas + columna'),
 task('a4','debug','arreglos','No sumes todo en una celda','Para sumar todos los elementos de un arreglo necesitas...',['Un contador y acumulador','Solo una salida','Un único Si'],0,'Un ciclo recorre los índices y el acumulador va sumando.','suma = suma + datos[i]'),
 task('f1','predict','funciones','Parámetros','doble(x) retorna x*2. ¿Qué devuelve doble(6)?',['6','12','36'],1,'El parámetro x recibe 6 y la función retorna 12.','doble(6) → 12'),
 task('f2','debug','funciones','Retornar','Una función calcula un valor pero Main no lo recibe. ¿Qué hace falta?',['Un comentario','Retornar el resultado y usarlo en la llamada','Otro Fin'],1,'La función debe devolver un resultado para que el llamador lo use.','Retornar x * 2'),
 task('f3','predict','funciones','Caso base','En factorial recursivo, ¿por qué necesitamos caso base n <= 1?',['Para terminar las llamadas','Para dibujar','Para crear un arreglo'],0,'El caso base detiene la recursión.','factorial(1)=1'),
 task('f4','order','funciones','Divide el problema','¿Cuál es un buen orden para usar una función?',['Definir función → llamar desde Main → usar resultado','Llamar a función inexistente','Mostrar resultado antes de llamar'],0,'Una función definida debe llamarse y devolver un valor utilizable.','Main → doble(4) → 8')
];
/** Ordenar piezas de verdad, usable también con botones táctiles. */
export const orderingPuzzles:Readonly<Record<string,{initial:readonly string[];answer:readonly string[]}>>={
 s2:{initial:['Salida','Fin','Inicio'],answer:['Inicio','Salida','Fin']},
 v3:{initial:['Mostrar x','Declarar x','Asignar x = 4'],answer:['Declarar x','Asignar x = 4','Mostrar x']},
 l4:{initial:['Mostrar suma','Actualizar suma = suma + i','Inicializar suma = 0'],answer:['Inicializar suma = 0','Actualizar suma = suma + i','Mostrar suma']},
 f4:{initial:['Usar resultado','Llamar función','Definir función'],answer:['Definir función','Llamar función','Usar resultado']}
};
export function evaluateOrdering(task:MicroTask,parts:readonly string[]):{passed:boolean;message:string}{
 const puzzle=orderingPuzzles[task.id];
 if(task.kind!=='order'||!puzzle||parts.length!==puzzle.answer.length)return {passed:false,message:'Completa todas las piezas.'};
 const passed=parts.every((part,index)=>part===puzzle.answer[index]);
 return {passed,message:passed?`¡Bien! ${task.explanation}`:`Aún no. Pista: ${task.example}`};
}
export function evaluateMicro(task:MicroTask,choice:number):{passed:boolean;message:string}{
 if(!Number.isInteger(choice)||choice<0||choice>=task.choices.length)return {passed:false,message:'Selecciona una respuesta válida.'};
 return {passed:choice===task.correct,message:choice===task.correct?`¡Bien! ${task.explanation}`:`Aún no. Pista: ${task.example}`};
}
export function recordMicro(previous:PracticeRecord|undefined,passed:boolean,now=Date.now()):PracticeRecord {
 const successes=(previous?.successes??0)+(passed?1:0);
 const wait=passed ? [1,3,7,14,30][Math.min(successes-1,4)] * 86400000 : 3600000;
 return {attempts:(previous?.attempts??0)+1,successes,lastAt:now,nextReviewAt:now+wait};
}
export function recommendMicro(records:Readonly<Record<string,PracticeRecord>>,now=Date.now()):MicroTask {
 return microTasks.find(t=>records[t.id] && records[t.id].nextReviewAt<=now)
   ?? microTasks.find(t=>!records[t.id] || records[t.id].successes===0)
   ?? [...microTasks].sort((a,b)=>records[a.id].nextReviewAt-records[b.id].nextReviewAt)[0];
}
export function masteryBySkill(records:Readonly<Record<string,PracticeRecord>>):readonly {skill:Skill;mastery:number;answered:number;total:number}[] {
 return (['secuencia','variables','condiciones','ciclos','arreglos','funciones'] as const).map(skill=>{
 const items=microTasks.filter(t=>t.skill===skill);
 const answered=items.filter(t=>records[t.id]?.attempts).length;
 const score=items.reduce((sum,t)=>sum+Math.min(1,(records[t.id]?.successes??0)/2),0);
 return {skill,mastery:Math.round(score/items.length*100),answered,total:items.length};
 });
}
