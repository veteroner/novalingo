/** A screen may show several Nova cards, but only two may own GPU contexts. */
const owners = new Set<symbol>();
const listeners = new Set<() => void>();
const MAX_CONTEXTS = 2;
export function acquireNovaContext(owner: symbol) {
  if (owners.has(owner)) return true;
  if (owners.size >= MAX_CONTEXTS) return false;
  owners.add(owner);
  return true;
}
export function releaseNovaContext(owner: symbol) {
  if (!owners.delete(owner)) return;
  for (const listener of [...listeners]) listener();
}
export function onNovaContextAvailable(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
