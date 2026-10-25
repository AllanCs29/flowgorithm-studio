import { FlowFunction } from '../domain/models';
export interface CoachAdvice {readonly title:string;readonly cause:string;readonly firstStep:string;readonly lesson:string;}
/** Pistas diagnósticas basadas en el mensaje real, no en una solución inventada. */
export function coachAdvice(error:string,func:FlowFunction):CoachAdvice {
 const e=error.toLowerCase();
 if(e.includes('necesita un índice')||e.includes('no es un arreglo')||e.includes('fuera de rango'))return {title:'Revisa los índices de tus arreglos',cause:'Un arreglo contiene varias casillas, pero una variable común solo guarda un dato.',firstStep:'Si quieres guardar una sola edad, deja vacío «Tamaño del arreglo». Para datos múltiples usa nombre[índice].',lesson:'Arreglos y variables'};
 if(e.includes('no declar')||e.includes('no existe')||e.includes('desconocid'))return {title:'Primero crea la variable',cause:'El programa intenta usar un nombre que todavía no existe.',firstStep:'Inserta Declarar antes de usar Asignar, Entrada o Salida. Comprueba que los nombres coincidan.',lesson:'Variables'};
 if(e.includes('5 000')||e.includes('límite')||e.includes('infinito')||e.includes('demasiados pasos'))return {title:'Tu ciclo podría no terminar',cause:'La condición sigue siendo verdadera durante demasiados pasos.',firstStep:'Ejecuta paso a paso y observa el contador en Memoria viva. Asegúrate de actualizarlo.',lesson:'Ciclos'};
 if(e.includes('sintaxis')||e.includes('expresi')||e.includes('cadena')||e.includes('comillas'))return {title:'Comprueba la expresión',cause:'Quizá falta una comilla o el operador no es el esperado.',firstStep:'Revisa el ejemplo del inspector. Los textos van entre comillas y == compara valores.',lesson:'Expresiones'};
 const hasInput=Object.values(func.nodes).some(node=>node.type==='Input');
 return {title:'Depuremos tu algoritmo',cause:error||'La solución aún no coincide con todos los casos de prueba.',firstStep:hasInput?'Prueba una entrada sencilla y otra límite. Mira cada cambio de variable.':'Ejecuta paso a paso desde Inicio y compara el resultado con el objetivo.',lesson:'Depuración'};
}
