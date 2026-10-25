import { Exercise, exercises, Lesson, lessons } from './learning';

export interface ConceptCheck {
  readonly question: string;
  readonly answers: readonly [string, string, string];
  readonly correct: number;
  readonly explanation: string;
  readonly hint?: string;
  readonly context?: string;
}

export const conceptChecks: Readonly<Record<string, ConceptCheck>> = {
  flow: { question: '¿Por dónde empieza un programa?', answers: ['Por el bloque Inicio', 'Por cualquier bloque', 'Por la consola'], correct: 0, explanation: 'Inicio marca la primera instrucción. Las flechas llevan hasta Fin.' },
  output: { question: '¿Cuál expresión muestra un texto literal?', answers: ['Hola', '"Hola"', '= Hola'], correct: 1, explanation: 'Las comillas indican texto. Sin ellas, el editor buscaría una variable llamada Hola.' },
  declare: { question: '¿Qué tipo usarías para guardar la edad 18?', answers: ['String', 'Boolean', 'Integer'], correct: 2, explanation: 'Integer representa números enteros; String representa texto.' },
  assign: { question: 'La cajita «total» contiene 3. Después de ejecutar total = total + 2, ¿qué número queda guardado en total?', context: 'Estamos en un bloque Asignar, no en una comparación: calculamos lo de la derecha y lo guardamos en total.', answers: ['5, porque 3 + 2 = 5', '3, porque no puede cambiar', 'Se comparan 3 y 2'], correct: 0, hint: 'Lee el valor que ya tiene total, súmale 2 y piensa dónde se guarda.', explanation: 'Primero se lee el 3 que estaba en total. Se calcula 3 + 2 = 5 y el bloque Asignar reemplaza el 3 por el 5. No es una comparación ni una instrucción para mostrar.' },
  input: { question: '¿Para qué sirve Entrada?', answers: ['Mostrar un dibujo', 'Pedir un dato y guardarlo', 'Terminar el programa'], correct: 1, explanation: 'Entrada espera un valor proporcionado por la persona y lo almacena en una variable declarada.' },
  if: { question: '¿Qué hace el bloque Si?', answers: ['Repite siempre una instrucción', 'Ejecuta ambas ramas', 'Elige una sola rama según la condición'], correct: 2, explanation: 'Si bifurca entre verdadero y falso. Para repetir se utilizan los ciclos.' },
  compare: { question: '¿Qué comprueba numero % 2 = 0?', answers: ['Que el número sea par', 'Que sea positivo', 'Que sea igual a 2'], correct: 0, explanation: 'El residuo de dividir un número par entre 2 es cero.' },
  while: { question: '¿Cuándo puede ejecutarse cero veces un Mientras?', answers: ['Nunca', 'Cuando la condición inicial es falsa', 'Después de diez vueltas'], correct: 1, explanation: 'Mientras evalúa su condición antes de ejecutar el cuerpo.' },
  do: { question: '¿Cuántas veces se ejecuta como mínimo Hacer mientras?', answers: ['Cero', 'Dos', 'Una'], correct: 2, explanation: 'Hacer mientras ejecuta el cuerpo antes de comprobar la condición.' },
  for: { question: '¿Qué ciclo es útil para contar de 1 a 5?', answers: ['Para', 'Si', 'Salida'], correct: 0, explanation: 'Para usa un contador con inicio, límite y paso.' },
  comments: { question: '¿Un comentario cambia el resultado del programa?', answers: ['Sí', 'No', 'Siempre termina el ciclo'], correct: 1, explanation: 'Los comentarios explican el código y no ejecutan operaciones.' },
  accum: { question: 'Para sumar 1 + 2 + 3, ¿qué operación repites?', answers: ['suma = 0 en cada vuelta', 'suma = i', 'suma = suma + i'], correct: 2, explanation: 'Un acumulador conserva el valor anterior y le añade el nuevo.' },
  factorial: { question: '¿Cuánto vale 4 factorial (4!)?', answers: ['24', '10', '16'], correct: 0, explanation: '4! = 4 × 3 × 2 × 1 = 24.' },
  functions: { question: 'Si Main asigna resultado = doble(4) y la función devuelve x * 2, ¿qué guarda en resultado?', answers: ['8', '4', 'La palabra doble'], correct: 0, hint: 'El argumento 4 entra en el parámetro x. Después se multiplica por 2.', explanation: 'Main envía el argumento 4. Dentro de doble, x vale 4: Retornar x * 2 entrega 8 a Main.' },
  parameters: { question: 'En sumar(a, b), Main llama sumar(3, 5). ¿Cuáles son los argumentos?', answers: ['a y b', '3 y 5', 'El tipo Integer'], correct: 1, hint: 'Los argumentos son los datos concretos que enviamos al llamar.', explanation: 'a y b son parámetros declarados al crear la función; 3 y 5 son los argumentos enviados por Main.' },
  integrated: { question: '¿Qué recorrido calcula y clasifica un promedio?', answers: ['Mostrar → Inicio', 'Leer → calcular → decidir → mostrar', 'Si → mostrar sin leer'], correct: 1, explanation: 'Se capturan los datos, se calcula el resultado, se comprueba la condición y se muestra la respuesta.' }
};

export function exerciseForLesson(lessonId: string): Exercise | undefined {
  return exercises.find(exercise => exercise.lessonId === lessonId);
}

export function nextExercise(completed: ReadonlySet<string>): Exercise {
  return exercises.find(exercise => !completed.has(exercise.id)) ?? exercises[exercises.length - 1];
}

export function lessonUnlocked(lessonId: string, completed: ReadonlySet<string>): boolean {
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  if (index < 0) return false;
  if (index === 0) return true;
  const previousExercise = exerciseForLesson(lessons[index - 1].id);
  return previousExercise ? completed.has(previousExercise.id) : true;
}

export function lessonCompleted(lessonId: string, completed: ReadonlySet<string>): boolean {
  const exercise = exerciseForLesson(lessonId);
  return exercise ? completed.has(exercise.id) : false;
}

export function levelStatus(level: number, completed: ReadonlySet<string>): 'completed'|'active'|'locked' {
  const current = lessons.filter(lesson => lesson.level === level);
  if (current.length === 0) return 'locked';
  if (current.every(lesson => lessonCompleted(lesson.id, completed))) return 'completed';
  return current.some(lesson => lessonUnlocked(lesson.id, completed)) ? 'active' : 'locked';
}

export function levelLessons(): readonly {level: number; lessons: readonly Lesson[]}[] {
  return [...new Set(lessons.map(item => item.level))].map(level => ({level, lessons: lessons.filter(item => item.level === level)}));
}

export function percentage(completed: ReadonlySet<string>): number {
  return Math.round(100 * exercises.filter(exercise => completed.has(exercise.id)).length / exercises.length);
}
