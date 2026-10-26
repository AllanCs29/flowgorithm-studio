import { CoreProgram, CoreStatement } from './coreIR';
import { Expr, parseExpression } from '../parser/expression';
export type LanguageId = 'python' | 'javascript' | 'c' | 'cpp' | 'java';
export interface GeneratorPlugin { readonly id: LanguageId; readonly label: string; generate(program: CoreProgram): string; }
export function indent(level: number): string { return '    '.repeat(level); }
export function escapeString(value: string, quote = '"'): string { return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(new RegExp(quote, 'g'), `\\${quote}`); }
export function expressionFor(value: string, language: LanguageId, mapIdentifier: (name: string) => string = name => name): string {
  const tree = parseExpression(value);
  const render = (expr: Expr): string => {
    if (expr.kind === 'literal') {
      if (typeof expr.value === 'string') return JSON.stringify(expr.value);
      if (typeof expr.value === 'boolean') return language === 'python' ? (expr.value ? 'True' : 'False') : (expr.value ? 'true' : 'false');
      return String(expr.value);
    }
    if (expr.kind === 'identifier') return mapIdentifier(expr.name);
    if (expr.kind === 'index') return `${render(expr.array)}[${render(expr.offset)}]`;
    if (expr.kind === 'call') {
      const args = expr.args.map(render); const name=expr.name.toLowerCase();
      if(args.length===1){
        const a=args[0];
        if(name==='len'){
          if(language==='python')return `len(${a})`;
          if(language==='javascript')return `(${a}).length`;
          throw new Error('COMPATIBILITY_UNKNOWN: len() necesita distinguir arreglo y cadena en este generador.');
        }
        if(name==='lower'||name==='upper'){
          if(language==='python')return `(${a}).${name}()`;
          if(language==='javascript')return `String(${a}).${name==='lower'?'toLowerCase':'toUpperCase'}()`;
          throw new Error(`COMPATIBILITY_UNKNOWN: ${name}() requiere una función de biblioteca de texto en ${language}.`);
        }
        if(name==='int'){
          if(language==='python')return `int(${a})`;
          if(language==='javascript')return `Math.trunc(${a})`;
          throw new Error('COMPATIBILITY_UNKNOWN: conversión int() específica del lenguaje.');
        }
        if(name==='str'){
          if(language==='python')return `str(${a})`;
          if(language==='javascript')return `String(${a})`;
          throw new Error('COMPATIBILITY_UNKNOWN: conversión str() específica del lenguaje.');
        }
        if(name==='round'||name==='sqrt'||name==='abs'){
          if(language==='javascript')return `Math.${name}(${a})`;
          if(language==='python')return `${name==='sqrt'?'__import__("math").sqrt':name}(${a})`;
          if(name==='sqrt'&&language==='java')return `Math.sqrt(${a})`;
          if(name==='abs'&&language==='java')return `Math.abs(${a})`;
          throw new Error(`COMPATIBILITY_UNKNOWN: intrínseca ${name}() sin mapeo fiable para ${language}.`);
        }
      }
      return `${mapIdentifier(expr.name)}(${args.join(', ')})`;
    }
    if (expr.kind === 'unary') {
      const inner = render(expr.value);
      if (expr.op === 'not' || expr.op === '!') return language === 'python' ? `not (${inner})` : `!(${inner})`;
      return `${expr.op}(${inner})`;
    }
    const left = render(expr.left); const right = render(expr.right);
    if (expr.op === '^') {
      if (language === 'python' || language === 'javascript') return `(${left} ** ${right})`;
      if (language === 'java') return `Math.pow(${left}, ${right})`;
      return `pow(${left}, ${right})`;
    }
    if(expr.op==='mod')return `(${left} % ${right})`;
    if(expr.op==='&') {
      if(language==='python')return `(str(${left}) + str(${right}))`;
      if(language==='javascript')return `(String(${left}) + String(${right}))`;
      if(language==='java')return `(String.valueOf(${left}) + String.valueOf(${right}))`;
      if(language==='cpp')return `([&](){ std::ostringstream flowText; flowText << ${left} << ${right}; return flowText.str(); }())`;
      throw new Error('COMPATIBILITY_UNKNOWN: concatenar texto con & en C requiere conocer los tipos y reservar memoria; no se emitirá código inválido.');
    }
    const op = expr.op === '=' || expr.op === '==' ? '==' : expr.op === '<>' || expr.op === '!=' ? '!=' : expr.op === 'and' || expr.op === '&&' ? (language === 'python' ? 'and' : '&&') : expr.op === 'or' || expr.op === '||' ? (language === 'python' ? 'or' : '||') : expr.op;
    if (op === '+' && language === 'c' && (expr.left.kind === 'literal' && typeof expr.left.value === 'string' || expr.right.kind === 'literal' && typeof expr.right.value === 'string')) throw new Error('COMPATIBILITY_UNKNOWN: concatenación de cadenas en C requiere una estrategia explícita.');
    if (op === '+' && language === 'cpp' && (expr.left.kind === 'literal' && typeof expr.left.value === 'string' || expr.right.kind === 'literal' && typeof expr.right.value === 'string')) return `(string(${left}) + ${right})`;
    return `(${left} ${op} ${right})`;
  };
  return render(tree);
}
export function bodyStatements(body: readonly CoreStatement[], emit: (statement: CoreStatement, level: number) => string[], level: number): string[] { return body.flatMap(s => emit(s, level)); }
export function outputString(expression: string): string { return /^".*"$/.test(expression.trim()) || /^'.*'$/.test(expression.trim()) ? expression : expression; }
export function header(program: CoreProgram): string { return `/* Generated by Flowgorithm Studio: ${program.name.replace(/\*\//g, '* /')} */`; }