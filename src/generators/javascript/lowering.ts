import { CoreStatement } from '../coreIR';
/** JavaScript has native do-while syntax; this pass confirms support without rewriting. */
export function lowerJavaScript(statement: CoreStatement): CoreStatement { return statement; }
