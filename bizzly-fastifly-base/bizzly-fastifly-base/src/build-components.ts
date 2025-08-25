import { build, BuildOptions } from 'esbuild';

const buildOptions: BuildOptions = {
  entryPoints: ['dist/components/button.js'],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: 'public/components.bundle.js',
  format: 'esm',
  target: ['es2020']
};

build(buildOptions).catch(() => process.exit(1));
