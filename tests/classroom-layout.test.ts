import { describe, it, expect } from 'vitest';
import { LayoutEngine } from '../src/layout/layoutEngine';
import { exercises } from '../src/learning/learning';

describe('Teaching-friendly routes', () => {
  it('draws distinct Si and No arrows that merge without a repeating return edge', () => {
    const exercise=exercises.find(e=>e.id==='even-odd')!;
    const layout=new LayoutEngine().calculate(exercise.project.functions.main);
    expect(layout.edges.some(e=>e.kind==='true' && e.label==='Sí')).toBe(true);
    expect(layout.edges.some(e=>e.kind==='false' && e.label==='No')).toBe(true);
    expect(layout.edges.some(e=>e.kind==='return')).toBe(false);
  });
  it('draws an explicit loop return arrow for Mientras, Hacer and Para', () => {
    for(const id of ['counter','do-once','for-count']) {
      const exercise=exercises.find(e=>e.id===id)!;
      const layout=new LayoutEngine().calculate(exercise.project.functions.main);
      expect(layout.edges.some(edge=>edge.kind==='return')).toBe(true);
    }
  });
  it('keeps each node geometry finite in both orientations', () => {
    const exercise=exercises.find(e=>e.id==='final-grades')!;
    for(const orientation of ['Vertical','Horizontal'] as const){
      const layout=new LayoutEngine().calculate(exercise.project.functions.main,{orientation,gapX:58,gapY:40,branchGap:70,nodeWidth:168,nodeHeight:58});
      for(const point of Object.values(layout.nodes)) for(const value of Object.values(point)) expect(Number.isFinite(value)).toBe(true);
    }
  });
});
