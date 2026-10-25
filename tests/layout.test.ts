import { describe, expect, it } from 'vitest';
import { sampleProject } from '../src/domain/sampleProject';
import { LayoutEngine } from '../src/layout/layoutEngine';

describe('Structural layout', () => {
  it('assigns finite geometry to every reachable block in vertical orientation', () => {
    const func = sampleProject.functions.main;
    const layout = new LayoutEngine().calculate(func, { orientation: 'Vertical', gapX: 40, gapY: 30, branchGap: 55, nodeWidth: 168, nodeHeight: 58 });
    expect(Object.keys(layout.nodes).sort()).toEqual(Object.keys(func.nodes).sort());
    for (const point of Object.values(layout.nodes)) for (const value of Object.values(point)) expect(Number.isFinite(value)).toBe(true);
  });
  it('supports horizontal structural layout without writing geometry into the AST', () => {
    const func = sampleProject.functions.main;
    const before = JSON.stringify(func);
    const layout = new LayoutEngine().calculate(func, { orientation: 'Horizontal', gapX: 40, gapY: 30, branchGap: 55, nodeWidth: 168, nodeHeight: 58 });
    expect(layout.orientation).toBe('Horizontal');
    expect(layout.width).toBeGreaterThan(0);
    expect(JSON.stringify(func)).toBe(before);
  });
});
