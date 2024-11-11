// esbuild.config.mjs
import * as esbuild from 'esbuild'

const isDev = process.env.NODE_ENV !== 'DEVELOPMENT';

const buildOptions = {
    entryPoints: isDev ? ['./lib/mapp.mjs', './lib/ui.mjs'] : ['./lib/mapp.mjs', './lib/ui.mjs', './tests/_mapp.test.mjs'],
    bundle: true,
    minify: isDev,
    sourcemap: true,
    sourceRoot: '/lib',
    format: 'iife',
    outbase: '.',
    outdir: 'public/js',
    metafile: true,
    logLevel: 'info'
};

try {
    await esbuild.build(buildOptions);
} catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
}