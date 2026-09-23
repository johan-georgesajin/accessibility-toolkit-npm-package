import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  external: ['@a11y-toolkit/core', 'react'],
  dts: true,
  sourcemap: true,
  clean: true,
});
