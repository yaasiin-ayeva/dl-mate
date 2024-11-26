import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { resolve } from 'path';

const buildOptions: esbuild.BuildOptions = {
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: ['node16'],
  format: 'cjs',
  sourcemap: true,
  minify: true,
  plugins: [
    nodeExternalsPlugin(),
  ],
};

async function build() {
  try {
    console.log('📦 Building package...');
    const start = Date.now();
    
    await esbuild.build(buildOptions);
    
    await esbuild.build({
      ...buildOptions,
      entryPoints: [resolve(__dirname, 'src/index.ts')],
      outfile: 'dist/index.d.ts',
      format: 'esm',
      bundle: false,
      minify: false,
      splitting: false,
      write: true,
      plugins: [],
      loader: { '.ts': 'ts' },
    });

    const duration = Date.now() - start;
    console.log(`✅ Build completed in ${duration}ms`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();