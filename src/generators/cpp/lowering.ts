import { CoreStatement } from '../coreIR';
/** C++ has native branches and loops; this hook is reserved for semantic adaptations. */
export function cppSupports(statement: CoreStatement): boolean { return statement.kind !== 'call' || statement.functionName.length > 0; }
