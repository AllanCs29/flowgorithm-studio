/* Verificacion automatica de que el bundle puede arrancar sin peticiones de red. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dist=path.join(__dirname,'..','dist');
const sw=fs.readFileSync(path.join(dist,'sw.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));
const assets=fs.readdirSync(path.join(dist,'assets')).filter(file=>/\.(?:js|css)$/.test(file));
assert(assets.length>=2,'Los recursos compilados estan incompletos');
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'.');
for(const asset of assets)assert(sw.includes(`./assets/${asset}`),`El modo offline no incluye ${asset}`);
for(const file of ['index.html','manifest.webmanifest','icon-192.png','icon-512.png'])assert(sw.includes(`./${file}`),`Falta ${file}`);
assert(sw.includes("request.mode==='navigate'"),'No hay modo offline para navegacion');

// Simular install -> activate -> desactivar internet -> abrir la app + archivos CSS/JS.
(async()=>{
  const scope='https://flowgorithm.example/app/';
  const listeners=new Map();
  const stores=new Map();
  let online=true;
  let downloads=0;
  const key=input=>typeof input==='string'?input:input.url;
  const caches={
    open:async name=>{
      if(!stores.has(name))stores.set(name,new Map());
      const store=stores.get(name);
      return {
        addAll:async urls=>{
          if(!online)throw new Error('No hay red para instalacion');
          for(const url of urls){downloads++;store.set(key(url),new Response('Contenido local: '+url));}
        },
        match:async request=>store.get(key(request))?.clone(),
        put:async(request,response)=>{store.set(key(request),response.clone());}
      };
    },
    keys:async()=>[...stores.keys()],
    delete:async name=>stores.delete(name)
  };
  let skips=0;
  const self={registration:{scope},location:{origin:new URL(scope).origin},
    skipWaiting:async()=>{skips++;},clients:{claim:async()=>undefined},
    addEventListener:(type,handler)=>listeners.set(type,handler)};
  const context={self,caches,URL,Promise,Response,console,
    fetch:async url=>{
      if(!online)throw new Error('Intento de acceder a internet en modo avion: '+key(url));
      return new Response('Red: '+key(url));
    }};
  vm.runInNewContext(sw,context,{filename:'dist/sw.js',timeout:1000});
  const lifecycle=async type=>{
    let task;
    listeners.get(type)({waitUntil:p=>{task=p;}});
    await task;
  };
  await lifecycle('install');
  assert(skips===1,'No se activo la PWA');
  await lifecycle('activate');
  assert(downloads===assets.length+5,'No se precargaron todas las paginas e iconos');
  online=false;
  const offlineFetch=async request=>{
    let response;
    listeners.get('fetch')({request,respondWith:p=>{response=p;}});
    assert(response,'La peticion no fue controlada por el service worker');
    return response;
  };
  const page=await offlineFetch({url:scope,method:'GET',mode:'navigate'});
  assert((await page.text()).includes('Contenido local'),'La app no abre sin internet');
  for(const asset of assets){
    const answer=await offlineFetch({url:scope+'assets/'+asset,method:'GET',mode:'cors'});
    assert((await answer.text()).includes('Contenido local'),'El archivo '+asset+' necesita internet');
  }
  console.log(`Validacion offline correcta: ${assets.length} archivos JS/CSS, paginas e iconos. Navegacion sin red simulada.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
