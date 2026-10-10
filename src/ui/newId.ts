// crypto.randomUUID n'existe que sur HTTPS ou localhost : en Wi-Fi local (http://192.168…) il est absent.
export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
