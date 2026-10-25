import { CoreFunction, CoreProgram, CoreStatement } from '../coreIR';
import { GeneratorPlugin, LanguageId, expressionFor, indent, header } from '../shared';
import { cppType } from './types';
import { cppIdentifier } from './keywords';
const id: LanguageId = 'cpp';
function emit(s: CoreStatement, level: number): string[] { const i = indent(level); switch (s.kind) {
  case 'declare': { const name = cppIdentifier(s.name); if (s.arraySize) return [`${i}vector<${cppType(s.dataType)}> ${name}(static_cast<size_t>(${expressionFor(s.arraySize, id, cppIdentifier)}));`]; return [`${i}${cppType(s.dataType)} ${name} = ${s.dataType === 'String' ? '""' : s.dataType === 'Boolean' ? 'false' : '0'};`]; }
  case 'assign': return [`${i}${expressionFor(s.target, id, cppIdentifier)} = ${expressionFor(s.expression, id, cppIdentifier)};`];
  case 'input': return [`${i}cin >> ${expressionFor(s.target, id, cppIdentifier)};`];
  case 'output': return [`${i}cout << ${expressionFor(s.expression, id, cppIdentifier)}${s.newLine ? ' << endl' : ''};`];
  case 'comment': return [`${i}// ${s.text.replace(/\n/g, ' ')}`];
  case 'return': return [`${i}return${s.expression ? ` ${expressionFor(s.expression, id, cppIdentifier)}` : ''};`];
  case 'call': return [`${i}${s.target ? `${expressionFor(s.target, id, cppIdentifier)} = ` : ''}${cppIdentifier(s.functionName)}(${s.args.map(a => expressionFor(a, id, cppIdentifier)).join(', ')});`];
  case 'if': return [`${i}if (${expressionFor(s.condition, id, cppIdentifier)}) {`, ...(s.thenBody.length ? s.thenBody.flatMap(x => emit(x, level + 1)) : [`${indent(level + 1)}/* rama vacía */`]), ...(s.elseBody.length ? [`${i}} else {`, ...s.elseBody.flatMap(x => emit(x, level + 1))] : []), `${i}}`];
  case 'while': return [`${i}while (${expressionFor(s.condition, id, cppIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}}`];
  case 'do': return [`${i}do {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}} while (${expressionFor(s.condition, id, cppIdentifier)});`];
  case 'for': return [`${i}for (int ${cppIdentifier(s.variable)} = ${expressionFor(s.start, id, cppIdentifier)}; ${s.direction === 'Inc' ? `${cppIdentifier(s.variable)} <= ${expressionFor(s.end, id, cppIdentifier)}` : `${cppIdentifier(s.variable)} >= ${expressionFor(s.end, id, cppIdentifier)}`}; ${cppIdentifier(s.variable)} ${s.direction === 'Inc' ? '+=' : '-='} ${expressionFor(s.step, id, cppIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}}`];
} }
function renderFunction(fn: CoreFunction): string[] { const params = fn.parameters.map(p => `${cppType(p.type)} ${cppIdentifier(p.name)}`).join(', '); return [`${cppType(fn.returnType)} ${cppIdentifier(fn.name)}(${params}) {`, ...(fn.body.length ? fn.body.flatMap(s => emit(s, 1)) : ['    /* cuerpo vacío */']), '}']; }
export const cppGenerator: GeneratorPlugin = { id, label: 'C++', generate(program: CoreProgram): string { const lines = [header(program), '#include <iostream>', '#include <string>', '#include <vector>', '#include <cmath>', 'using namespace std;', '']; for (const fn of program.functions) { const params = fn.parameters.map(p => `${cppType(p.type)} ${cppIdentifier(p.name)}`).join(', '); lines.push(`${cppType(fn.returnType)} ${cppIdentifier(fn.name)}(${params});`); } lines.push(''); for (const fn of program.functions) lines.push(...renderFunction(fn), ''); const main = program.functions.find(f => f.name.toLowerCase() === 'main'); lines.push('int main() {', ...(main ? [`    ${cppIdentifier(main.name)}();`] : ['    /* Selecciona una función principal en el proyecto. */']), '    return 0;', '}'); return lines.join('\n'); } };
