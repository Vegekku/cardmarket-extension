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

const staticFiles = [
    'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
    'src/options/popup.html', 'src/options/options.html',
    'src/options/styles/common.css', 'src/options/styles/popup.css', 'src/options/styles/options.css', 'src/options/styles/preview.css', 'src/options/styles/order-preview.css',
    'src/content/content-order.css',
    'manifest.json'
];
staticFiles.forEach(f => copyFileSync(f, `dist/${f.replace('src/options/styles/', '').replace('src/options/', '').replace('src/content/', '').replace('src/', '')}`));

const logPlugin = { name: 'log', setup(build) { build.onEnd(() => console.log(`[${new Date().toLocaleString('es-ES')}] rebuilt`)); } };

const ctx = await esbuild.context({
    entryPoints: {
        'content-highlight':      'src/content/content-highlight.js',
        'content-order':          'src/content/content-order.js',
        'content-game-switcher':  'src/content/content-game-switcher.js',
        popup:                    'src/options/popup.js',
        options:                  'src/options/options.js',
    },
    bundle: true,
    minify: !dev,
    define: dev ? { __BUILD_TIME__: JSON.stringify(new Date().toLocaleString('es-ES')) } : {},
    outdir: 'dist',
    plugins: [logPlugin],
    loader: { '.html': 'text' },
    format: 'esm',
    platform: 'browser',
    target: 'chrome110',
});

if (watch) {
    await ctx.watch();
    const ts = () => `[${new Date().toLocaleString('es-ES')}]`;
    console.log(`${ts()} esbuild watching...`);
    const { watch: fsWatch } = await import('fs');
    [...staticFiles].forEach(f => {
        fsWatch(f, () => {
            copyFileSync(f, `dist/${f.replace('src/options/styles/', '').replace('src/options/', '').replace('src/content/', '').replace('src/', '')}`);
            console.log(`${ts()} copied ${f}`);
            ctx.rebuild();
        });
    });
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log(`[${new Date().toLocaleString('es-ES')}] Build done.`);
}
