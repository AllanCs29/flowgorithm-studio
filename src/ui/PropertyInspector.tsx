import React, { useEffect, useRef, useState } from 'react';
import { missingFields } from '../domain/blockCompleteness';
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
  If: 'Ejemplo: edad >= 18. Si esa comparación es verdadera sigue por Sí; de lo contrario, por No.',
  While: 'Repite el cuerpo si la condición es verdadera.', Do: 'Repite el cuerpo al menos una vez.',
  For: 'Repite un número de veces usando un contador.', Call: 'Ejecuta una función creada por ti. Configura el nombre y sus argumentos.', Return: 'Devuelve un resultado de la función actual.', Comment: 'Una nota no cambia la ejecución.'
};
export function PropertyInspector({ node, onSave, onDelete, onCancel, requiresReturn = false }: { node?: FlowNode; requiresReturn?: boolean; onSave: (node: FlowNode) => void; onDelete: (id: FlowNode['id']) => void; onCancel?: (node: FlowNode) => void }): React.ReactElement {
  const [draft, setDraft] = useState<FlowNode | undefined>(node);
  const [dirty, setDirty] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cancel = () => { if (dirty && node) onCancel?.(node); setDraft(node); setDirty(false); setConfirmDelete(false); setAttempted(false); };
  useEffect(() => { setDraft(node); setDirty(false); setConfirmDelete(false); setAttempted(false); setShowExamples(false); }, [node]);
  if (!draft) return <section className="panel inspector"><div className="panel-title"><h2>Propiedades</h2></div><p className="empty">Toca un bloque del diagrama para editarlo. Si no tienes ninguno seleccionado, empieza por «Inicio».</p></section>;
  const names = fields[draft.type] ?? [];
  const missing = draft.type === 'Return' && requiresReturn && !draft.expression?.trim()
    ? [{ key: 'expression', label: 'valor que debe devolver la función' }] : missingFields(draft);
  const requiredKeys = new Set(missing.map(field => field.key));
  const hasMissing = missing.length > 0;
  const update = (key: string, value: unknown) => { setDraft({ ...draft, [key]: value } as FlowNode); setDirty(true); };
  return <section className="panel inspector">
    <div className="panel-title"><h2>{TYPE_LABELS[draft.type]}</h2><span className="inspector-kind">{hasMissing ? '◉ Falta completar' : dirty ? '● Cambios pendientes' : '✓ Configurado'}</span></div>
    <p className="v142-editor-guidance">{hasMissing ? `Completa ${missing.map(field => field.label).join(' y ')} con tus propios valores.` : 'Puedes revisar o modificar este bloque cuando quieras.'}</p>
    {examples[draft.type] && <div className="v142-example-toggle"><button type="button" onClick={() => setShowExamples(v => !v)} aria-expanded={showExamples}>{showExamples ? 'Ocultar ejemplo' : '¿Cómo se usa? Ver un ejemplo'} <span aria-hidden="true">{showExamples ? '−' : '+'}</span></button>{showExamples && <p className="property-example">ⓘ {examples[draft.type]}</p>}</div>}
    {names.length === 0 && <p className="empty">Este bloque no necesita configuración. Se crea automáticamente con el diagrama.</p>}
    <form ref={formRef} className="inspector-form" onSubmit={event => {
      event.preventDefault(); setAttempted(true);
      if (hasMissing) { window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return; }
      onSave(draft); setDirty(false);
    }}>
      <div className="form-fields">{names.map(key => {
        const value = (draft as unknown as Record<string, unknown>)[key];
        if (key === 'dataType') return <label key={key}>Tipo de dato<select value={String(value ?? 'Integer')} onChange={e => update(key, e.target.value as PrimitiveType)}>{['Integer', 'Real', 'String', 'Boolean'].map(t => <option key={t}>{t}</option>)}</select><small>Integer: entero · Real: decimal · String: texto · Boolean: Sí/No</small></label>;
        if (key === 'direction') return <label key={key}>Dirección<select value={String(value)} onChange={e => update(key, e.target.value)}><option value="Inc">Incrementar ↑</option><option value="Dec">Decrementar ↓</option></select></label>;
        if (key === 'newLine') return <label key={key} className="check-row"><input type="checkbox" checked={Boolean(value)} onChange={e => update(key, e.target.checked)} /> Añadir nueva línea al final</label>;
        if (key === 'arraySize') return <div key={key} className="v10-array-settings"><label className="check-row"><input type="checkbox" checked={!!value} onChange={e=>update('arraySize',e.target.checked?'5':undefined)}/> ¿Es un arreglo de varios valores?</label>{value?<label>Tamaño del arreglo<input inputMode="numeric" value={String(value)} onChange={e=>update('arraySize',e.target.value||undefined)} /><small>Ejemplo: 5 crea casillas datos[0] a datos[4].</small></label>:<small>Variable normal: guarda un único valor, por ejemplo edad = 18. No necesita tamaño.</small>}</div>;
        if (key === 'args') return <label key={key}>Argumentos separados por coma<input value={Array.isArray(value) ? value.join(', ') : ''} onChange={e => update(key, e.target.value.split(',').map(x => x.trim()).filter(Boolean))} /></label>;
        return <label key={key}>{labels[key] ?? key}{requiredKeys.has(key) && <span className="v142-required">Necesario</span>}<input
          value={String(value ?? '')}
          aria-invalid={attempted && requiredKeys.has(key)}
          aria-required={key !== 'arraySize'}
          placeholder={fieldTips[key] ?? 'Escribe aquí'}
          autoComplete="off"
          onChange={e => update(key, e.target.value || (key === 'arraySize' ? undefined : ''))} />
          {fieldTips[key] && <small>{fieldTips[key]}</small>}
          {attempted && requiredKeys.has(key) && <strong className="v142-field-error">Escribe {labels[key]?.toLowerCase() ?? 'este dato'} para continuar.</strong>}
        </label>;
      })}</div>
      {names.length > 0 && <div className="v6-form-actions">
        {attempted && hasMissing && <p className="v142-form-error" role="alert">Este bloque aún no está listo. Rellena los campos señalados; el ejemplo es solo una guía, no una respuesta.</p>}
        <button type="submit" className="v6-apply" disabled={!dirty && !hasMissing}>✓ Guardar bloque</button>
        <button type="button" className="v6-cancel" onClick={cancel} disabled={!dirty}>Cancelar edición</button>
        <small>{hasMissing?'Los campos están vacíos a propósito: la respuesta la escribes tú.':dirty?'Guarda cuando termines o cancela para deshacer los cambios.':'Bloque configurado correctamente.'}</small>
      </div>}
      {draft.type !== 'Start' && draft.type !== 'End' && <div className="v6-danger-zone">
        {!confirmDelete ? <button type="button" className="v6-delete-trigger" onClick={() => setConfirmDelete(true)}>Eliminar este bloque…</button> :
        <div className="delete-confirm" role="alertdialog" aria-label="Confirmar eliminación"><strong>¿Eliminar {TYPE_LABELS[draft.type]}?</strong><p>El bloque desaparecerá del diagrama.</p><button className="v6-delete-trigger" type="button" onClick={() => onDelete(draft.id)}>Sí, eliminar bloque</button><button type="button" className="v6-cancel" onClick={() => setConfirmDelete(false)}>No, conservar bloque</button></div>}
      </div>}
    </form>
  </section>;
}
