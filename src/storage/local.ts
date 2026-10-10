import type { AppState } from '../domain/types'

const STATE_KEY = 'mv.state'

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

/** Brut : la cohérence est vérifiée par recoverState. */
export function loadState(): unknown {
  return readJson<unknown>(STATE_KEY)
}

export function saveState(state: AppState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STATE_KEY)
}
