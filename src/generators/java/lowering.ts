import { CoreStatement } from '../coreIR';
/** Java natively supports if/while/do-while/for. */
export function javaSupports(statement: CoreStatement): boolean { return statement.kind !== 'call' || statement.functionName.length > 0; }
