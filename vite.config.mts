/// <reference types="vitest" />
import { defineConfig, loadEnv, transformWithEsbuild, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Legacy files contain JSX inside plain .js — transform just those with the
// jsx loader, leaving Vite's default handling of .ts/.tsx/.jsx untouched.
const jsxInJs: Plugin = {
  name: 'treat-js-as-jsx',
  async transform(code, id) {
    if (!/[\\/](src|cloud_functions)[\\/].*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
  }
};

/*
 * Vite build (PLAN_MODERNIZATION.md §4), replacing the unmaintained Create
 * React App toolchain. Deliberate compatibility choices:
 *
 * - envPrefix keeps the existing REACT_APP_* variable names, and the define
 *   block inlines the handful of process.env.* reads the codebase makes —
 *   no source changes or variable renames required.
 * - Many legacy files contain JSX inside .js — the esbuild loader override
 *   below keeps them compiling without a mass rename.
 * - aws-amplify v5 expects a Node-style `global`; map it to window.
 * - outDir stays `build/` so the GitHub Pages deploy (and copy404) are
 *   unchanged.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');
  return {
    plugins: [jsxInJs, react()],
    envPrefix: 'REACT_APP_',
    resolve: {
      alias: [
        // react-virtualized's ES build ships a broken export
        // (bpfrpt_proptype_WindowScroller) that esbuild rejects during dev
        // prebundling — the CommonJS build is fine. Exact-match only, so the
        // codebase's deep dist/commonjs/* imports resolve untouched.
        { find: /^react-virtualized$/, replacement: 'react-virtualized/dist/commonjs' }
      ]
    },
    define: {
      global: 'window',
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      'process.env.PUBLIC_URL': JSON.stringify(''),
      'process.env.REACT_APP_USE_LOCAL_DATA': JSON.stringify(env.REACT_APP_USE_LOCAL_DATA ?? ''),
      'process.env.REACT_APP_WRITE_API_URL': JSON.stringify(env.REACT_APP_WRITE_API_URL ?? ''),
      'process.env.REACT_APP_ASSISTANT_URL': JSON.stringify(env.REACT_APP_ASSISTANT_URL ?? '')
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' }
      }
    },
    server: { port: 3000, open: false },
    build: {
      outDir: 'build',
      sourcemap: false
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
      include: ['src/**/*.test.{js,ts,tsx}', 'cloud_functions/**/*.test.js'],
      css: false
    }
  };
});
