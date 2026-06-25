import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'scripts'];
const extraFiles = ['vite.config.js', 'eslint.config.js', 'dev.user.js'];

function collectJsFiles(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectJsFiles(fullPath, files);
    } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = [...roots.flatMap((root) => collectJsFiles(root)), ...extraFiles];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
