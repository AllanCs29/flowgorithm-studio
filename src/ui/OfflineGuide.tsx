import React, { useEffect, useState } from 'react';
import { offlineSupported, registerOffline } from '../offline/registerOffline';

type OfflineState='checking'|'ready'|'unavailable'|'error';

export function OfflineGuide():React.ReactElement {
  const [state,setState]=useState<OfflineState>('checking');
  const [online,setOnline]=useState(()=>navigator.onLine);
  useEffect(()=>{
    const update=()=>setOnline(navigator.onLine);
    window.addEventListener('online',update);
    window.addEventListener('offline',update);
    if(!offlineSupported())setState('unavailable');
    else {void registerOffline().then(ok=>setState(ok?'ready':'error'));}
    return ()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};
  },[]);
  const status = state==='ready' ? 'Listo para estudiar sin internet' :
    state==='checking'?'Preparando lecciones y ejercicios…' :
    state==='error'?'No se pudo preparar el modo offline' :
    'Para instalar, publica la versión compilada por HTTPS';
  return <section className="v14-offline" aria-label="Estudiar sin conexión">
    <div className="v14-offline-icon" aria-hidden="true">{state==='ready'?'✓':'↓'}</div>
    <div className="v14-offline-copy"><small>ESTUDIA DONDE QUIERAS</small><h2>{status}</h2>
      <p>{state==='ready' ?
        'Las lecciones, diagramas y ejercicios ya están guardados en este dispositivo. Abre la app desde su ícono aunque no tengas señal.' :
        'Abre la app una vez con conexión desde su enlace HTTPS. En Safari, usa Compartir → Agregar a pantalla de inicio.'}</p>
      <span className="v14-offline-connection" role="status">{online?'● Con conexión ahora':'○ Sin conexión ahora'} · El progreso se guarda en este dispositivo.</span>
    </div>
    {state==='error'&&<button type="button" onClick={()=>{setState('checking');void registerOffline().then(ok=>setState(ok?'ready':'error'));}}>Reintentar</button>}
  </section>;
}
