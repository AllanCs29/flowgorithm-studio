import { CoreStatement } from '../coreIR';
/** C supports if/while/do-while/for natively. Unknown high-level nodes are rejected by the emitter. */
export function cSupports(statement: CoreStatement): boolean { return statement.kind !== 'call' || statement.functionName.length > 0; }
