import React, { useEffect, useState } from 'react';
import { FlowNode, PrimitiveType, TYPE_LABELS } from '../domain/models';

const fields: Partial<Record<FlowNode['type'], readonly string[]>> = {
  Declare: ['name', 'dataType', 'arraySize'], Assign: ['target', 'expression'], Input: ['target'],
  Output: ['expression', 'newLine'], If: ['condition'], While: ['condition'], Do: ['condition'],
  For: ['variable', 'start', 'end', 'step', 'direction'], Call: ['functionName', 'args', 'target'],
  Return: ['expression'], Comment: ['text']
};
const labels: Record<string, string> = {
  name: 'Nombre de la variable', target: 'Variable destino', expression: 'Expresión',
  condition: 'Condición', variable: 'Contador', start: 'Valor inicial', end: 'Valor final',
  step: 'Incremento', functionName: 'Función', text: 'Comentario', arraySize: 'Tamaño del arreglo (opcional)'
};
const fieldTips: Record<string, string> = {
  name: 'Ejemplo: edad · o dos variables del mismo tipo: area, radius', target: 'Variable declarada: edad. Arreglo: datos[2] (el primer índice es 0)',
  expression: 'Ejemplo: 7 + 8, pi * radius ^ 2 o "Hola " & nombre',
  condition: 'Una pregunta verdadera o falsa. Ejemplo: edad >= 18',
  variable: 'Ejemplo: i (se declara antes del ciclo)',
  start: 'Ejemplo: 1', end: 'Ejemplo: 10', step: 'Ejemplo: 1',
  arraySize: 'Vacío: variable común. Con tamaño 5: datos[0]…datos[4]', text: 'Explica qué hace el algoritmo',
  functionName: 'Ejemplo: doble. Puedes crear funciones desde Opciones → Funciones.'
};
const examples: Partial<Record<FlowNode['type'], string>> = {
  Declare: 'Crea una o varias cajas del mismo tipo. Ejemplo: Real area, radius.', Assign: 'Ejemplo: total = 3 + 4',
  Input: 'Al ejecutar aparecerá un cuadro para pedir un dato.', Output: 'Ejemplo: Mostrar "Hola, mundo"',
  If: 'Se bifurca por Sí/No. Nunca repite automáticamente.',
  While: 'Repite el cuerpo si la condición es verdadera.', Do: 'Repite el cuerpo al menos una vez.',
  For: 'Repite un número de veces usando un contador.', Call: 'Ejecuta una función creada por ti. Configura el nombre y sus argumentos.', Return: 'Devuelve un resultado de la función actual.', Comment: 'Una nota no cambia la ejecución.'
};
export function PropertyInspector({ node, onSave, onDelete, onCancel }: { node?: FlowNode; onSave: (node: FlowNode) => void; onDelete: (id: FlowNode['id']) => void; onCancel?: (node: FlowNode) => void }): React.ReactElement {
  const [draft, setDraft] = useState<FlowNode | undefined>(node);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cancel = () => { if (dirty && node) onCancel?.(node); setDraft(node); setDirty(false); setConfirmDelete(false); };
  useEffect(() => { setDraft(node); setDirty(false); setConfirmDelete(false); }, [node]);
  if (!draft) return <section className="panel inspector"><div className="panel-title"><h2>Propiedades</h2></div><p className="empty">Toca un bloque del diagrama para editarlo. Si no tienes ninguno seleccionado, empieza por «Inicio».</p></section>;
  const names = fields[draft.type] ?? [];
  const update = (key: string, value: unknown) => { setDraft({ ...draft, [key]: value } as FlowNode); setDirty(true); };
  return <section className="panel inspector">
    <div className="panel-title"><h2>{TYPE_LABELS[draft.type]}</h2><span className="inspector-kind">{dirty ? '● Cambios pendientes' : '✓ Sin cambios'}</span></div>
    {examples[draft.type] && <p className="property-example">ⓘ {examples[draft.type]}</p>}
    {names.length === 0 && <p className="empty">Este bloque no necesita configuración. Se crea automáticamente con el diagrama.</p>}
    <form className="inspector-form" onSubmit={event => { event.preventDefault(); onSave(draft); setDirty(false); }}>
      <div className="form-fields">{names.map(key => {
        const value = (draft as unknown as Record<string, unknown>)[key];
        if (key === 'dataType') return <label key={key}>Tipo de dato<select value={String(value ?? 'Integer')} onChange={e => update(key, e.target.value as PrimitiveType)}>{['Integer', 'Real', 'String', 'Boolean'].map(t => <option key={t}>{t}</option>)}</select><small>Integer: entero · Real: decimal · String: texto · Boolean: Sí/No</small></label>;
        if (key === 'direction') return <label key={key}>Dirección<select value={String(value)} onChange={e => update(key, e.target.value)}><option value="Inc">Incrementar ↑</option><option value="Dec">Decrementar ↓</option></select></label>;
        if (key === 'newLine') return <label key={key} className="check-row"><input type="checkbox" checked={Boolean(value)} onChange={e => update(key, e.target.checked)} /> Añadir nueva línea al final</label>;
        if (key === 'arraySize') return <div key={key} className="v10-array-settings"><label className="check-row"><input type="checkbox" checked={!!value} onChange={e=>update('arraySize',e.target.checked?'5':undefined)}/> ¿Es un arreglo de varios valores?</label>{value?<label>Tamaño del arreglo<input inputMode="numeric" value={String(value)} onChange={e=>update('arraySize',e.target.value||undefined)} /><small>Ejemplo: 5 crea casillas datos[0] a datos[4].</small></label>:<small>Variable normal: guarda un único valor, por ejemplo edad = 18. No necesita tamaño.</small>}</div>;
        if (key === 'args') return <label key={key}>Argumentos separados por coma<input value={Array.isArray(value) ? value.join(', ') : ''} onChange={e => update(key, e.target.value.split(',').map(x => x.trim()).filter(Boolean))} /></label>;
        return <label key={key}>{labels[key] ?? key}<input value={String(value ?? '')} placeholder={fieldTips[key] ?? ''} onChange={e => update(key, e.target.value || (key === 'arraySize' ? undefined : ''))} />{fieldTips[key] && <small>{fieldTips[key]}</small>}</label>;
      })}</div>
      {names.length > 0 && <div className="v6-form-actions">
        <button type="submit" className="v6-apply" disabled={!dirty}>✓ Aplicar cambios</button>
        <button type="button" className="v6-cancel" onClick={cancel} disabled={!dirty}>Cancelar edición</button>
        <small>{dirty?'Puedes descartar los cambios sin modificar el diagrama.':'Todo guardado. Modifica un campo para activar los botones.'}</small>
      </div>}
      {draft.type !== 'Start' && draft.type !== 'End' && <div className="v6-danger-zone">
        {!confirmDelete ? <button type="button" className="v6-delete-trigger" onClick={() => setConfirmDelete(true)}>Eliminar este bloque…</button> :
        <div className="delete-confirm" role="alertdialog" aria-label="Confirmar eliminación"><strong>¿Eliminar {TYPE_LABELS[draft.type]}?</strong><p>El bloque desaparecerá del diagrama.</p><button className="v6-delete-trigger" type="button" onClick={() => onDelete(draft.id)}>Sí, eliminar bloque</button><button type="button" className="v6-cancel" onClick={() => setConfirmDelete(false)}>No, conservar bloque</button></div>}
      </div>}
    </form>
  </section>;
}
