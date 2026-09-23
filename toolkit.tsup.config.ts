import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['packages/toolkit/src/index.ts'],
  outDir: 'packages/toolkit/dist',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
