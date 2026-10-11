import type { AppState } from '../domain/types'

/** L'écran reste allumé pendant qu'une partie ou un entretien est en cours (téléphone posé sur la table). */
export function shouldKeepAwake(app: AppState): boolean {
  if (app.mode === 'jeu') return app.game.phase === 'choix' || app.game.phase === 'question'
  if (app.mode === 'interview') return app.interview.phase === 'chapitres' || app.interview.phase === 'question'
  return false
}

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

/** À appeler à chaque rendu : demande ou relâche le verrou selon l'écran affiché. */
export function syncWakeLock(app: AppState): void {
  wanted = shouldKeepAwake(app)
  if (wanted) void acquire()
  else if (sentinel) void sentinel.release()
}

// Le verrou est perdu quand l'onglet passe en arrière-plan : on le redemande au retour.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wanted) void acquire()
  })
}
