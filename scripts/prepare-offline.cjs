/* Construye un precache completo, versionado y comprobado para la PWA. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..','dist');
const sw=path.join(root,'sw.js');
const assets=path.join(root,'assets');
if(!fs.existsSync(sw)||!fs.existsSync(assets))throw new Error('Faltan los archivos compilados. Ejecuta vite build primero.');
const built=fs.readdirSync(assets).filter(file=>/\.(?:js|css)$/.test(file)).map(file=>`./assets/${file}`);
assert(built.some(file=>file.endsWith('.js')),'No se encontraron archivos JS para la PWA.');
assert(built.some(file=>file.endsWith('.css')),'No se encontraron archivos CSS para la PWA.');
const shell=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const all=[...shell,...built];
for(const asset of all.filter(asset=>asset!=='./')) {
  const file=path.join(root,asset);
  assert(fs.existsSync(file),`No existe el recurso sin conexion: ${asset}`);
}
let source=fs.readFileSync(sw,'utf8');
const assetsMatch=/const ROOT_ASSETS=\[[^;]+;/;
const cacheMatch=/const CACHE='[^']+';/;
assert(assetsMatch.test(source),'No se encontro ROOT_ASSETS.');
assert(cacheMatch.test(source),'No se encontro el nombre del cache.');
const contentHash=crypto.createHash('sha256').update(all.map(item=>item+':'+(item==='./'?'entry':fs.statSync(path.join(root,item)).size)).join('|')).digest('hex').slice(0,12);
source=source.replace(assetsMatch,`const ROOT_ASSETS=${JSON.stringify(all)};`).replace(cacheMatch,`const CACHE='flowstudio-shell-v14-${contentHash}';`);
fs.writeFileSync(sw,source);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(index.includes('/assets/'),'El HTML compilado no incluye rutas de los archivos de Vite.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert(manifest.display==='standalone','La app no tiene modo standalone');
assert(manifest.start_url==='.' && manifest.scope==='.','El manifiesto debe funcionar en subdirectorios.');
console.log(`PWA offline preparada: ${all.length} recursos, version ${contentHash}.`);
