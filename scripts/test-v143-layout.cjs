/* Contrato complementario para detectar regresiones de la interfaz de iPhone. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('src/ui/App.tsx','utf8');
const css=fs.readFileSync('src/ui/v14-3-mobile.css','utf8');
const lesson=fs.readFileSync('src/learning/learning.ts','utf8');
for(const fragment of ['v143-mobile-code','setPanel(\'review\')','exerciseCriteria(activeExercise)','nextLessonFromExercise()'])assert(app.includes(fragment),`Falta: ${fragment}`);
assert(css.includes('max-height:53dvh'),'Los paneles deben ser cortos y desplazables.');
assert(css.includes('.v7-simulator.expanded .v7-simulator-controls{display:none!important}'),'Oculta los controles duplicados del simulador.');
assert(lesson.includes('No hay un número obligatorio'),'La consigna de edad no debe exigir un resultado constante.');
assert(fs.readFileSync('src/main.tsx','utf8').includes("import './ui/v14-3-mobile.css'"));
console.log('OK: v14.3 evaluador, navegación y paneles móviles comprobados estructuralmente.');
