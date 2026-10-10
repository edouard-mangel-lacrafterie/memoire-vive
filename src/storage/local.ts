import type { GameState } from '../domain/types'

const STATE_KEY = 'mv.state'

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function loadState(): GameState | undefined {
  const s = readJson<GameState>(STATE_KEY)
  return s && typeof s.phase === 'string' && Array.isArray(s.players) ? s : undefined
}

export function saveState(state: GameState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STATE_KEY)
}
