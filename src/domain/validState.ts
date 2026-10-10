import { initialState } from './game'
import type { GameState, Phase, Player, Question, Theme } from './types'

const PHASES: readonly Phase[] = ['joueurs', 'tour', 'theme', 'question', 'fin']

const isPlayer = (p: unknown): p is Player =>
  typeof p === 'object' && p !== null &&
  typeof (p as Player).id === 'string' && typeof (p as Player).name === 'string' && typeof (p as Player).age === 'number'

const validPlayers = (raw: unknown): Player[] => (Array.isArray(raw) ? raw.filter(isPlayer) : [])

function isPlayable(s: GameState, bank: readonly Question[], themes: readonly Theme[]): boolean {
  if (!PHASES.includes(s.phase) || !Number.isInteger(s.turn) || !Array.isArray(s.asked)) return false
  if (typeof s.memories !== 'number') return false
  if (s.phase === 'joueurs') return true
  if (s.players.length < 2 || s.turn < 0 || s.turn >= s.players.length) return false
  const hasTarget = s.players.some((p) => p.id === s.target)
  if (s.phase === 'theme') return hasTarget
  if (s.phase === 'question') {
    return hasTarget && themes.some((t) => t.id === s.theme) && bank.some((q) => q.id === s.current)
  }
  return true
}

/** Renvoie l'état sauvegardé s'il est cohérent avec l'app, sinon un état neuf qui garde les joueurs valides. */
export function recoverState(raw: unknown, bank: readonly Question[], themes: readonly Theme[]): GameState {
  const candidate = typeof raw === 'object' && raw !== null ? (raw as GameState) : undefined
  const players = validPlayers(candidate?.players)
  if (candidate && players.length === (candidate.players as unknown[]).length && isPlayable({ ...candidate, players }, bank, themes)) {
    return { ...candidate, players }
  }
  return { ...initialState, players }
}
