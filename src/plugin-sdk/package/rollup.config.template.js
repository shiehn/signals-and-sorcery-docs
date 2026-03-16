/**
 * Rollup Config Template for Signals & Sorcery Plugins
 *
 * Copy this to your plugin repo as rollup.config.js and customize.
 *
 * Builds two outputs:
 * 1. Main process entry (CommonJS) → dist/index.js
 * 2. Renderer UI bundle (UMD) → dist/ui.bundle.js
 *
 * IMPORTANT: React and ReactDOM are externalized — the host provides them.
 * Your plugin MUST NOT bundle its own copy of React.
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

// Change this to match your plugin ID (sanitized):
// "@my-org/cool-plugin" → "my_org__cool_plugin"
const PLUGIN_GLOBAL_NAME = 'SASPlugin_my_org__cool_plugin';

export default [
  // Main process entry (CommonJS)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'auto',
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },

  // Renderer UI bundle (UMD)
  {
    input: 'src/ui/Panel.tsx',
    output: {
      file: 'dist/ui.bundle.js',
      format: 'umd',
      name: PLUGIN_GLOBAL_NAME,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: { jsx: 'react-jsx' },
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
    ],
  },
];
