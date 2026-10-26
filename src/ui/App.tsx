import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sampleProject } from '../domain/sampleProject';
import { FlowNode, FlowProject, NodeId, FunctionId, TYPE_LABELS, functionId, nodeId, projectId } from '../domain/models';
import { validateProject, InsertPosition } from '../domain/structural';
import { CommandDispatcher, DispatchState } from '../application/commandDispatcher';
import { LayoutOptions } from '../layout/layoutEngine';
import { BlockPalette } from './BlockPalette';
import { PropertyInspector } from './PropertyInspector';
import { CodePanel } from './CodePanel';
import { FlowchartCanvas } from './FlowchartCanvas';
import { StructureTree } from '../accessibility/StructureTree';
import { toCoreIR } from '../generators/coreIR';
import { generateCode, LanguageId } from '../generators';
import { ExecutionContext, initialContext, runToCompletion, stepExecution } from '../interpreter/engine';
import { appendVisualFrame, initialVisualFrame, snapshot, visualFrame, VisualFrame } from '../interpreter/visualTrace';
import { VisualDebugger } from './VisualDebugger';
import { exportFprg, importFprg } from '../compatibility/flowgorithm/fprg';
import { loadLocal, openTextFile, saveLocal, saveTextFile } from '../storage/fileSystem';
import { Exercise, exerciseCriteria, gradeExercise, Lesson, lessons } from '../learning/learning';
import { exerciseForLesson, lessonCompleted } from '../learning/courseFlow';
import { guidedTarget } from '../learning/lessonGuidance';
import { firstIncompleteNode, incompleteMessage } from '../domain/blockCompleteness';
import { insertionLabel, insertionTargets } from './workspaceModel';
import { CourseHome } from './CourseHome';
import { LessonScreen } from './LessonScreen';
import { ChallengeLibrary } from './ChallengeLibrary';
import { challengeFor } from '../learning/challengeBank';
import { checkInteraction, InteractionEvent } from '../learning/interactionChallenges';
import { LocalClassroom, activeLearner, completeExercise, loadClassroom, withLearner } from '../learning/localClassroom';
import { recordMicro } from '../learning/skillArcade';
import { PracticeArcade } from './PracticeArcade';
import { LocalClassroomPanel } from './LocalClassroomPanel';
import { ProjectGallery } from './ProjectGallery';
import { CodeBridge } from './CodeBridge';
import { DebugCoach } from './DebugCoach';
import { MissionObjective } from './MissionObjective';
import { shouldGuide } from './missionGoal';

const COMPLETED_EXERCISES_KEY = 'flowgorithm-studio:completed-exercises';
const KNOWN_BLOCKS_KEY = 'flowgorithm-studio:seen-blocks';
const DRAFT_PREFIX = 'flowgorithm-studio:lesson-draft:';

type Screen = 'home'|'lesson'|'editor'|'library'|'practice'|'classroom'|'projects';
type EditorPanel = 'objective'|'functions'|'none'|'pieces'|'properties'|'console'|'code'|'variables'|'help'|'blockIntro'|'placement'|'steps'|'files'|'tree'|'bridge'|'review';

function loadSet(key:string):Set<string> {
  try { const stored = localStorage.getItem(key); const data:unknown = stored?JSON.parse(stored):[]; return new Set(Array.isArray(data)?data.filter((x):x is string=>typeof x==='string'):[]); }
  catch { return new Set(); }
}
function persistSet(key:string,value:ReadonlySet<string>):void {
  try {localStorage.setItem(key,JSON.stringify([...value]));} catch { /* La app funciona sin almacenamiento privado. */ }
}
function isProject(value:unknown):value is FlowProject {
  if (!value || typeof value !== 'object') return false;
  const project=value as Partial<FlowProject>;
  if (!project.functions || !project.mainFunctionId || !project.metadata || typeof project.metadata.title!=='string') return false;
  const main=project.functions[project.mainFunctionId];
  if (!main || !main.nodes || !main.rootNodeId || !main.nodes[main.rootNodeId]) return false;
  try {return validateProject(project as FlowProject).valid;} catch {return false;}
}

export function App():React.ReactElement {
  const [screen,setScreen]=useState<Screen>('home');
  const [classroom,setClassroom]=useState<LocalClassroom>(()=>loadClassroom(localStorage));
  const [lesson,setLesson]=useState<Lesson>(lessons[0]);
  const [state,setState]=useState<DispatchState>({project:sampleProject,selectedIds:new Set()});
  const stateRef=useRef(state);
  stateRef.current=state;
  const anchorRef=useRef<NodeId>(nodeId('start'));
  const [activeFunctionId,setActiveFunctionId]=useState<FunctionId>(state.project.mainFunctionId);
  const currentFunctionRef=useRef(activeFunctionId);currentFunctionRef.current=activeFunctionId;
  const dispatcherRef=useRef<CommandDispatcher|null>(null);
  if (!dispatcherRef.current) dispatcherRef.current=new CommandDispatcher(state,next=>setState(next),()=>anchorRef.current,()=>currentFunctionRef.current);
  const dispatcher=dispatcherRef.current;
  const [panel,setPanel]=useState<EditorPanel>('none');
  const [newFunctionName,setNewFunctionName]=useState('');
  const [newFunctionArgs,setNewFunctionArgs]=useState('');
  const [newFunctionType,setNewFunctionType]=useState<'Integer'|'Real'|'String'|'Boolean'>('Integer');
  const [activeExercise,setActiveExercise]=useState<Exercise|null>(null);
  const [completedExercises,setCompletedExercises]=useState<Set<string>>(()=>new Set(activeLearner(loadClassroom(localStorage)).completed));
  const [knownBlocks,setKnownBlocks]=useState<Set<string>>(()=>loadSet(KNOWN_BLOCKS_KEY));
  const [pendingType,setPendingType]=useState<FlowNode['type']|null>(null);
  const [learningBlock,setLearningBlock]=useState<FlowNode['type']|null>(null);
  const [missionStep,setMissionStep]=useState(0);
  const [guideEnabled,setGuideEnabled]=useState(false);
  const [showHint,setShowHint]=useState(false);
  const [feedback,setFeedback]=useState<readonly string[]>([]);
  const [passed,setPassed]=useState(false);
  const [language,setLanguage]=useState<LanguageId>('python');
  const [orientation,setOrientation]=useState<LayoutOptions['orientation']>('Vertical');
  const [execContext,setExecContext]=useState<ExecutionContext>(()=>initialContext(sampleProject.functions[sampleProject.mainFunctionId]));
  const [runMode,setRunMode]=useState<'step'|'all'>('step');
  const [frames,setFrames]=useState<VisualFrame[]>(()=>[initialVisualFrame(initialContext(sampleProject.functions[sampleProject.mainFunctionId]))]);
  const [frameCursor,setFrameCursor]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [playSpeed,setPlaySpeed]=useState(750);
  const [showInput,setShowInput]=useState(false);
  const [inputText,setInputText]=useState('');
  const [status,setStatus]=useState('Elige una lección para comenzar.');
  const [isFree,setIsFree]=useState(false);
  const [zoom,setZoom]=useState(1);
  const [interactionHistory,setInteractionHistory]=useState<InteractionEvent[]>([]);
  const recordAction=useCallback((action: InteractionEvent)=>setInteractionHistory(items=>[...items,action]),[]);
  const mainFunc=state.project.functions[state.project.mainFunctionId];
  const func=state.project.functions[activeFunctionId]??mainFunc;
  const selected=state.selectedIds.size===1?func.nodes[[...state.selectedIds][0]]:undefined;
  const chosenAnchor=selected?.id ?? func.rootNodeId;
  const destinations=insertionTargets(func.nodes[chosenAnchor]);

  useEffect(()=>{dispatcher.syncExternalState(state);},[dispatcher,state]);
  useEffect(()=>{try{localStorage.setItem('flowstudio:v10:classroom',JSON.stringify(classroom));}catch{/* Modo privado */}},[classroom]);
  const updateClassroom=(next:LocalClassroom)=>{setClassroom(next);setCompletedExercises(new Set(activeLearner(next).completed));};
  const recordPractice=(id:string,correct:boolean)=>setClassroom(prev=>withLearner(prev,prev.activeId,student=>({...student,practice:{...student.practice,[id]:recordMicro(student.practice[id],correct)},updatedAt:Date.now()})));
  const openPractice=()=>{setScreen('practice');setPanel('none');};
  const openClassroom=()=>{setScreen('classroom');setPanel('none');};
  const openProjects=()=>{setScreen('projects');setPanel('none');};
  useEffect(()=>{const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setPanel('none');setShowInput(false);setPendingType(null);}};window.addEventListener('keydown',onEscape);return ()=>window.removeEventListener('keydown',onEscape);},[]);
  useEffect(()=>{const initial=initialContext(mainFunc);setExecContext(initial);setFrames([initialVisualFrame(initial)]);setFrameCursor(0);setPlaying(false);setShowInput(false);setInputText('');},[mainFunc,state.project]);
  useEffect(()=>{if(activeExercise){try{localStorage.setItem(`${DRAFT_PREFIX}${classroom.activeId}:${activeExercise.id}`,JSON.stringify(state.project));}catch{/* no storage */}}},[activeExercise,state.project,classroom.activeId]);
  useEffect(()=>{try {const local=loadLocal();if(local){const parsed:unknown=JSON.parse(local);if(isProject(parsed)){setActiveFunctionId(parsed.mainFunctionId);setState({project:parsed,selectedIds:new Set()});}}}catch{/* Proyecto local opcional. */}},[]);
  const generated=useMemo(()=>{try {return {code:generateCode(toCoreIR(state.project,state.project.metadata.title||'FlowProgram'),language),error:''};}catch(error){return {code:'',error:error instanceof Error?error.message:String(error)};}},[state.project,language]);
  const currentStep=activeExercise?.instructions[Math.min(missionStep,activeExercise.instructions.length-1)];
  // Escritorio conserva la guía habitual; en teléfono se activa solo si el alumno la pide.
  const mobileEditor=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(max-width: 760px)').matches;
  const guidanceActive=shouldGuide(mobileEditor,guideEnabled);
  const targetNode=activeExercise&&guidanceActive?guidedTarget(func,currentStep??'',selected?.id):undefined;

  const openLesson=(target:Lesson)=>{setLesson(target);setScreen('lesson');setPanel('none');setStatus(`Clase: ${target.title}`);};
  const nextLessonFromExercise=()=>{
    if (!activeExercise || activeExercise.id.startsWith('bank-')) {library();return;}
    const index=lessons.findIndex(item=>item.id===activeExercise.lessonId);
    if(index>=0 && index<lessons.length-1)openLesson(lessons[index+1]);else home();
  };
  const home=()=>{setScreen('home');setPanel('none');setPendingType(null);setStatus('Tu avance está guardado en este navegador.');};
  const library=()=>{setScreen('library');setPanel('none');setPendingType(null);setStatus('Tus desafíos disponibles.');};
  const chooseExercise=(exercise:Exercise)=>{
    let project=exercise.project;
    try{const raw=localStorage.getItem(`${DRAFT_PREFIX}${classroom.activeId}:${exercise.id}`) ?? (classroom.activeId==='alumno-1'?localStorage.getItem(DRAFT_PREFIX+exercise.id):null);if(raw){const parsed:unknown=JSON.parse(raw);if(isProject(parsed))project=parsed;}}catch{/* Utilizar plantilla nueva si el borrador está dañado. */}
    setActiveFunctionId(project.mainFunctionId);setState({project,selectedIds:new Set()});
    const startContext=initialContext(project.functions[project.mainFunctionId]);
    setExecContext(startContext);setFrames([initialVisualFrame(startContext)]);setFrameCursor(0);setPlaying(false);
    setActiveExercise(exercise);setIsFree(false);setPassed(false);setMissionStep(0);setGuideEnabled(false);setFeedback([]);setShowHint(false);
    setInteractionHistory([]);setPendingType(null);setPanel('none');setZoom(1);setScreen('editor');setStatus('Toca un bloque del diagrama para comenzar.');
  };
  const startSelectedLesson=()=>{const exercise=exerciseForLesson(lesson.id);if(exercise)chooseExercise(exercise);};
  const startBankChallenge=(number:number)=>{const found=challengeFor(number);if(found)chooseExercise(found.exercise);};

  const selectNode=(id:NodeId,multi:boolean)=>{
    if(!id){dispatcher.setSelection(new Set());return;}
    const nextSelection=new Set(multi?stateRef.current.selectedIds:[]);
    if(multi&&nextSelection.has(id)) nextSelection.delete(id); else nextSelection.add(id);
    dispatcher.setSelection(nextSelection);anchorRef.current=id;
    recordAction({action:'select',type:func.nodes[id]?.type,id});
    if(func.nodes[id]?.type==='Output'&&!pendingType) recordAction({action:'edit',type:'Output',id});
    setPanel(pendingType?'placement':'properties');
    if(activeExercise && guidanceActive && missionStep===0 && (!targetNode || targetNode===id)) setMissionStep(1);
  };
  const insertAt=(position:InsertPosition,forcedAnchor?:NodeId,typeOverride?:FlowNode['type'])=>{
    const type=typeOverride??pendingType;
    if(!type){setPanel('pieces');return;}
    const anchor=forcedAnchor??chosenAnchor;
    const target=func.nodes[anchor]??func.nodes[func.rootNodeId];
    const actual=target.type==='End'&&position==='After'?'Before':position;
    const inserted=dispatcher.insert(type,target.id,actual);
    if(inserted){recordAction({action:'insert',type,id:inserted});anchorRef.current=inserted;dispatcher.setSelection(new Set([inserted]));setPanel('properties');setPendingType(null);setLearningBlock(null);setStatus(`Añadiste ${TYPE_LABELS[type]}. Ahora escribe sus datos; no hay respuestas prellenadas.`);}
    else {setStatus(dispatcher.getState().error??'No se pudo insertar aquí.');setPanel('placement');}
  };
  const beginInsert=(type:FlowNode['type'])=>{
    setPendingType(type);setLearningBlock(null);
    const choices=insertionTargets(func.nodes[chosenAnchor]);
    if(choices.length===1) insertAt(choices[0],chosenAnchor,type);
    else setPanel('placement');
  };
  const chooseBlock=(type:FlowNode['type'])=>{
    // En teléfono, tocar una pieza la inserta directamente. La explicación es opcional en ⓘ.
    if(window.matchMedia('(max-width: 760px)').matches){beginInsert(type);return;}
    if(!knownBlocks.has(type)){setLearningBlock(type);setPendingType(type);setPanel('blockIntro');}
    else beginInsert(type);
  };
  const confirmBlockTutorial=()=>{
    if(!learningBlock)return;
    const nextKnown=new Set(knownBlocks);nextKnown.add(learningBlock);setKnownBlocks(nextKnown);persistSet(KNOWN_BLOCKS_KEY,nextKnown);
    beginInsert(learningBlock);
  };
  const updateNode=(updated:FlowNode)=>{
    dispatcher.updateNode(updated);setPanel('none');
    setStatus(dispatcher.getState().error??'✓ Bloque guardado. Puedes ejecutar o comprobar tu reto cuando quieras.');
    if(activeExercise&&guidanceActive&&missionStep<activeExercise.instructions.length-1)setMissionStep(step=>step+1);
  };
  const deleteNode=(id:NodeId)=>{const previousType=func.nodes[id]?.type;const ok=dispatcher.delete(id);if(ok)recordAction({action:'delete',type:previousType,id});setStatus(ok?'Bloque eliminado':dispatcher.getState().error??'No se pudo eliminar');if(ok)setPanel('none');};
  const reset=()=>{recordAction({action:'reset'});const initial=initialContext(mainFunc);setExecContext(initial);setFrames([initialVisualFrame(initial)]);setFrameCursor(0);setPlaying(false);setRunMode('step');setShowInput(false);setInputText('');setStatus('Simulación reiniciada: pulsa Siguiente paso para volver a empezar.');};
  const executeStep=useCallback((input?:string, fromAnimation=false)=>{
    const incomplete = firstIncompleteNode(mainFunc);
    if (incomplete) {
      setPlaying(false); setActiveFunctionId(state.project.mainFunctionId); dispatcher.setSelection(new Set([incomplete.node.id]));
      setPanel('properties'); setStatus(incompleteMessage(incomplete.node, incomplete.field));
      return;
    }
    if(!fromAnimation)recordAction({action:'step'});
    if(['FINISHED','ERROR','STOPPED'].includes(execContext.status)) {setPlaying(false);return;}
    if(execContext.status==='WAITING_INPUT'&&input===undefined){setPlaying(false);setShowInput(true);return;}
    const result=stepExecution(mainFunc,execContext,input,state.project);
    const recorded=appendVisualFrame(frames.slice(0,frameCursor+1),visualFrame(execContext,result.context,mainFunc));
    setFrames(recorded);setFrameCursor(recorded.length-1);setExecContext(result.context);
    setRunMode('step');
    setPanel(current=>['properties','pieces','blockIntro','placement'].includes(current)?'none':current);
    setShowInput(result.context.status==='WAITING_INPUT');
    if(input!==undefined)setInputText('');
    if(['FINISHED','ERROR','WAITING_INPUT'].includes(result.context.status))setPlaying(false);
    setStatus(result.context.error??(result.context.status==='FINISHED'?'¡Terminó! Puedes revisar cada paso en la línea de tiempo.':`Paso ${result.context.stepCount}: consulta la memoria visual.`));
  },[recordAction,execContext,mainFunc,state.project,frames,frameCursor,dispatcher]);
  const executeAll=(input?:string)=>{
    const incomplete = firstIncompleteNode(mainFunc);
    if (incomplete) {
      setPlaying(false); setActiveFunctionId(state.project.mainFunctionId); dispatcher.setSelection(new Set([incomplete.node.id]));
      setPanel('properties'); setStatus(incompleteMessage(incomplete.node, incomplete.field));
      return;
    }
    setPlaying(false);setRunMode('all');setPanel('none');
    let context:ExecutionContext=execContext;
    let history=frames.slice(0,frameCursor+1);
    if(input!==undefined&&context.status==='WAITING_INPUT'){
      const resumed=stepExecution(mainFunc,context,input,state.project).context;
      history=appendVisualFrame(history,visualFrame(context,resumed,mainFunc));context=resumed;
    }
    if(context.status==='WAITING_INPUT'){setFrames(history);setFrameCursor(history.length-1);setExecContext(context);setShowInput(true);setStatus(context.error??'Introduce el dato solicitado.');return;}
    if(['ERROR','FINISHED','STOPPED'].includes(context.status))return;
    context={...context,status:'RUNNING',error:undefined};
    let attempts=0;
    while(!['WAITING_INPUT','FINISHED','ERROR','STOPPED'].includes(context.status)&&attempts<5000){
      const updated=stepExecution(mainFunc,context,undefined,state.project).context;
      history=appendVisualFrame(history,visualFrame(context,updated,mainFunc));context=updated;attempts++;
    }
    if(attempts>=5000&&!['WAITING_INPUT','FINISHED','ERROR','STOPPED'].includes(context.status)){
      const failed={...context,status:'ERROR' as const,error:'La ejecución superó 5 000 pasos. Revisa si existe un ciclo infinito.'};
      history=appendVisualFrame(history,visualFrame(context,failed,mainFunc));context=failed;
    }
    setFrames(history);setFrameCursor(history.length-1);setExecContext(context);setShowInput(context.status==='WAITING_INPUT');
    if(context.status!=='WAITING_INPUT')setInputText('');
    setStatus(context.error??(context.status==='FINISHED'?'¡Ejecución terminada! Recorre el historial para comprenderla.':'Introduce el valor solicitado.'));
    if(activeExercise&&guidanceActive&&missionStep<activeExercise.instructions.length-1)setMissionStep(step=>step+1);
  };
  const seekFrame=(index:number)=>{
    const bounded=Math.max(0,Math.min(index,frames.length-1));
    const frame=frames[bounded];if(!frame)return;
    setPlaying(false);setFrameCursor(bounded);setExecContext(snapshot(frame.context));setShowInput(false);
    setStatus(`Revisando ${frame.label}. Este estado ya estaba grabado.`);
  };
  useEffect(()=>{
    if(!playing)return;
    if(['FINISHED','ERROR','STOPPED','WAITING_INPUT'].includes(execContext.status)){setPlaying(false);return;}
    if(frameCursor<frames.length-1){
      const handle=window.setTimeout(()=>{const frame=frames[frameCursor+1];setFrameCursor(frameCursor+1);setExecContext(snapshot(frame.context));},playSpeed);
      return ()=>window.clearTimeout(handle);
    }
    const handle=window.setTimeout(()=>executeStep(undefined,true),playSpeed);
    return ()=>window.clearTimeout(handle);
  },[playing,playSpeed,execContext.status,executeStep,frameCursor,frames]);
  const createFunction=()=>{
    const name=newFunctionName.trim();
    if(!/^[A-Za-z_][A-Za-z_0-9]*$/.test(name) || Object.values(state.project.functions).some(f=>f.name.toLowerCase()===name.toLowerCase())){setStatus('Elige un nombre válido y diferente para la función.');return;}
    try {
    const parameters=newFunctionArgs.trim()?newFunctionArgs.split(',').map(part=>{const [parameterName,kind]=part.trim().split(':');if(!/^[A-Za-z_][A-Za-z_0-9]*$/.test(parameterName)||!['Integer','Real','String','Boolean'].includes(kind))throw new Error(`Parámetro inválido: ${part}. Usa nombre:Integer.`);return {name:parameterName,type:{kind:'Primitive' as const,type:kind as typeof newFunctionType}};}):[];
      const id=functionId(name),root=nodeId(`${name}_inicio`),ret=nodeId(`${name}_retornar`),end=nodeId(`${name}_fin`);
      const expression=''; // El valor de retorno lo elige quien está aprendiendo.
      const helper={id,name,parameters,returnType:{kind:'Primitive' as const,type:newFunctionType},rootNodeId:root,nodes:{[root]:{id:root,type:'Start' as const,next:ret},[ret]:{id:ret,type:'Return' as const,expression,next:end},[end]:{id:end,type:'End' as const}}};
      const next={...state.project,functions:{...state.project.functions,[id]:helper}};
      const check=validateProject(next);if(!check.valid)throw new Error(check.errors.join('; '));
      setState({project:next,selectedIds:new Set([ret])});setActiveFunctionId(id);anchorRef.current=ret;setPanel('properties');setStatus(`Función ${name} creada. Edita Retornar y después usa Llamar función en Main.`);
    } catch(error){setStatus(error instanceof Error?error.message:String(error));}
  };
  const grade=()=>{
    if(!activeExercise)return;
    // Los micro-retos de selección/inserción evalúan el gesto, no exigen completar el contenido.
    const incomplete = activeExercise.interaction ? null : firstIncompleteNode(mainFunc);
    if (incomplete) {
      setActiveFunctionId(state.project.mainFunctionId); dispatcher.setSelection(new Set([incomplete.node.id]));
      setPanel('properties'); setStatus(incompleteMessage(incomplete.node, incomplete.field));
      return;
    }
    const result=activeExercise.interaction ? checkInteraction(activeExercise.interaction,mainFunc,interactionHistory) : gradeExercise(activeExercise,mainFunc,inputs=>runToCompletion(mainFunc,inputs,7000,state.project));
    setFeedback(result.feedback);setPassed(result.passed);
    if(!result.passed){setPanel('review');setStatus('Revisa qué parte del diagrama falta. Tu avance sigue guardado.');return;}
    const nextCompleted=new Set(completedExercises);nextCompleted.add(activeExercise.id);
    setCompletedExercises(nextCompleted);persistSet(COMPLETED_EXERCISES_KEY,nextCompleted);
    setClassroom(previous=>completeExercise(previous,activeExercise.id));
    try{localStorage.removeItem(`${DRAFT_PREFIX}${classroom.activeId}:${activeExercise.id}`);if(classroom.activeId==='alumno-1')localStorage.removeItem(DRAFT_PREFIX+activeExercise.id);}catch{/* Sin almacenamiento */}
    setStatus('¡Misión superada! Se guardó tu progreso.');setPanel('none');
  };
  const newProject=()=>{
    const startId=nodeId('start'),endId=nodeId('end'),mainId=functionId('main');
    const fresh:FlowProject={id:projectId(`project_${Date.now()}`),metadata:{title:'Mi algoritmo',author:'',version:'1.0'},mainFunctionId:mainId,functions:{main:{id:mainId,name:'Main',parameters:[],rootNodeId:startId,nodes:{start:{id:startId,type:'Start',next:endId},end:{id:endId,type:'End'}}}}};
    setActiveFunctionId(mainId);setState({project:fresh,selectedIds:new Set([startId])});setActiveExercise(null);setIsFree(true);setScreen('editor');setPanel('none');setStatus('¡Tu primer diagrama está listo! Pulsa + Pieza para comenzar.');
  };
  const importProject=async()=>{try{const file=await openTextFile();let project:FlowProject;if(/\.(fprg|xml)$/i.test(file.name))project=importFprg(file.text);else{const parsed:unknown=JSON.parse(file.text);if(!isProject(parsed))throw new Error('Archivo JSON inválido');project=parsed;}if(!validateProject(project).valid)throw new Error('El archivo tiene referencias estructurales inválidas.');setActiveFunctionId(project.mainFunctionId);setState({project,selectedIds:new Set()});setActiveExercise(null);setIsFree(true);setScreen('editor');setPanel('none');setStatus(`Abierto: ${file.name}`);}catch(error){setStatus(error instanceof Error?error.message:String(error));}};
  const saveProject=async()=>{try{const data=JSON.stringify(state.project,null,2);await saveTextFile(`${state.project.metadata.title||'algoritmo'}.json`,data);saveLocal(data);setStatus('Proyecto guardado en archivo JSON.');setPanel('none');}catch(error){setStatus(error instanceof Error?error.message:String(error));}};
  const saveFprg=async()=>{try{await saveTextFile(`${state.project.metadata.title||'algoritmo'}.fprg`,exportFprg(state.project),'application/xml');setStatus('Archivo .fprg preparado.');setPanel('none');}catch(error){setStatus(error instanceof Error?error.message:String(error));}};
  const activeNode=activeFunctionId===state.project.mainFunctionId?execContext.lastExecutedNodeId:undefined;
  const canRun=!['FINISHED','ERROR','STOPPED'].includes(execContext.status)&&!playing;
  const runLabel=execContext.status==='WAITING_INPUT'?'Responder':'Ejecutar';

  if(screen==='home')return <CourseHome completed={completedExercises} onSelectLesson={openLesson} onOpenEditor={newProject} onOpenLibrary={library} onOpenPractice={openPractice} onOpenProfiles={openClassroom} onOpenProjects={openProjects} profileName={activeLearner(classroom).name}/>;
  if(screen==='practice')return <PracticeArcade records={activeLearner(classroom).practice} onRecord={recordPractice} onBack={home}/>;
  if(screen==='classroom')return <LocalClassroomPanel data={classroom} onData={updateClassroom} onBack={home} onGoPractice={openPractice} onBeginChallenge={startBankChallenge}/>;
  if(screen==='projects')return <ProjectGallery completed={completedExercises} onBack={home} onBegin={startBankChallenge}/>;
  if(screen==='library')return <ChallengeLibrary completed={completedExercises} onBack={home} onBegin={startBankChallenge}/>;
  if(screen==='lesson')return <LessonScreen key={lesson.id} lesson={lesson} completed={lessonCompleted(lesson.id,completedExercises)} onPreviousLesson={()=>{const index=lessons.findIndex(item=>item.id===lesson.id);if(index>0)openLesson(lessons[index-1]);}} onBack={home} onLaunch={startSelectedLesson}/>;

  const panelTitle:Record<EditorPanel,string>={objective:'Tu meta del reto',functions:'Mis funciones',none:'',pieces:'Añadir una pieza',properties:'Editar bloque',console:'Resultado del programa',code:'Código generado',variables:'Variables',help:'Cómo usar el editor',blockIntro:'Conoce esta pieza',placement:'¿Dónde la colocamos?',steps:'Tu misión paso a paso',files:'Mi proyecto',tree:'Estructura del diagrama',bridge:'Del diagrama al código',review:'Revisa tu reto'};
  const panelContent=():React.ReactNode=>{
    switch(panel){
      case 'objective':return activeExercise?<div className="v5-sheet-inner v145-objective-sheet"><div className="v5-chip">ANTES DE EMPEZAR</div><h3>{activeExercise.title}</h3><p>{activeExercise.goal}</p><div className="v143-rubric"><strong>¿Qué se revisará?</strong><ul>{exerciseCriteria(activeExercise).map(item=><li key={item}>{item}</li>)}</ul></div><p className="v5-muted">Puedes resolverlo a tu manera. No necesitas seguir los pasos de la guía para aprobar.</p><button className="v5-cta v5-full" onClick={()=>setPanel('none')}>Entendido, intentar mi reto →</button><button className="v5-secondary-wide" onClick={()=>setPanel('steps')}>Necesito ayuda paso a paso</button></div>:null;
      case 'pieces':return <BlockPalette canInsert={true} activeType={pendingType} suggestedType={activeExercise?.requiredTypes[0]} onInsert={chooseBlock} onHelp={()=>setPanel('help')} onHelpBlock={type=>{setLearningBlock(type);setPendingType(type);setPanel('blockIntro');}}/>;
      case 'blockIntro':{
        const relevant=lessons.find(item=>item.block===learningBlock);
        return <div className="v5-sheet-inner v5-block-explain"><div className="v5-giant-block">{learningBlock==='If'?'◇':['While','Do','For'].includes(learningBlock??'')?'↻':'▱'}</div><div className="v5-chip">CONOCE LA PIEZA ANTES DE USARLA</div><h3>{learningBlock?TYPE_LABELS[learningBlock]:''}</h3><p>{relevant?.summary??'Esta pieza forma parte de tu diagrama de flujo.'}</p><div className="v5-example"><span>UN EJEMPLO</span><strong>{relevant?.example??'Inicio → bloque → Fin'}</strong></div><p className="v5-note">Primero selecciona un bloque en el diagrama. Después podrás agregar esta pieza y configurar sus propiedades.</p><button className="v5-cta v5-full" onClick={confirmBlockTutorial}>Entendido, agregar pieza →</button><button className="v5-link-btn" onClick={()=>setPanel('pieces')}>← Ver otras piezas</button></div>;
      }
      case 'placement':return <div className="v5-sheet-inner"><div className="v5-chip">PASO 2 DE 3</div><h3>¿Dónde ponemos {pendingType?TYPE_LABELS[pendingType]:'la pieza'}?</h3><p>Seleccionaste <strong>{func.nodes[chosenAnchor]?TYPE_LABELS[func.nodes[chosenAnchor].type]:'Inicio'}</strong>. Elige en qué camino se colocará tu nueva pieza.</p><div className="v5-place-options">{destinations.map(position=><button key={position} onClick={()=>insertAt(position)}><span className="v142-place-copy"><strong>{insertionLabel(position)}</strong><small>{position==='InsideTrue'?'Cuando la condición sea verdadera':position==='InsideFalse'?'Cuando la condición sea falsa':position==='InsideBody'?'Dentro de la repetición':position==='After'?'A continuación, fuera de las ramas':'Justo antes de terminar'}</small></span><span aria-hidden="true">→</span></button>)}</div><button className="v5-secondary-wide" onClick={()=>setPanel('none')}>👆 Elegir otro bloque en el diagrama</button><button className="v5-link-btn" onClick={()=>setPanel('pieces')}>← Cambiar pieza</button></div>;
      case 'properties':return <div className="v5-properties-content"><p className="v5-muted">{selected?'Paso 2: escribe tus datos y guarda. Los ejemplos no son respuestas.':'Toca un bloque del diagrama para seleccionarlo.'}</p><PropertyInspector node={selected} requiresReturn={Boolean(func.returnType)} onSave={updateNode} onDelete={deleteNode} onCancel={node=>recordAction({action:'cancel',type:node.type,id:node.id})}/><button className="v5-secondary-wide" onClick={()=>setPanel('pieces')}>＋ Añadir otra pieza</button></div>;
      case 'console':return <div className="v5-sheet-inner"><p className="v5-muted">Aquí aparece lo que muestra tu programa al pulsar Ejecutar. Comprobar usa sus propios casos de prueba y no modifica esta pantalla.</p><div className="v5-runtime-status">● {execContext.status==='FINISHED'?'Finalizado':execContext.status==='WAITING_INPUT'?'Esperando una respuesta':execContext.status==='ERROR'?'Error':execContext.status==='IDLE'?'Aún no has ejecutado':`Paso ${execContext.stepCount}`}</div><pre className="v5-console-output" aria-live="polite">{execContext.outputLog.join('')||'Tu resultado aparecerá aquí después de ejecutar.'}</pre>{execContext.error&&<p role="alert" className="v5-error">{execContext.error}</p>}{execContext.status==='WAITING_INPUT'&&<button className="v5-cta v5-full" onClick={()=>setShowInput(true)}>Escribir mi respuesta →</button>}{feedback.length>0&&!passed&&<div role="alert" className="v5-feedback"><h3>Revisa tu solución</h3>{feedback.map((line,i)=><p key={i}>{line}</p>)}</div>}{(execContext.error || (feedback.length>0&&!passed))&&<DebugCoach error={execContext.error??feedback.join(' ')} func={mainFunc} onReview={()=>setPanel('none')}/>} {activeExercise&&<button className="v5-secondary-wide" onClick={grade}>✓ Comprobar mi solución</button>}</div>;
      case 'review':return <div className="v5-sheet-inner v143-review"><span className="v5-chip">TE AYUDAMOS A CORREGIRLO</span><h3>Aún falta un detalle</h3><p>No necesitas conseguir un número secreto. Evaluamos las piezas, su orden y los cálculos que pide esta misión.</p><div className="v143-review-errors" role="alert">{feedback.map((line,index)=><div key={index}><strong>Por revisar {index+1}</strong><p>{line}</p></div>)}</div><button className="v5-cta v5-full" onClick={()=>setPanel('none')}>← Regresar a mi diagrama</button><button className="v5-secondary-wide" onClick={()=>setPanel('steps')}>Ver los pasos de mi misión</button><button className="v5-link-btn" onClick={()=>setPanel('code')}>〈/〉 Ver cómo se traduce mi diagrama a código</button></div>;
      case 'variables':return <div className="v5-sheet-inner"><p>Observa cómo cambian los datos al ejecutar cada bloque.</p><div className="v5-var-list">{Object.keys(execContext.variables).length?Object.entries(execContext.variables).map(([key,value])=><div key={key}><strong>{key}</strong><code>{JSON.stringify(value)}</code></div>):<p>Todavía no hay variables. Prueba Declarar y Asignar.</p>}</div></div>;
      case 'code':return <CodePanel code={generated.code} language={language} onLanguage={setLanguage} error={generated.error}/>;
      case 'bridge':return <CodeBridge node={selected} language={language} onLanguage={setLanguage} onFullCode={()=>setPanel('code')}/>;
      case 'tree':return <div className="v5-sheet-inner"><StructureTree func={func} selectedId={selected?.id} onSelect={id=>selectNode(id,false)}/></div>;
      case 'steps':return <div className="v5-sheet-inner"><div className="v5-chip">AYUDA OPCIONAL · PASO A PASO</div><h3>{activeExercise?.title??'Construye tu algoritmo'}</h3>{activeExercise?<><p>Si prefieres intentarlo solo, cierra esta guía. Los siguientes pasos son pistas, no requisitos para aprobar.</p><button className="v5-secondary-wide" onClick={()=>setGuideEnabled(value=>!value)}>{guideEnabled?'Desactivar resaltado de la guía':'Activar resaltado de los bloques'}</button><ol className="v5-step-list">{activeExercise.instructions.map((step,i)=><li key={step} className={i===missionStep?'current':''}><button onClick={()=>setMissionStep(i)}><span>{i+1}</span>{step}</button></li>)}</ol><button className="v5-secondary-wide" onClick={()=>setShowHint(v=>!v)}>{showHint?'Ocultar pista':'💡 Necesito una pista'}</button>{showHint&&<p className="v5-hint">{activeExercise.hint}</p>}<button className="v5-cta v5-full" onClick={grade}>✓ Comprobar reto</button></>:<p>Selecciona una pieza y después el bloque donde quieras colocarla.</p>}</div>;
      case 'help':return <div className="v5-sheet-inner"><div className="v5-chip">GUÍA RÁPIDA</div><h3>No necesitas saber programar</h3><div className="v5-help-steps"><p><b>1. Toca un bloque</b> en el diagrama para seleccionarlo.</p><p><b>2. Pulsa Añadir</b> y elige una instrucción nueva.</p><p><b>3. Configura</b> sus valores en Editar bloque.</p><p><b>4. Pulsa Ejecutar</b> y observa qué sucedió en Resultado.</p><p><b>5. Comprueba tu reto</b> para abrir la siguiente clase.</p></div><button className="v5-secondary-wide" onClick={()=>setPanel('pieces')}>Explorar piezas →</button></div>;
      case 'functions':return <div className="v5-sheet-inner"><div className="v5-chip">FUNCIONES DE TU ALGORITMO</div><h3>Divide el problema en piezas</h3><p>Cada función tiene su propio diagrama. Los parámetros reciben valores al llamar y Retornar entrega un resultado. Toca una función para editar sus bloques.</p><div className="v7-function-list">{Object.values(state.project.functions).map(item=><button key={item.id} className={func.id===item.id?'active':''} onClick={()=>{setActiveFunctionId(item.id);anchorRef.current=item.rootNodeId;dispatcher.setSelection(new Set());setPanel('none');setStatus(`Editando función ${item.name}. Para ejecutar se usa Main.`);}}><strong>{item.name}({item.parameters.map(p=>p.name).join(', ')})</strong><small>{item.id===state.project.mainFunctionId?'Función principal':`Retorna ${item.returnType?.kind==='Primitive'?item.returnType.type:'sin tipo'}`}</small></button>)}</div><div className="v7-create-function"><h4>Crear una función</h4><label>Nombre de función<input value={newFunctionName} onChange={e=>setNewFunctionName(e.target.value)} placeholder="doble"/></label><label>Parámetros (nombre:Tipo, separados por coma)<input value={newFunctionArgs} onChange={e=>setNewFunctionArgs(e.target.value)} placeholder="x:Integer, y:Real"/></label><label>Tipo de retorno<select value={newFunctionType} onChange={e=>setNewFunctionType(e.target.value as typeof newFunctionType)}>{(['Integer','Real','String','Boolean'] as const).map(t=><option key={t}>{t}</option>)}</select></label><button className="v5-cta v5-full" onClick={createFunction}>＋ Crear y editar función</button></div></div>;
      case 'files':return <div className="v5-sheet-inner"><h3>Tu proyecto</h3><p>Estos controles afectan tu diagrama, no borran el progreso de las clases.</p><label className="v5-file-name">Nombre del proyecto<input value={state.project.metadata.title} onChange={e=>setState(current=>({...current,project:{...current.project,metadata:{...current.project.metadata,title:e.target.value}}}))}/></label><div className="v5-file-buttons"><button onClick={()=>setPanel('help')}>? Cómo usar el editor</button><button onClick={newProject}>＋ Diagrama nuevo</button><button onClick={importProject}>↗ Abrir JSON / .fprg</button><button onClick={saveProject}>↓ Guardar JSON</button><button onClick={saveFprg}>↓ Exportar .fprg</button><button onClick={()=>{dispatcher.undo();setStatus('Deshacer');}}>↶ Deshacer</button><button onClick={()=>{dispatcher.redo();setStatus('Rehacer');}}>↷ Rehacer</button><button onClick={()=>setPanel('functions')}>ƒ Funciones del algoritmo</button><button onClick={()=>setPanel('code')}>〈/〉 Código generado</button><button onClick={()=>setPanel('variables')}>▤ Ver variables</button><button onClick={()=>{setOrientation(o=>o==='Vertical'?'Horizontal':'Vertical');setPanel('none');}}>↔ Cambiar orientación</button><button onClick={()=>setPanel('tree')}>☷ Árbol de bloques</button></div></div>;
      case 'none':return null;
    }
  };

  return <div className="v5-editor">
    <header className="v5-editor-top"><button className="v5-editor-home" onClick={activeExercise?.id.startsWith('bank-')?library:home} aria-label="Volver a mis clases">← <span>{activeExercise?.id.startsWith('bank-')?'100 retos':'Mis clases'}</span></button><div className="v5-editor-brand"><span className="v5-editor-mark">◇</span><div><strong>{activeExercise?activeExercise.title:state.project.metadata.title}</strong><small>{activeExercise?`NIVEL ${activeExercise.level} · MISIÓN PRÁCTICA`:'EDITOR LIBRE'}</small></div></div><div className="v5-header-actions"><button className="v143-mobile-code" onClick={()=>setPanel('code')} aria-label="Ver código generado" title="Código generado">〈/〉</button>{Object.keys(state.project.functions).length>1&&<button onClick={()=>setPanel('functions')}>ƒ <span>{func.name}</span></button>}<button className="v142-header-advanced" onClick={()=>setPanel('bridge')} title="Del diagrama al código">{'</>'} <span>Código visual</span></button><button className="v142-header-help" onClick={()=>setPanel('help')} title="Ayuda">? <span>Ayuda</span></button><button className="v142-header-menu" onClick={()=>setPanel('files')} title="Archivos y opciones">☰ <span>Opciones</span></button></div></header>
    <main className={`v5-editor-body ${isFree?'v5-is-free':''}`} >
      {activeExercise&&<aside className="v5-coach" aria-label="Pasos de tu misión"><div className="v5-coach-top"><span className="v5-overline">TU MISIÓN · NIVEL {activeExercise.level}</span><h2>{activeExercise.title}</h2><p>{activeExercise.goal}</p></div><div className="v5-coach-list">{activeExercise.instructions.map((step,index)=><button key={step} className={`v5-coach-step ${missionStep===index?'current':''} ${index<missionStep?'done':''}`} onClick={()=>setMissionStep(index)}><span>{index<missionStep?'✓':index+1}</span><strong>{step}</strong></button>)}</div><div className="v5-coach-bottom"><button className="v5-link-btn" onClick={()=>setShowHint(v=>!v)}>💡 {showHint?'Ocultar pista':'Necesito una pista'}</button>{showHint&&<p className="v5-hint">{activeExercise.hint}</p>}<button className="v5-cta v5-full" onClick={grade}>✓ Comprobar reto</button><button className="v5-link-btn" onClick={()=>activeExercise.id.startsWith('bank-')?library():openLesson(lesson)}>Volver al tutorial →</button><button className="v10-coach-practice" onClick={openPractice}>✦ Practicar conceptos sin editar un diagrama</button></div></aside>}
      <section className="v5-editor-main" aria-label="Editor interactivo">
        {activeExercise&&<MissionObjective exercise={activeExercise} onHelp={()=>setPanel('steps')}/>}
        <div className="v5-editor-toolbar"><div className="v5-editor-toolbar-heading"><span>◇ TU DIAGRAMA</span><strong>{isFree?'Haz realidad tu algoritmo':'¡Ahora te toca a ti!'}</strong><small>{isFree?'Construye, experimenta y ejecuta.': 'Toca un bloque para editarlo. Puedes corregirlo cuantas veces quieras.'}</small></div><div className="v5-zoom-controls"><button onClick={()=>setZoom(v=>Math.max(.55,Math.round((v-.15)*100)/100))} title="Alejar" aria-label="Alejar">−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(v=>Math.min(1.5,Math.round((v+.15)*100)/100))} title="Acercar" aria-label="Acercar">+</button></div></div>
        <div className="v142-mobile-tip" aria-live="polite">
          <span className="v142-tip-dot" aria-hidden="true">●</span>
          <span>{pendingType ? 'Elige dónde va la pieza.':selected ? `Edita ${TYPE_LABELS[selected.type]} en el panel que se abrió.` : targetNode ? 'Toca el bloque iluminado si estás siguiendo la guía.' : 'Toca un bloque para editarlo. Mantén presionado para moverlo; desliza el fondo para recorrer el diagrama.'}</span>
        </div>
        {status.startsWith('Antes de ejecutar,') && <button type="button" className="v142-inline-alert" onClick={()=>setPanel('properties')}>⚠ {status} <strong>Editar →</strong></button>}
        <div className="v5-canvas-wrap"><FlowchartCanvas func={func} selectedIds={state.selectedIds} activeNodeId={activeNode} guidedNodeId={targetNode} onSelect={selectNode} orientation={orientation} zoom={zoom} pendingType={pendingType}
          onInsertAt={(anchor,position)=>insertAt(position,anchor)} onDropPalette={(type,anchor,position)=>{if(!knownBlocks.has(type)){setLearningBlock(type);setPendingType(type);setPanel('blockIntro');}else insertAt(position??'After',anchor,type);}}
          activeDecision={activeFunctionId===state.project.mainFunctionId?frames[frameCursor]?.decision:undefined} nextNodeId={activeFunctionId===state.project.mainFunctionId&&!(mobileEditor&&execContext.status==='IDLE')?execContext.currentNodeId:undefined}
          onMove={(id,anchor,position)=>{const ok=dispatcher.move(id,anchor,position);setStatus(ok?'Bloque colocado correctamente.':dispatcher.getState().error??'No se pudo mover');}}/>
          <div className="v5-canvas-help">{pendingType?'👆 Elige el bloque de referencia':targetNode?'✨ Sigue el bloque señalado por la guía':selected?`✓ Seleccionado: ${TYPE_LABELS[selected.type]}`:'Toca para editar · Mantén pulsado para mover'}<button onClick={()=>setPanel('pieces')}>＋ Añadir pieza</button></div>
        </div>
        <VisualDebugger func={mainFunc} frames={frames} cursor={frameCursor} playing={playing} speed={playSpeed} onSeek={seekFrame} onStep={()=>executeStep()} onPlay={()=>setPlaying(current=>!current)} onSpeed={setPlaySpeed} onReset={reset} onRun={()=>executeAll()} onInput={()=>setShowInput(true)}/>
        <div className="v5-editor-controls"><div className="v5-control-group"><button className="v5-run-secondary" onClick={reset}>↺ <span>Reiniciar</span></button><button className="v5-run-secondary" onClick={()=>execContext.status==='WAITING_INPUT'?setShowInput(true):executeStep()} disabled={!canRun}>↷ <span>Paso a paso</span></button><button className="v5-run-primary" onClick={()=>execContext.status==='WAITING_INPUT'?setShowInput(true):executeAll()} disabled={!canRun}>{'▶'} {runLabel}</button></div><div className="v5-execution-note">{execContext.status==='IDLE'?'Listo para comenzar':execContext.status==='FINISHED'?'✓ Terminó':execContext.status==='WAITING_INPUT'?'⌨ Esperando un dato':execContext.status==='ERROR'?'⚠ Error':`Paso ${execContext.stepCount}`}</div></div>
      </section>
    </main>
    <nav className="v5-dock" aria-label="Acciones principales del editor">
      <button type="button" className={panel==='pieces'?'active':''} onClick={()=>setPanel('pieces')} aria-label="Agregar pieza al diagrama"><span aria-hidden="true">＋</span><small>Añadir</small></button>
      <button type="button" onClick={()=>execContext.status==='WAITING_INPUT'?setShowInput(true):executeStep()} disabled={!canRun} aria-label="Ejecutar un paso"><span aria-hidden="true">↷</span><small>Un paso</small></button>
      <button type="button" className="v14m-dock-run" onClick={()=>canRun?(execContext.status==='WAITING_INPUT'?setShowInput(true):executeAll()):reset()} disabled={playing} aria-label={canRun?'Ejecutar todo el algoritmo':'Reiniciar la ejecución'}><span aria-hidden="true">{canRun?'▶':'↺'}</span><small>{canRun?'Ejecutar':'Reiniciar'}</small></button>
      {activeExercise
        ? <button type="button" className="v14m-dock-check" onClick={grade} aria-label="Comprobar el reto"><span aria-hidden="true">✓</span><small>Comprobar</small></button>
        : <button type="button" className={panel==='console'?'active':''} onClick={()=>setPanel('console')} aria-label="Ver resultados"><span aria-hidden="true">▤</span><small>Resultado</small></button>}
    </nav>
    {panel!=='none'&&<div className={`v5-panel-layer v143-panel-${panel} ${panel==='pieces'?'v5-panel-pieces':''}`}><button className="v5-panel-scrim" onClick={()=>{setPanel('none');setPendingType(null);}} aria-label="Cerrar panel"/><aside className="v5-editor-sheet" role="dialog" aria-modal={panel!=='pieces'} aria-label={panelTitle[panel]}><header><div className="v5-sheet-grip"/><strong>{panelTitle[panel]}</strong><button aria-label="Cerrar panel" onClick={()=>{setPanel('none');setPendingType(null);}}>✕</button></header><div className="v5-sheet-scroll">{panelContent()}</div></aside></div>}
    {showInput&&<div className="v5-input-overlay"><form className="v5-input-form" onSubmit={e=>{e.preventDefault();if(runMode==='all')executeAll(inputText);else executeStep(inputText);}}><div className="v5-chip">TU PROGRAMA TE PREGUNTA</div><h2>Escribe un valor</h2><p>Introduce el dato para <strong>{execContext.pendingInput}</strong>.</p>{execContext.error&&<p role="alert" className="v5-error">{execContext.error}</p>}<input autoFocus aria-label="Valor de entrada" value={inputText} onChange={e=>setInputText(e.target.value)}/><button className="v5-cta v5-full" type="submit">Continuar →</button><button className="v5-link-btn" type="button" onClick={()=>setShowInput(false)}>Cerrar por ahora</button></form></div>}
    {passed&&activeExercise&&<div className="v5-victory-overlay" role="dialog" aria-modal="true" aria-label="Reto superado"><div className="v5-victory"><span className="v5-victory-star">★</span><span className="v5-chip">MISIÓN SUPERADA</span><h2>¡Lo conseguiste!</h2><p>Tu algoritmo pasó {activeExercise.tests.length} {activeExercise.tests.length===1?'prueba':'pruebas'} automáticamente. {activeExercise.id.startsWith('bank-')?'Este reto cuenta para tu progreso en el laboratorio.':'Has desbloqueado tu siguiente lección.'}</p><div className="v5-victory-stars">★ ★ ★</div><button className="v5-cta v5-full" onClick={()=>{setPassed(false);nextLessonFromExercise();}}>{activeExercise.id.startsWith('bank-')?'Explorar otro reto →':lessons.findIndex(item=>item.id===activeExercise.lessonId)<lessons.length-1?'Ir a la siguiente clase →':'Volver a mis clases →'}</button><button className="v5-link-btn" onClick={()=>{setPassed(false);reset();}}>Practicar otra vez</button></div></div>}
    <div role="status" aria-live="polite" className="v5-sr-status">{status}</div>
  </div>;
}
