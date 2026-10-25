import { indent } from '../shared';
/** Flowgorithm's post-test Do loop lowered to Python's pre-test while True + break. */
export function lowerDoWhile(condition: string, emittedBody: readonly string[], level: number): string[] {
  const current = indent(level);
  const body = emittedBody.length ? [...emittedBody] : [`${indent(level + 1)}pass`];
  return [`${current}while True:`, ...body, `${indent(level + 1)}if not (${condition}):`, `${indent(level + 2)}break`];
}
