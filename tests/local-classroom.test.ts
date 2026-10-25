import {describe,expect,it} from 'vitest';
import {createLearner,defaultClassroom,activeLearner,assignExercise,classroomCSV,completeExercise,loadClassroom,validClassroom,withLearner} from '../src/learning/localClassroom';
describe('progreso multi-perfil local',()=>{
 it('migra progreso existente, evita duplicados y mantiene un perfil',()=>{
  const base=defaultClassroom(['first-run','first-run']);
  expect(activeLearner(base).completed).toEqual(['first-run']);
  expect(completeExercise(completeExercise(base,'age'),'age').profiles[0].completed).toEqual(['first-run','age']);
 });
 it('perfiles y asignaciones quedan separados',()=>{
  const base=defaultClassroom();
  const second=createLearner('Ada','ada',22);
  const c={...base,profiles:[...base.profiles,second],activeId:'ada'};
  const assigned=assignExercise(c,'ada',98);
  const completed=completeExercise(assigned,'bank-098');
  expect(activeLearner(completed).completed).toEqual(['bank-098']);
  expect(completed.profiles[0].completed).toEqual([]);
  expect(completed.profiles[1].assignments).toEqual([98]);
  expect(()=>assignExercise(c,'ada',101)).toThrow();
 });
 it('valida respaldos y escapa las comillas del CSV',()=>{
  const c=defaultClassroom();
  expect(validClassroom(c)).toBe(true);
  expect(validClassroom({...c,activeId:'inexistente'})).toBe(false);
  expect(validClassroom({...c,profiles:[]})).toBe(false);
  const csv=classroomCSV(withLearner(c,c.activeId,p=>({...p,name:'Alumno "A"'})));
  expect(csv).toContain('"Alumno ""A"""');
 });
 it('carga desde almacenamiento o importa el progreso heredado',()=>{
  const loaded=loadClassroom({getItem:(key:string)=>key==='flowgorithm-studio:completed-exercises'?'["first-run"]':null});
  expect(activeLearner(loaded).completed).toEqual(['first-run']);
 });
});
