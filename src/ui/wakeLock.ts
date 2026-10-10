import type { Phase } from '../domain/types'

/** L'écran reste allumé pendant qu'une partie est en cours (téléphone posé sur la table). */
export const shouldKeepAwake = (phase: Phase): boolean => phase === 'tour' || phase === 'theme' || phase === 'question'

type Sentinel = { release(): Promise<void> }
let sentinel: Sentinel | undefined
let wanted = false

async function acquire(): Promise<void> {
  const wl = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<Sentinel> } }).wakeLock
  if (!wl || sentinel) return
  try {
    sentinel = await wl.request('screen')
    sentinel.release = ((orig) => async () => { await orig(); sentinel = undefined })(sentinel.release.bind(sentinel))
  } catch {
    sentinel = undefined // refusé (batterie faible, onglet caché…) : on réessaiera au prochain changement
  }
}

/** À appeler à chaque rendu : demande ou relâche le verrou selon la phase. */
export function syncWakeLock(phase: Phase): void {
  wanted = shouldKeepAwake(phase)
  if (wanted) void acquire()
  else if (sentinel) void sentinel.release()
}

// Le verrou est perdu quand l'onglet passe en arrière-plan : on le redemande au retour.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wanted) void acquire()
  })
}
