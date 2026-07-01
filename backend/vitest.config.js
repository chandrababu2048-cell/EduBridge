import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // The canonical usage store (frontend/api/_lib/usageStore.js) resolves
      // '@supabase/supabase-js' from frontend/node_modules — a different
      // instance than backend/node_modules, so vi.mock from a backend test
      // cannot intercept it. Alias the package to a deterministic stub so no
      // backend test can ever open a real Supabase connection.
      '@supabase/supabase-js': fileURLToPath(
        new URL('./__tests__/helpers/supabaseStub.js', import.meta.url)
      ),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['routes/**', 'prompts/**'],
    },
  },
});
