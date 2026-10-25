import { CoreProgram } from './coreIR';
import { cGenerator } from './c/generator'; import { cppGenerator } from './cpp/generator'; import { javaGenerator } from './java/generator'; import { javascriptGenerator } from './javascript/generator'; import { pythonGenerator } from './python/generator'; import { GeneratorPlugin, LanguageId } from './shared';
export * from './coreIR'; export * from './errors'; export type { GeneratorPlugin, LanguageId } from './shared';
const plugins: Readonly<Record<LanguageId, GeneratorPlugin>> = { python: pythonGenerator, javascript: javascriptGenerator, c: cGenerator, cpp: cppGenerator, java: javaGenerator };
export function generateCode(program: CoreProgram, language: LanguageId): string { return plugins[language].generate(program); }
export function availableLanguages(): ReadonlyArray<{ id: LanguageId; label: string }> { return Object.values(plugins).map(p => ({ id: p.id, label: p.label })); }