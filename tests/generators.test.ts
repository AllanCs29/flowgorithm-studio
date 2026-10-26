import { describe, expect, it } from 'vitest';
import { sampleProject } from '../src/domain/sampleProject';
import { toCoreIR } from '../src/generators/coreIR';
import { generateCode } from '../src/generators';
describe('Language generators', () => {
  it('has independent generators for target languages', () => { const core = toCoreIR(sampleProject.functions.main); expect(generateCode(core, 'python')).toContain('def Main'); expect(generateCode(core, 'javascript')).toContain('function Main'); expect(generateCode(core, 'java')).toContain('public class'); expect(generateCode(core, 'c')).toContain('#include <stdio.h>'); expect(generateCode(core, 'cpp')).toContain('#include <iostream>'); });
  it('translates Flowgorithm string concatenation without generating a bitwise operator', () => {
    const program = {name:'Texto',functions:[{name:'Main',parameters:[],returnType:'Void',body:[
      {kind:'output',expression:'"Hola " & 5',newLine:true}
    ]}]} as const;
    expect(generateCode(program,'python')).toContain('str(');
    expect(generateCode(program,'javascript')).toContain('String(');
    expect(generateCode(program,'java')).toContain('String.valueOf(');
    expect(generateCode(program,'cpp')).toContain('std::ostringstream');
    expect(() => generateCode(program,'c')).toThrow(/COMPATIBILITY_UNKNOWN/);
  });
  it('uses target-safe identifiers inside expressions, not only on declarations and assignments', () => {
    const core = {
      name: 'Reserved identifier test',
      functions: [{
        name: 'Main', parameters: [], returnType: 'Void',
        body: [
          { kind: 'declare', name: 'for', dataType: 'Integer' },
          { kind: 'assign', target: 'for', expression: '2' },
          { kind: 'output', expression: 'for + 1', newLine: true }
        ]
      }]
    } as const;
    const js = generateCode(core, 'javascript');
    const py = generateCode(core, 'python');
    expect(js).toContain('let _for = 0;');
    expect(js).toContain('_for = 2;');
    expect(js).toContain('console.log((_for + 1));');
    expect(py).toContain('_for = 0');
    expect(py).toContain('_for = 2');
    expect(py).toContain('print((_for + 1)');
  });

});