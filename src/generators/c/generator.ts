import { CoreFunction, CoreProgram, CoreStatement } from '../coreIR';
import { GeneratorPlugin, LanguageId, expressionFor, indent, header } from '../shared';
import { cType } from './types';
import { cIdentifier } from './keywords';
const id: LanguageId = 'c';
function walk(body: readonly CoreStatement[], fn: (s: CoreStatement) => void): void { for (const s of body) { fn(s); if (s.kind === 'if') { walk(s.thenBody, fn); walk(s.elseBody, fn); } else if (s.kind === 'while' || s.kind === 'do' || s.kind === 'for') walk(s.body, fn); } }
function variableTypes(fn: CoreFunction): Map<string, string> { const types = new Map<string, string>(); for (const p of fn.parameters) types.set(p.name, p.type); walk(fn.body, s => { if (s.kind === 'declare') types.set(s.name, s.dataType); }); return types; }
function emit(s: CoreStatement, level: number, types: Map<string, string>): string[] {
  const i = indent(level);
  switch (s.kind) {
    case 'declare': {
      const name = cIdentifier(s.name); const type = s.dataType === 'String' ? 'char' : cType(s.dataType);
      if (s.arraySize) return [`${i}${type} ${name}[${expressionFor(s.arraySize, id, cIdentifier)}]${s.dataType === 'String' ? '[1024]' : ''};`];
      if (s.dataType === 'String') return [`${i}char ${name}[1024] = "";`];
      return [`${i}${type} ${name} = ${s.dataType === 'Boolean' ? 'false' : '0'};`];
    }
    case 'assign': { if (types.get(s.target.split('[')[0]) === 'String') throw new Error('COMPATIBILITY_UNKNOWN: asignar a variables String requiere copia segura de búfer en C; no se generará una asignación inválida.'); return [`${i}${expressionFor(s.target, id, cIdentifier)} = ${expressionFor(s.expression, id, cIdentifier)};`]; }
    case 'input': {
      const target = expressionFor(s.target, id, cIdentifier); const type = types.get(s.target.split('[')[0]);
      if (type === 'String') return [`${i}scanf("%1023s", ${target});`];
      if (type === 'Real') return [`${i}scanf("%lf", &${target});`];
      if (type === 'Integer') return [`${i}scanf("%d", &${target});`];
      if (type === 'Boolean') return [`${i}{ int __flow_bool_input = 0; scanf("%d", &__flow_bool_input); ${target} = __flow_bool_input != 0; }`];
      return [`${i}/* COMPATIBILITY_UNKNOWN: declarar el tipo de ${target} antes de Entrada. */`];
    }
    case 'output': {
      const expr = expressionFor(s.expression, id, cIdentifier); const simpleIdentifier = /^[\p{L}_][\p{L}\p{N}_]*$/u.test(s.expression.trim()); const type = simpleIdentifier ? types.get(s.expression.trim()) : undefined;
      const stringLiteral = /^".*"$/.test(expr.trim()) || /^'.*'$/.test(expr.trim());
      const format = stringLiteral || type === 'String' ? '%s' : type === 'Integer' || type === 'Boolean' ? '%d' : '%g';
      const value = type === 'Real' || (!type && !stringLiteral) ? `(double)(${expr})` : expr;
      return [`${i}printf("${format}${s.newLine ? '\\n' : ''}", ${value});`];
    }
    case 'comment': return [`${i}/* ${s.text.replace(/\*\//g, '* /').replace(/\n/g, ' ')} */`];
    case 'return': return [`${i}return${s.expression ? ` ${expressionFor(s.expression, id, cIdentifier)}` : ''};`];
    case 'call': return [`${i}${s.target ? `${cIdentifier(s.target)} = ` : ''}${cIdentifier(s.functionName)}(${s.args.map(a => expressionFor(a, id, cIdentifier)).join(', ')});`];
    case 'if': return [`${i}if (${expressionFor(s.condition, id, cIdentifier)}) {`, ...(s.thenBody.length ? s.thenBody.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}/* rama vacía */`]), ...(s.elseBody.length ? [`${i}} else {`, ...s.elseBody.flatMap(x => emit(x, level + 1, types))] : []), `${i}}`];
    case 'while': return [`${i}while (${expressionFor(s.condition, id, cIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}}`];
    case 'do': return [`${i}do {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}} while (${expressionFor(s.condition, id, cIdentifier)});`];
    case 'for': return [`${i}for (int ${cIdentifier(s.variable)} = ${expressionFor(s.start, id, cIdentifier)}; ${s.direction === 'Inc' ? `${cIdentifier(s.variable)} <= ${expressionFor(s.end, id, cIdentifier)}` : `${cIdentifier(s.variable)} >= ${expressionFor(s.end, id, cIdentifier)}`}; ${cIdentifier(s.variable)} ${s.direction === 'Inc' ? '+=' : '-='} ${expressionFor(s.step, id, cIdentifier)}) {`, ...(s.body.length ? s.body.flatMap(x => emit(x, level + 1, types)) : [`${indent(level + 1)}/* cuerpo vacío */`]), `${i}}`];
  }
}
function returnType(type: string): string { return type === 'Void' ? 'void' : cType(type); }
function renderFunction(fn: CoreFunction): string[] { const args = fn.parameters.map(p => `${cType(p.type)} ${cIdentifier(p.name)}`).join(', ') || 'void'; const types = variableTypes(fn); return [`${returnType(fn.returnType)} ${cIdentifier(fn.name)}(${args}) {`, ...(fn.body.length ? fn.body.flatMap(s => emit(s, 1, types)) : ['    /* cuerpo vacío */']), '}']; }
export const cGenerator: GeneratorPlugin = { id, label: 'C', generate(program: CoreProgram): string {
  const lines = [header(program), '#include <stdio.h>', '#include <stdbool.h>', '#include <math.h>', ''];
  for (const fn of program.functions) { const args = fn.parameters.map(p => `${cType(p.type)} ${cIdentifier(p.name)}`).join(', ') || 'void'; lines.push(`${returnType(fn.returnType)} ${cIdentifier(fn.name)}(${args});`); }
  lines.push('');
  for (const fn of program.functions) lines.push(...renderFunction(fn), '');
  const main = program.functions.find(f => f.name.toLowerCase() === 'main');
  lines.push('int main(void) {', ...(main ? [`    ${cIdentifier(main.name)}();`] : ['    /* Selecciona una función principal en el proyecto. */']), '    return 0;', '}');
  return lines.join('\n');
} };
