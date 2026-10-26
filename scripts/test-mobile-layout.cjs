/* Comprobaciones estructurales sin dependencias, complementarias a npm run verify. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=name=>fs.readFileSync(name,'utf8');
const app=read('src/ui/App.tsx');
const debuggerUI=read('src/ui/VisualDebugger.tsx');
const css=read('src/ui/v14-1-mobile.css');
assert.match(debuggerUI,/matchMedia\('\(max-width: 760px\)'\)/,'El simulador debe iniciar compacto en móviles.');
assert.match(debuggerUI,/v14m-simulator-scrim/,'El detalle de ejecución requiere cierre táctil.');
for(const action of ['Añadir','Un paso','Comprobar'])assert.match(app,new RegExp(`>${action}<`),`Falta acción móvil: ${action}`);
assert.match(app,/canRun\?'Ejecutar':'Reiniciar'/,'La acción principal debe permitir repetir el algoritmo.');
assert.match(css,/\.v5-editor-controls,\.v5-mobile-check\{display:none!important/,'No deben aparecer barras redundantes en móvil.');
assert.match(css,/\.v7-simulator\.expanded\{position:fixed/,'La vista detallada debe ser una hoja superpuesta.');
assert.match(css,/\.v5-canvas-wrap\{min-height:0;flex:1;/,'El diagrama debe poder ocupar el espacio libre.');
assert.match(read('src/main.tsx'),/v14-2-mobile\.css/,'Debe cargarse la versión móvil de accesibilidad.');
assert.match(read('src/ui/v14-2-mobile.css'),/v142-mobile-tip/,'El contexto móvil debe aparecer fuera del diagrama.');
assert.match(read('src/domain/models.ts'),/condition: ''/,'Las condiciones nuevas no deben prellenarse.');
console.log('OK: editor móvil compacto, acciones y ejecución accesibles.');
