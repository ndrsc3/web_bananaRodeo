// Runtime-load gate for the serverless functions: compile api/ as written, then actually
// import() each entrypoint under Node ESM. Static checks never load a function under the
// runtime that serves it, so they stay green while every /api/* route 500s.
//
// Ported from squatWithMe (_underScore/knowledge/vercel-api-runtime-gate.md), where it
// caught two shipped failures: package.json missing "type": "module", and extensionless
// relative imports (Node's ESM resolver needs `./storage.js`).
//
// Compiles with Vite's esbuild transform (transpile only, no type check, no bundling), as Vercel does:
// api/ is not type-clean, and a type error is not what 500s a route.
//
// Usage: npm run smoke
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { transformWithEsbuild } from 'vite';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.smoke');

// Asserted explicitly: Node 22+ auto-detects ESM in .js files with no "type" field, so a
// modern local Node loads what Vercel's runtime rejects.
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (pkg.type !== 'module') {
    console.error('✗ smoke: package.json must declare "type": "module" — without it every function 500s.');
    process.exit(1);
}

const sources = readdirSync(join(root, 'api')).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir);
for (const f of sources) {
    const path = join(root, 'api', f);
    const { code } = await transformWithEsbuild(readFileSync(path, 'utf8'), path, { loader: 'ts', format: 'esm' });
    writeFileSync(join(outDir, f.replace(/\.ts$/, '.js')), code);
}

let failed = 0;
for (const name of sources.map((f) => f.replace(/\.ts$/, '.js')).sort()) {
    try {
        const mod = await import(pathToFileURL(join(outDir, name)).href);
        if (typeof mod.default !== 'function') {
            // Shared modules (storage.ts) have no handler; they still had to load.
            console.log(`✓ ${name} (module, no handler)`);
            continue;
        }
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name} — ${error.code ?? 'load failed'}: ${error.message.split('\n')[0]}`);
        failed++;
    }
}
rmSync(outDir, { recursive: true, force: true });

console.log(`\n${sources.length - failed}/${sources.length} api files load under the Node runtime`);
if (failed > 0) {
    console.error('✗ smoke FAILED — these would 500 in production');
    process.exit(1);
}
