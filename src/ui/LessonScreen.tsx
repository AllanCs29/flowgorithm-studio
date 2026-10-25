import React, { useState } from 'react';
import { Lesson, lessons } from '../learning/learning';
import { conceptChecks } from '../learning/courseFlow';
import { VisualWalkthrough } from './VisualWalkthrough';

const beginnerNotes:Readonly<Record<string,{title:string;examples:readonly {name:string;meaning:string}[]}>> = {
  declare:{title:'Los cuatro tipos principales',examples:[
    {name:'Integer',meaning:'Números enteros, sin decimales: 0, 18, -4'},
    {name:'Real',meaning:'Números con decimales: 1.5, 8.75'},
    {name:'String',meaning:'Texto entre comillas: "Ana", "Hola"'},
    {name:'Boolean',meaning:'Solo verdadero (True) o falso (False)'}
  ]},
  assign:{title:'Dos cosas distintas',examples:[
    {name:'Declarar total',meaning:'Crear la cajita donde guardaremos datos.'},
    {name:'total = 5',meaning:'Dentro de un bloque Asignar, = guarda el resultado a la derecha dentro de la variable a la izquierda.'},
    {name:'total = total + 2',meaning:'En un bloque Asignar, usa el valor anterior de total, súmale 2 y guarda el nuevo.'}
  ]},
  input:{title:'Entrada no es lo mismo que Salida',examples:[
    {name:'Leer nombre',meaning:'Pide un dato y lo guarda en la cajita nombre.'},
    {name:'Mostrar nombre',meaning:'Enseña lo que contiene la cajita.'},
    {name:'Mostrar "nombre"',meaning:'Enseña literalmente la palabra nombre.'},
    {name:'"Hola " & nombre',meaning:'En Flowgorithm, & une dos partes de texto; + suma números.'}
  ]},
  if:{title:'La decisión en palabras',examples:[
    {name:'Si',meaning:'Si se cumple la pregunta, sigue el camino Sí.'},
    {name:'Sino',meaning:'Si no se cumple, sigue el camino No.'}
  ]}
};

const groundwork:Readonly<Record<string,readonly {title:string;body:string}[]>>={
  flow:[
    {title:'Antes de empezar: ¿qué es un algoritmo?',body:'Es una receta de pasos ordenados para resolver algo. Como preparar un sándwich: primero reunir ingredientes, luego prepararlo y al final servirlo.'},
    {title:'Las flechas son el camino',body:'Empieza en Main, sigue cada flecha de arriba hacia abajo y termina en End. La figura te dice qué acción ocurre.'},
    {title:'Un bloque a la vez',body:'Toca cada figura del dibujo para descubrir qué hace. No necesitas memorizarlo de golpe.'}
  ],
  output:[
    {title:'La pantalla no adivina',body:'Output es la forma de mostrar algo. Si quieres mostrar texto literal, escríbelo entre comillas dobles: "Hola".'},
    {title:'¿Comillas o sin comillas?',body:'"edad" es texto literal; edad sin comillas es el contenido de una variable llamada edad.'},
    {title:'Sigue lo que muestra el programa',body:'El bloque Output es un paralelogramo verde. Su función es enseñar un resultado, no pedirlo.'}
  ],
  declare:[
    {title:'Una variable es una cajita',body:'Primero la creas con Declare; después puedes guardar datos en ella. Cada variable tiene un nombre y un tipo.'},
    {title:'Un tipo decide qué cabe',body:'Integer: 4; Real: 4.5; String: "Ana"; Boolean: True o False. La cajita edad Integer es una sola variable, no una lista.'},
    {title:'¿Cómo se ve en Flowgorithm?',body:'Declare tiene forma de rectángulo dividido. Puedes escribir una variable (Integer edad) o varias del mismo tipo (Real area, radius).'}
  ],
  assign:[
    {title:'El = de Asignar no es una ecuación',body:'En un bloque Assign, total = 7 + 8 significa calcular 15 y guardarlo en la cajita total.'},
    {title:'Primero calcula, después guarda',body:'En total = total + 2, tomas el valor anterior de total, le sumas 2 y reemplazas el valor guardado.'},
    {title:'El tipo de bloque da sentido al =',body:'En Assign el = guarda; en el rombo de If, el = compara. Son acciones distintas aunque compartan signo.'}
  ],
  input:[
    {title:'Input pide, Output muestra',body:'Input radius espera que alguien escriba un radio. Output muestra el resultado al final.'},
    {title:'La variable tiene que existir',body:'Primero declara nombre como String o radius como Real. Después Input puede guardar el dato escrito.'},
    {title:'Para pegar textos usa &',body:'Output "Hola " & nombre une dos partes. En Flowgorithm, + se usa para sumar cantidades y & para concatenar textos.'}
  ]
};

export function LessonScreen({lesson,completed,onBack,onLaunch,onPreviousLesson}: {lesson:Lesson;completed:boolean;onBack:()=>void;onLaunch:()=>void;onPreviousLesson:()=>void}):React.ReactElement {
  const [stepIndex,setStepIndex]=useState(0);
  const [answer,setAnswer]=useState<number|null>(null);
  const [solved,setSolved]=useState(false);
  const quiz=conceptChecks[lesson.id];
  const isQuiz=stepIndex>=lesson.steps.length;
  const count=lesson.steps.length+1;
  const progress=100*(stepIndex+1)/count;
  const note=beginnerNotes[lesson.id];
  const foundation=groundwork[lesson.id]?.[stepIndex];
  const choose=(index:number)=>{if(solved)return;setAnswer(index);if(index===quiz.correct)setSolved(true);};
  const current=lesson.steps[stepIndex];
  return <div className="v5-lesson-screen v11-lesson-screen">
    <header className="v5-lesson-header">
      <button className="v5-back" onClick={onBack} aria-label="Volver a las clases">← <span>Clases</span></button>
      <div className="v5-lesson-heading"><small>NIVEL {lesson.level} · CLASE {stepIndex+1} DE {count}</small><strong>{lesson.title}</strong></div>
      <div className="v5-lesson-step-track" role="progressbar" aria-label="Progreso en la clase" aria-valuenow={stepIndex+1} aria-valuemin={0} aria-valuemax={count}><span style={{width:`${progress}%`}}/></div>
    </header>
    <main className="v5-lesson-content">
      <div className="v5-lesson-breadcrumb">1. APRENDE CON UN EJEMPLO <span>→</span> 2. COMPRUEBA <span>→</span> 3. PRACTICA</div>
      <div className="v5-lesson-body v11-lesson-body">
        <section className="v5-lesson-text v11-lesson-text" aria-label={isQuiz?'Pregunta de comprensión':'Explicación'}>
          <span className="v5-chip">{isQuiz?'PON A PRUEBA TU IDEA':`DESCUBRE · ${stepIndex+1}/${lesson.steps.length}`}</span>
          <h1>{isQuiz?quiz.question:current.title.replace(/^\d+\s*·\s*/,'')}</h1>
          {isQuiz?<>
            <p className="v11-quiz-context">{quiz.context??'Observa el ejemplo e imagina qué sucede al recorrer las flechas.'}</p>
            <div className="v5-answer-list" role="group" aria-label="Elige una respuesta">{quiz.answers.map((option,index)=><button
              className={`v5-answer ${answer===index?(solved&&index===quiz.correct?'correct':'wrong'):''}`}
              key={option} onClick={()=>choose(index)} disabled={solved} aria-pressed={answer===index}>
              <span>{String.fromCharCode(65+index)}</span>{option}{answer===index&&<b>{solved?'✓':'×'}</b>}
            </button>)}</div>
            {answer!==null&&<div role="status" className={`v5-quiz-feedback ${solved?'good':''}`}>
              <strong>{solved?'¡Exacto! Ya lo entendiste.':'Todavía no. Intenta de nuevo.'}</strong>
              <p>{solved?quiz.explanation:quiz.hint??'Sigue las flechas en orden y vuelve a leer la explicación anterior.'}</p>
              {!solved&&<button type="button" onClick={()=>setStepIndex(Math.max(0,lesson.steps.length-1))}>← Revisar la explicación</button>}
            </div>}
          </>:<>
            {foundation&&<div className="v12-foundation"><span>PRIMERO ENTENDAMOS</span><strong>{foundation.title}</strong><p>{foundation.body}</p></div>}
            <p className="v5-lesson-description">{current.body}</p>
            <div className="v5-lesson-action"><span>CUANDO ABRAS EL EDITOR</span><p>{current.action}</p></div>
            {note&&<details className="v11-beginner-details" open={lesson.id==='declare'&&stepIndex===1}>
              <summary>Explicado con ejemplos: {note.title} <span>⌄</span></summary>
              <div className="v11-note-table">{note.examples.map(example=><div key={example.name}><strong>{example.name}</strong><span>{example.meaning}</span></div>)}</div>
            </details>}
          </>}
        </section>
        <VisualWalkthrough lessonId={lesson.id} stepIndex={stepIndex} isQuiz={isQuiz} solved={solved}/>
      </div>
    </main>
    <footer className="v5-lesson-footer"><span>{completed?'✓ Puedes repetir esta clase para reforzar lo aprendido.':'Explora los bloques del ejemplo antes de continuar.'}</span>
      <div><button disabled={stepIndex===0&&lessons[0].id===lesson.id} onClick={()=>stepIndex===0?onPreviousLesson():setStepIndex(i=>Math.max(0,i-1))}>{stepIndex===0?'← Clase anterior':'← Anterior'}</button>
        {!isQuiz?<button className="v5-cta" onClick={()=>setStepIndex(i=>i+1)}>{stepIndex===lesson.steps.length-1?'Comprobar lo aprendido':'Continuar'} <span>→</span></button>
          :<button className="v5-cta" onClick={onLaunch} disabled={!solved}>{solved?'Practicar en el editor':'Responde para practicar'} <span>→</span></button>}
      </div>
    </footer>
  </div>;
}
