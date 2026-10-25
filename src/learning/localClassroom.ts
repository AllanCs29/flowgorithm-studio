import { PracticeRecord } from './skillArcade';
export interface LearnerProfile {
 readonly id:string; readonly name:string; readonly completed:readonly string[];
 readonly practice:Readonly<Record<string,PracticeRecord>>;readonly assignments:readonly number[];
 readonly createdAt:number;readonly updatedAt:number;
}
export interface LocalClassroom {readonly version:1;readonly activeId:string;readonly profiles:readonly LearnerProfile[]}
export function createLearner(name:string,id:string,now=Date.now()):LearnerProfile {
 const clean=name.trim().slice(0,45);
 if(clean.length<1)throw new Error('El nombre del estudiante no puede estar vacío.');
 return {id,name:clean,completed:[],practice:{},assignments:[],createdAt:now,updatedAt:now};
}
export function defaultClassroom(existing:readonly string[]=[]):LocalClassroom {
 const student=createLearner('Mi progreso','alumno-1');return {version:1,activeId:student.id,profiles:[{...student,completed:[...new Set(existing)]}]};
}
export function activeLearner(data:LocalClassroom):LearnerProfile{return data.profiles.find(p=>p.id===data.activeId)??data.profiles[0];}
export function withLearner(data:LocalClassroom,id:string,update:(student:LearnerProfile)=>LearnerProfile):LocalClassroom {
 if(!data.profiles.some(p=>p.id===id))throw new Error('Estudiante no encontrado.');
 return {...data,profiles:data.profiles.map(p=>p.id===id?update(p):p)};
}
export function completeExercise(data:LocalClassroom,id:string,now=Date.now()):LocalClassroom {
 return withLearner(data,data.activeId,p=>({...p,completed:[...new Set([...p.completed,id])],updatedAt:now}));
}
export function assignExercise(data:LocalClassroom,studentId:string,challenge:number):LocalClassroom {
 if(!Number.isInteger(challenge)||challenge<1||challenge>100)throw new Error('Selecciona un reto del 1 al 100.');
 return withLearner(data,studentId,p=>({...p,assignments:[...new Set([...p.assignments,challenge])],updatedAt:Date.now()}));
}
export function validClassroom(raw:unknown):raw is LocalClassroom {
 if(!raw||typeof raw!=='object')return false;
 const data=raw as Partial<LocalClassroom>;
 if(data.version!==1 || !Array.isArray(data.profiles)||data.profiles.length===0||data.profiles.length>100 || typeof data.activeId!=='string')return false;
 const ids=new Set<string>();
 for(const p of data.profiles){
 if(!p||typeof p.id!=='string'||!p.id||p.id.length>120||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>45||!Array.isArray(p.completed)||p.completed.length>300||!p.completed.every((s:unknown)=>typeof s==='string'&&s.length<100)||!Array.isArray(p.assignments)||!p.assignments.every((x:unknown)=>Number.isInteger(x)&&Number(x)>=1&&Number(x)<=100)||!p.practice||typeof p.practice!=='object'||Array.isArray(p.practice))return false;
 ids.add(p.id);
 }
 return ids.has(data.activeId);
}
export function loadClassroom(storage:Pick<Storage,'getItem'>):LocalClassroom {
 try{const raw=storage.getItem('flowstudio:v10:classroom');if(raw){const parsed:unknown=JSON.parse(raw);if(validClassroom(parsed))return parsed;}}
 catch{/* Datos dañados: conservar progreso de v7 cuando sea posible. */}
 try{const previous:unknown=JSON.parse(storage.getItem('flowgorithm-studio:completed-exercises')||'[]');return defaultClassroom(Array.isArray(previous)?previous.filter((x):x is string=>typeof x==='string'):[]);}catch{return defaultClassroom();}
}
export function classroomCSV(data:LocalClassroom):string {
 const cell=(s:string)=>`"${s.replace(/"/g,'""')}"`;
 return ['Estudiante,Retos superados,Micropracticas correctas,Retos asignados',...data.profiles.map(p=>[cell(p.name),p.completed.length,Object.values(p.practice).filter(r=>r.successes>0).length,cell(p.assignments.join('; '))].join(','))].join('\r\n');
}
