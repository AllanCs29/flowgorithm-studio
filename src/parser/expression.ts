export type Expr =
  | { readonly kind: 'literal'; readonly value: number | string | boolean }
  | { readonly kind: 'identifier'; readonly name: string }
  | { readonly kind: 'index'; readonly array: Expr; readonly offset: Expr }
  | { readonly kind: 'unary'; readonly op: string; readonly value: Expr }
  | { readonly kind: 'binary'; readonly op: string; readonly left: Expr; readonly right: Expr }
  | { readonly kind: 'call'; readonly name: string; readonly args: readonly Expr[] };
export type Value = number | string | boolean;
interface Token { readonly type: 'number' | 'string' | 'identifier' | 'operator' | 'eof'; readonly text: string; readonly pos: number; }
export class ExpressionError extends Error { constructor(message: string, readonly position: number) { super(`${message} (posición ${position + 1})`); this.name = 'ExpressionError'; } }

function tokenize(source: string): Token[] {
  const tokens: Token[] = []; let i = 0;
  while (i < source.length) {
    const c = source[i]; if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i + 1] ?? ''))) { const start = i++; while (/[0-9]/.test(source[i] ?? '')) i++; if (source[i] === '.') { i++; while (/[0-9]/.test(source[i] ?? '')) i++; } tokens.push({ type: 'number', text: source.slice(start, i), pos: start }); continue; }
    if (c === '"' || c === "'") { const start = i; const quote = c; i++; let value = ''; let closed = false; while (i < source.length) { const ch = source[i++]; if (ch === quote) { closed = true; break; } if (ch === '\\' && i < source.length) { const esc = source[i++]; value += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc; } else value += ch; } if (!closed) throw new ExpressionError('Cadena sin cerrar', start); tokens.push({ type: 'string', text: value, pos: start }); continue; }
    if (/[A-Za-z_ÁÉÍÓÚáéíóúÑñ]/.test(c)) { const start = i++; while (/[\wÁÉÍÓÚáéíóúÑñ]/.test(source[i] ?? '')) i++; tokens.push({ type: 'identifier', text: source.slice(start, i), pos: start }); continue; }
    const two = source.slice(i, i + 2); if (['>=', '<=', '==', '!=', '<>', '&&', '||'].includes(two)) { tokens.push({ type: 'operator', text: two, pos: i }); i += 2; continue; }
    if ('+-*/%^()!,<>=[]&'.includes(c)) { tokens.push({ type: 'operator', text: c, pos: i++ }); continue; }
    throw new ExpressionError(`Carácter no reconocido “${c}”`, i);
  }
  tokens.push({ type: 'eof', text: '', pos: source.length }); return tokens;
}
const precedence: Readonly<Record<string, number>> = { or: 1, '||': 1, and: 2, '&&': 2, '=': 3, '==': 3, '!=': 3, '<>': 3, '<': 4, '<=': 4, '>': 4, '>=': 3, '&': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 7 };
export function parseExpression(source: string): Expr {
  const tokens = tokenize(source); let index = 0; const peek = () => tokens[index]; const take = () => tokens[index++];
  function parse(min = 0): Expr {
    const token = take(); let left: Expr;
    if (token.type === 'number') left = { kind: 'literal', value: Number(token.text) };
    else if (token.type === 'string') left = { kind: 'literal', value: token.text };
    else if (token.type === 'identifier') {
      const lower = token.text.toLowerCase();
      if (lower === 'true' || lower === 'false') left = { kind: 'literal', value: lower === 'true' };
      else if (lower === 'not') left = { kind: 'unary', op: 'not', value: parse(7) };
      else if (peek().text === '(') { take(); const args: Expr[] = []; if (peek().text !== ')') { for (;;) { args.push(parse(0)); if (peek().text !== ',') break; take(); } } if (take().text !== ')') throw new ExpressionError('Falta )', peek().pos); left = { kind: 'call', name: token.text, args }; }
      else left = { kind: 'identifier', name: token.text };
    } else if (token.text === '(') { left = parse(0); if (take().text !== ')') throw new ExpressionError('Falta )', peek().pos); }
    else if (['-', '+', '!'].includes(token.text)) left = { kind: 'unary', op: token.text, value: parse(7) };
    else throw new ExpressionError(`Se esperaba un valor, llegó “${token.text}”`, token.pos);
    while (peek().text === '[') { take(); const offset = parse(0); if (take().text !== ']') throw new ExpressionError('Falta ] en el índice del arreglo', peek().pos); left = { kind: 'index', array: left, offset }; }
    while (peek().type === 'operator' || peek().type === 'identifier') {
      const op = peek().text.toLowerCase(); const p = precedence[op]; if (p === undefined || p < min) break; take(); const right = parse(p + (op === '^' ? 0 : 1)); left = { kind: 'binary', op, left, right };
    }
    return left;
  }
  const result = parse(); if (peek().type !== 'eof') throw new ExpressionError(`Token inesperado “${peek().text}”`, peek().pos); return result;
}

export type Scope = Readonly<Record<string, Value | readonly Value[]>>;
const truthy = (v: Value): boolean => typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : v.length > 0;
export type UserFunctionEvaluator = (name: string, args: readonly Value[]) => Value;
export function evaluateExpression(expr: Expr, scope: Scope, userFunction?: UserFunctionEvaluator): Value {
  if (expr.kind === 'literal') return expr.value;
  if (expr.kind === 'identifier') { if (expr.name.toLowerCase() === 'pi') return Math.PI; if (!(expr.name in scope)) throw new Error(`La variable “${expr.name}” no está declarada.`); const item = scope[expr.name]; if (Array.isArray(item)) throw new Error(`El arreglo “${expr.name}” necesita un índice, por ejemplo ${expr.name}[0].`); return item as Value; }
  if (expr.kind === 'index') {
    if (expr.array.kind !== 'identifier') throw new Error('Solo se admite el acceso nombre[índice].');
    const name = expr.array.name;
    if (!(name in scope)) throw new Error(`El arreglo “${name}” no está declarado.`);
    const values = scope[name];
    if (!Array.isArray(values) && typeof values !== 'string') throw new Error(`“${name}” no es un arreglo ni texto.`);
    const offset = evaluateExpression(expr.offset, scope, userFunction);
    if (typeof offset !== 'number' || !Number.isSafeInteger(offset)) throw new Error(`El índice de “${name}” debe ser un entero.`);
    if (offset < 0 || offset >= values.length) throw new Error(`Índice ${offset} fuera del arreglo “${name}” (0 a ${values.length - 1}).`);
    return values[offset];
  }
  if (expr.kind === 'unary') { const v = evaluateExpression(expr.value, scope, userFunction); if (expr.op === 'not' || expr.op === '!') return !truthy(v); if (typeof v !== 'number') throw new Error(`El operador ${expr.op} necesita un número.`); return expr.op === '-' ? -v : v; }
  if (expr.kind === 'call') {
    if (expr.name.toLowerCase() === 'len' && expr.args.length === 1 && expr.args[0].kind === 'identifier') {
      const subject = scope[expr.args[0].name];
      if (Array.isArray(subject)) return subject.length;
    }
    const args = expr.args.map(a => evaluateExpression(a, scope, userFunction)); const name = expr.name.toLowerCase();
    if (name === 'abs' && args.length === 1 && typeof args[0] === 'number') return Math.abs(args[0]);
    if (name === 'sqrt' && args.length === 1 && typeof args[0] === 'number') return Math.sqrt(args[0]);
    if (name === 'round' && args.length === 1 && typeof args[0] === 'number') return Math.round(args[0]);
    if (name === 'int' && args.length === 1) return Math.trunc(Number(args[0]));
    if (name === 'str' && args.length === 1) return String(args[0]);
    if (name === 'len' && args.length === 1 && typeof args[0] === 'string') return args[0].length;
    if (name === 'lower' && args.length === 1 && typeof args[0] === 'string') return args[0].toLocaleLowerCase('es');
    if (name === 'upper' && args.length === 1 && typeof args[0] === 'string') return args[0].toLocaleUpperCase('es');
    if (userFunction) return userFunction(expr.name, args);
    throw new Error(`Función ${expr.name} no soportada o argumentos incorrectos.`);
  }
  const left = evaluateExpression(expr.left, scope, userFunction);
  // Logical operators short-circuit: the right side is evaluated only when needed.
  // This avoids spurious errors for expressions such as `false and 1 / 0 > 2`.
  if (expr.op === 'and' || expr.op === '&&') return truthy(left) ? truthy(evaluateExpression(expr.right, scope, userFunction)) : false;
  if (expr.op === 'or' || expr.op === '||') return truthy(left) ? true : truthy(evaluateExpression(expr.right, scope, userFunction));
  const right = evaluateExpression(expr.right, scope, userFunction);
  switch (expr.op) {
    case 'and': case '&&': return truthy(left) && truthy(right);
    case 'or': case '||': return truthy(left) || truthy(right);
    case '=': case '==': return left === right;
    case '!=': case '<>': return left !== right;
    case '&': return String(left) + String(right);
    case '+': if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right); if (typeof left === 'number' && typeof right === 'number') return left + right; break;
    case '-': if (typeof left === 'number' && typeof right === 'number') return left - right; break;
    case '*': if (typeof left === 'number' && typeof right === 'number') return left * right; break;
    case '/': if (typeof left === 'number' && typeof right === 'number') { if (right === 0) throw new Error('División entre cero.'); return left / right; } break;
    case '%': if (typeof left === 'number' && typeof right === 'number') { if (right === 0) throw new Error('Módulo entre cero.'); return left % right; } break;
    case '^': if (typeof left === 'number' && typeof right === 'number') return left ** right; break;
    case '<': case '<=': case '>': case '>=': {
      if (typeof left !== typeof right || typeof left === 'boolean') throw new Error(`No se pueden comparar ${String(left)} y ${String(right)}.`);
      if (typeof left === 'number' && typeof right === 'number') return expr.op === '<' ? left < right : expr.op === '<=' ? left <= right : expr.op === '>' ? left > right : left >= right;
      if (typeof left === 'string' && typeof right === 'string') return expr.op === '<' ? left < right : expr.op === '<=' ? left <= right : expr.op === '>' ? left > right : left >= right;
      break;
    }
  }
  throw new Error(`Tipos incompatibles para ${expr.op}.`);
}
export function evaluate(source: string, scope: Scope): Value { return evaluateExpression(parseExpression(source), scope); }
export function formatValue(value: Value): string { return typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value); }