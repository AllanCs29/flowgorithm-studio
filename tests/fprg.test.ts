import { describe, expect, it } from 'vitest';
import { importFprg, exportFprg } from '../src/compatibility/flowgorithm/fprg';
import { validateProject } from '../src/domain/structural';

const xml = `<?xml version="1.0"?><flowgorithm fileversion="4.2"><attributes><attribute name="name" value="Test"/></attributes><function name="Main" type="None"><parameters/><body><start/><declare id="d1" name="edad" type="Integer"/><input variable="edad"/><if expression="edad &gt;= 18"><then><output expression="&quot;adulto&quot;" newline="True"/></then><else><output expression="&quot;menor&quot;" newline="True"/></else></if><end/></body></function></flowgorithm>`;

describe('Flowgorithm XML compatibility subset', () => {
  it('imports common sequence and If branches into a valid structural tree', () => {
    const project = importFprg(xml);
    expect(validateProject(project).valid).toBe(true);
    expect(Object.values(project.functions[project.mainFunctionId].nodes).some(node => node.type === 'If')).toBe(true);
  });
  it('rejects an unknown primitive type rather than silently converting it to Integer', () => {
    const invalid = xml.replace('type="Integer"', 'type="Mystery"');
    expect(() => importFprg(invalid)).toThrow('Tipo de dato de Flowgorithm no soportado');
  });
  it('rejects an unknown For direction rather than guessing increment', () => {
    const invalid = xml.replace('</body>', '<for variable="i" start="0" end="2" step="1" direction="Sideways"><body /></for></body>');
    expect(() => importFprg(invalid)).toThrow('Dirección del ciclo Para no reconocida');
  });
  it('interpreta array=False como variable, y True+size como arreglo', () => {
    const withArrayFlags = xml.replace('name="edad" type="Integer"', 'name="edad" type="Integer" array="False" size=""');
    const project = importFprg(withArrayFlags);
    const declared = Object.values(project.functions[project.mainFunctionId].nodes).find(node => node.type === 'Declare');
    expect(declared?.type === 'Declare' ? declared.arraySize : undefined).toBeUndefined();
    const trueArray = importFprg(withArrayFlags.replace('array="False" size=""', 'array="True" size="7"'));
    const array = Object.values(trueArray.functions[trueArray.mainFunctionId].nodes).find(node => node.type === 'Declare');
    expect(array?.type === 'Declare' ? array.arraySize : undefined).toBe('7');
    const exported = exportFprg(project);
    expect(exported).toContain('array="False"');
    expect(exported).toContain('size=""');
  });
  it('dibuja Main/End implícitos al importar un archivo nativo .fprg sin óvalos XML', () => {
    const native = '<?xml version="1.0"?><flowgorithm fileversion="4.2"><function name="Main" type="None"><parameters/><body><declare name="area, radius" type="Real" array="False" size=""/><input variable="radius"/><assign variable="area" expression="pi * radius ^ 2"/><output expression="&quot;The area is &quot; &amp; area" newline="True"/></body></function></flowgorithm>';
    const project = importFprg(native);
    const main = project.functions[project.mainFunctionId];
    expect(main.nodes[main.rootNodeId].type).toBe('Start');
    expect(Object.values(main.nodes).some(node => node.type === 'End')).toBe(true);
    expect(validateProject(project).valid).toBe(true);
  });
  it('exports the supported subset with an XML root', () => {
    const project = importFprg(xml);
    const result = exportFprg(project);
    expect(result).toContain('<flowgorithm');
    expect(result).toContain('<if');
    expect(result).toContain('<then>');
  });
});
