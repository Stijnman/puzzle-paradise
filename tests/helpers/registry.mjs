import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function loadRegistry() {
  const source = fs.readFileSync(path.join(root, 'assets/puzzle-registry.js'), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: 'assets/puzzle-registry.js' });
  return context.window.PP_REGISTRY.map(item => ({ ...item }));
}

export { root };
