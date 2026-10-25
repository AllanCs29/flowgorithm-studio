export interface TextFile { readonly name: string; readonly text: string; }
interface FileSystemWindow extends Window { showOpenFilePicker?: (options?: unknown) => Promise<Array<{ getFile(): Promise<File> }>>; showSaveFilePicker?: (options?: unknown) => Promise<{ createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }> }>; }
export async function openTextFile(accept: Record<string, string[]> = { 'application/json': ['.json'], 'application/xml': ['.fprg', '.xml'] }): Promise<TextFile> {
  const w = window as FileSystemWindow;
  if (w.showOpenFilePicker) { const [handle] = await w.showOpenFilePicker({ multiple: false, types: [{ description: 'Flowgorithm / JSON', accept }] }); const file = await handle.getFile(); return { name: file.name, text: await file.text() }; }
  return new Promise((resolve, reject) => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.fprg,.xml,.json,application/xml,application/json'; input.onchange = async () => { const file = input.files?.[0]; if (!file) return reject(new Error('No se seleccionó un archivo.')); resolve({ name: file.name, text: await file.text() }); }; input.click(); });
}
export async function saveTextFile(name: string, text: string, mime = 'application/json'): Promise<void> {
  const w = window as FileSystemWindow;
  if (w.showSaveFilePicker) { const handle = await w.showSaveFilePicker({ suggestedName: name, types: [{ description: 'Archivo de proyecto', accept: { [mime]: [name.endsWith('.fprg') ? '.fprg' : '.json'] } }] }); const writer = await handle.createWritable(); await writer.write(text); await writer.close(); return; }
  const url = URL.createObjectURL(new Blob([text], { type: mime })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
export const LOCAL_PROJECT_KEY = 'flowgorithm-studio.project.v1';
export function saveLocal(text: string): void { localStorage.setItem(LOCAL_PROJECT_KEY, text); }
export function loadLocal(): string | null { return localStorage.getItem(LOCAL_PROJECT_KEY); }