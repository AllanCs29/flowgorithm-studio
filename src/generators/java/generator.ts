import { CoreFunction, CoreProgram, CoreStatement } from '../coreIR';
import { GeneratorPlugin, LanguageId, expressionFor, indent, header } from '../shared';
import { javaType } from './types';
import { javaIdentifier } from './keywords';
const id: LanguageId = 'java';
function walk(body: readonly CoreStatement[], fn: (s: CoreStatement) => void): void { for (const s of body) { fn(s); if (s.kind === 'if') { walk(s.thenBody, fn); walk(s.elseBody, fn); } else if (s.kind === 'while' || s.kind === 'do' || s.kind === 'for') walk(s.body, fn); } }
function variableTypes(fn: CoreFunction): Map<string, string> { const types = new Map<string, string>(); for (const p of fn.parameters) types.set(p.name, p.type); walk(fn.body, s => { if (s.kind === 'declare') types.set(s.name, s.arraySize ? `${s.dataType}[]` : s.dataType); }); return types; }
function parseInput(target: string, types: Map<string, string>): string { const type = types.get(target.split('[')[0]) ?? 'String'; const safe = expressionFor(target, id, javaIdentifier); if (type === 'Integer' || type === 'Integer[]') return `${safe} = Integer.parseInt(input.nextLine());`; if (type === 'Real' || type === 'Real[]') return `${safe} = Double.parseDouble(input.nextLine());`; if (type === 'Boolean' || type === 'Boolean[]') return `${safe} = Boolean.parseBoolean(input.nextLine());`; return `${safe} = input.nextLine();`; }
function emit(s: CoreStatement, level: number, types: Map<string, string>): string[] { const i = indent(level); switch (s.kind) {
  case 'declare': { const name = javaIdentifier(s.name); const t = javaType(s.dataType); if (s.arraySize) return [`${i}${t}[] ${name} = new ${t}[${expressionFor(s.arraySize, id, javaIdentifier)}];`]; return [`${i}${t} ${name} = ${s.dataType === 'String' ? '""' : s.dataType === 'Boolean' ? 'false' : '0'};`]; }
  case 'assign': return [`${i}${expressionFor(s.target, id, javaIdentifier)} = ${expressionFor(s.expression, id, javaIdentifier)};`];
  case 'input': return [`${i}${parseInput(s.target, types)}`];
  case 'output': return [`${i}System.out.${s.newLine ? 'println' : 'print'}(${expressionFor(s.expression, id, javaIdentifier)});`];
  case 'comment': return [`${i}// ${s.text.replace(/\n/g, ' ')}`];
  case 'return': return [`${i}return${s.expression ? ` ${expressionFor(s.expression, id, javaIdentifier)}` : ''};`];
  case 'call': return [`${i}${s.target ? `${expressionFor(s.target, id, javaIdentifier)} = ` : ''}${javaIdentifier(s.functionName)}(${s.args.map(a => expressionFor(a, id, javaIdentifier)).join(', ')});`];
  case 'if': return [`${i}if (${expressionFor(s.condition, id, javaIdentifier)}) {`, ...(s.thenBody.length ? s.thenBody.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}// rama vacía`]), ...(s.elseBody.length ? [`${i}} else {`, ...s.elseBody.flatMap(x => emit(x, level + 1, types))] : []), `${i}}`];
  case 'while': return [`${i}while (${expressionFor(s.condition, id, javaIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}// cuerpo vacío`]), `${i}}`];
  case 'do': return [`${i}do {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}// cuerpo vacío`]), `${i}} while (${expressionFor(s.condition, id, javaIdentifier)});`];
  case 'for': return [`${i}for (int ${javaIdentifier(s.variable)} = ${expressionFor(s.start, id, javaIdentifier)}; ${s.direction === 'Inc' ? `${javaIdentifier(s.variable)} <= ${expressionFor(s.end, id, javaIdentifier)}` : `${javaIdentifier(s.variable)} >= ${expressionFor(s.end, id, javaIdentifier)}`}; ${javaIdentifier(s.variable)} ${s.direction === 'Inc' ? '+=' : '-='} ${expressionFor(s.step, id, javaIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}// cuerpo vacío`]), `${i}}`];
} }
function renderFunction(fn: CoreFunction): string[] { const params = fn.parameters.map(p => `${javaType(p.type)} ${javaIdentifier(p.name)}`).join(', '); return [`    private static ${javaType(fn.returnType)} ${javaIdentifier(fn.name)}(${params}) {`, ...(fn.body.length ? fn.body.flatMap(s => emit(s, 2, variableTypes(fn))) : ['        // cuerpo vacío']), '    }']; }
export const javaGenerator: GeneratorPlugin = { id, label: 'Java', generate(program: CoreProgram): string {
  const className = program.name.replace(/[^A-Za-z0-9_$]/g, '') || 'FlowProgram'; const main = program.functions.find(f => f.name.toLowerCase() === 'main') ?? program.functions[0];
  const lines = [header(program), 'import java.util.Scanner;', '', `public class ${className} {`, '    private static final Scanner input = new Scanner(System.in);', ''];
  for (const fn of program.functions) lines.push(...renderFunction(fn), '');
  lines.push('    public static void main(String[] args) {', ...(main ? [`        ${javaIdentifier(main.name)}();`] : ['        // Selecciona una función principal en el proyecto.']), '    }', '}');
  return lines.join('\n');
} };
