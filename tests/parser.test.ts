import { describe, expect, it } from 'vitest';
import { evaluate, parseExpression } from '../src/parser/expression';
describe('Expression parser', () => {
  it('honors arithmetic precedence', () => expect(evaluate('2 + 3 * 4', {})).toBe(14));
  it('evaluates boolean expressions', () => expect(evaluate('edad >= 18 and true', { edad: 20 })).toBe(true));
  it('supports quoted strings', () => expect(evaluate('"Hola" & " mundo"', {})).toBe('Hola mundo'));
  it('uses & for concatenation and leaves + for arithmetic in the learning language', () => { expect(evaluate('"Hola" & 3',{})).toBe('Hola3'); expect(evaluate('3 + 2',{})).toBe(5); });
  it('respects Flowgorithm relational and unary precedence, plus mod',()=>{
    expect(evaluate('5 mod 2',{})).toBe(1);
    expect(evaluate('-2 ^ 2',{})).toBe(4);
    expect(evaluate('"2" < "3" & "4"',{})).toBe(true);
  });
  it('rejects unknown identifiers', () => expect(() => evaluate('falta + 2', {})).toThrow(/no está declarada/));
  it('short-circuits logical operators', () => expect(evaluate('false and (1 / 0 > 2)', {})).toBe(false));
  it('rejects an incomplete expression', () => expect(() => parseExpression('2 +')).toThrow());
});