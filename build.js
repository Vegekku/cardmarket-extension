/**
 * @module build
 * @description Bundlea los ficheros fuente de src/ a dist/ usando esbuild.
 * Uso: node build.js [--watch] [--dev]
 */

import esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';

const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

mkdirSync('dist/icons', { recursive: true });

['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png', 'src/popup.html', 'manifest.json'].forEach(f => {
    copyFileSync(f, `dist/${f.replace('src/', '')}`);
});

const logPlugin = { name: 'log', setup(build) { build.onEnd(() => console.log('rebuilt')); } };

const ctx = await esbuild.context({
    entryPoints: {
        content:    'src/content.js',
        background: 'src/background.js',
        popup:      'src/popup.js',
        'popup.css': 'src/popup.css',
    },
    bundle: true,
    minify: !dev,
    define: dev ? { __BUILD_TIME__: JSON.stringify(new Date().toLocaleString('es-ES')) } : {},
    outdir: 'dist',
    plugins: [logPlugin],
    format: 'esm',
    platform: 'browser',
    target: 'chrome110',
});

if (watch) {
    await ctx.watch();
    console.log('esbuild watching...');
    const { watch: fsWatch } = await import('fs');
    ['src/popup.html', 'manifest.json'].forEach(f => {
        fsWatch(f, () => {
            copyFileSync(f, `dist/${f.replace('src/', '')}`);
            console.log(`copied ${f}`);
        });
    });
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('Build done.');
}
