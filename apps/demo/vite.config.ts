import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@a11y-toolkit/core': fileURLToPath(
        new URL('../../packages/core/src/index.ts', import.meta.url),
      ),
      '@a11y-toolkit/reading': fileURLToPath(
        new URL('../../packages/reading/src/index.ts', import.meta.url),
      ),
      '@a11y-toolkit/visual': fileURLToPath(
        new URL('../../packages/visual/src/index.ts', import.meta.url),
      ),
      '@a11y-toolkit/modes': fileURLToPath(
        new URL('../../packages/modes/src/index.ts', import.meta.url),
      ),
      '@a11y-toolkit/devtools': fileURLToPath(
        new URL('../../packages/devtools/src/index.ts', import.meta.url),
      ),
    },
  },
});
