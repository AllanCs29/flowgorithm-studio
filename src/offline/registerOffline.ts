/** PWA sin paquetes externos. No funciona desde el servidor Vite de desarrollo. */
export function offlineSupported():boolean {
  return import.meta.env.PROD && typeof window!=='undefined' && window.isSecureContext && 'serviceWorker' in navigator;
}
export function registerOffline():Promise<boolean> {
  if(!offlineSupported())return Promise.resolve(false);
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{scope:import.meta.env.BASE_URL,updateViaCache:'none'})
    .then(()=>navigator.serviceWorker.ready)
    .then(registration=>Boolean(registration.active))
    .catch(()=>false);
}
