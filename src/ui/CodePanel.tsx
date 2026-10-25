import React from 'react';
import { LanguageId } from '../generators/shared';
import { availableLanguages } from '../generators';
export function CodePanel({ code, language, onLanguage, error }: { code: string; language: LanguageId; onLanguage: (value: LanguageId) => void; error?: string }): React.ReactElement {
  return <section className="panel code-panel"><div className="panel-title"><h2>Código generado</h2><select aria-label="Lenguaje de salida" value={language} onChange={e => onLanguage(e.target.value as LanguageId)}>{availableLanguages().map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></div>{error && <div className="error-line">{error}</div>}<pre><code>{code}</code></pre></section>;
}