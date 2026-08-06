/**
 * @module zip
 * @description Genera un zip distribuible para la Chrome Web Store.
 * Hace checkout del tag indicado (o el último si no se especifica), ejecuta
 * el build de producción, zipea dist/ en packages/cardmarket-extension-vX.Y.Z.zip
 * y vuelve a la rama original.
 *
 * Uso: node zip.js [vX.Y.Z]
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Ejecuta un comando de shell y devuelve su stdout.
 * @param {string} cmd - Comando a ejecutar.
 * @returns {string} Stdout recortado.
 */
function run(cmd) {
    return execSync(cmd, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
}

const currentBranch = run('git rev-parse --abbrev-ref HEAD');
const requestedTag = process.argv[2];
const tag = requestedTag ?? run('git tag --sort=-version:refname | head -1');

if (!tag) {
    console.error('No git tags found.');
    process.exit(1);
}

const zipName = `cardmarket-extension-${tag}.zip`;
const packagesDir = resolve('packages');
const zipPath = resolve(packagesDir, zipName);

if (existsSync(zipPath)) {
    console.log(`Package already exists: packages/${zipName}`);
    process.exit(0);
}

console.log(`Checking out ${tag}...`);
run(`git checkout ${tag}`);

try {
    console.log('Building...');
    run('node build.js');

    mkdirSync(packagesDir, { recursive: true });

    console.log(`Zipping dist/ → packages/${zipName}...`);
    run(`zip -r "${zipPath}" dist/`);

    console.log(`\nPackage ready: packages/${zipName}`);
} finally {
    console.log(`Returning to ${currentBranch}...`);
    run(`git checkout ${currentBranch}`);
}
