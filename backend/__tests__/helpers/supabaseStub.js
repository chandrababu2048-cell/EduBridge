// Test stand-in for '@supabase/supabase-js' in backend tests.
//
// Why not vi.mock? The canonical usageStore lives in frontend/api/_lib and
// resolves '@supabase/supabase-js' from frontend/node_modules — a different
// module instance than the backend copy a vi.mock call here would intercept.
// backend/vitest.config.js aliases the package id to THIS file for all
// importers, so every backend test sees one controllable implementation.
//
// Tests take control by assigning globalThis.__supabaseCreateClient (see
// usageStore.test.js). When unset, a harmless inert client is returned so
// unrelated tests can never hit the network.
export const createClient = (...args) => {
  if (globalThis.__supabaseCreateClient) {
    return globalThis.__supabaseCreateClient(...args);
  }
  return {
    from: () => ({
      insert: async () => ({ error: null }),
      select: async () => ({ count: null, error: null }),
    }),
  };
};
