/**
 * Storage that never throws. If localStorage is blocked (private mode,
 * strict privacy settings, embedded browsers), it falls back to memory
 * so the game still plays, it just forgets on reload.
 *
 * Version 2 sign-in can provide another KeyValueStore (or sync this one
 * to a server) without touching the game code.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export function memoryStore(): KeyValueStore {
  const m = new Map<string, string>();
  return {
    get: (k) => (m.has(k) ? m.get(k)! : null),
    set: (k, v) => void m.set(k, v),
    remove: (k) => void m.delete(k),
  };
}

export function browserStore(): KeyValueStore {
  const fallback = memoryStore();
  let ls: Storage | null = null;
  try {
    ls = window.localStorage;
    const probe = "__mdl_probe__";
    ls.setItem(probe, "1");
    ls.removeItem(probe);
  } catch {
    ls = null;
  }
  return {
    get(k) {
      try {
        return ls ? ls.getItem(k) : fallback.get(k);
      } catch {
        return fallback.get(k);
      }
    },
    set(k, v) {
      fallback.set(k, v);
      try {
        ls?.setItem(k, v);
      } catch {
        /* quota or blocked: memory copy is kept */
      }
    },
    remove(k) {
      fallback.remove(k);
      try {
        ls?.removeItem(k);
      } catch {
        /* ignore */
      }
    },
  };
}
