import { pickQuestion, type Rng } from './pickQuestion'
import type { Duration, GameState, LevelChoice, Player, Question } from './types'

export type Action =
  | { type: 'addPlayer'; name: string }
  | { type: 'removePlayer'; id: string }
  | { type: 'acceptRules' }
  | { type: 'start' }
  | { type: 'configure'; duration: Duration; level: LevelChoice }
  | { type: 'next' }
  | { type: 'skip' }
  | { type: 'changeLevel' }
  | { type: 'finish' }
  | { type: 'restart' }
  | { type: 'abandon' }

export type Deps = { bank: readonly Question[]; rng: Rng; newId: () => string }

export const initialState: GameState = { phase: 'regles', players: [], turn: 0, asked: [], shared: 0 }

/** Nombre de questions suggéré par durée (étape 2 des règles). Ce n'est pas une limite : on peut continuer. */
export const TARGET: Record<Duration, number> = { courte: 6, moyenne: 12, longue: 20 }

export const DURATION_LABEL: Record<Duration, string> = { courte: '15 min', moyenne: '30 min', longue: '1 h' }

export function currentReader(state: GameState): Player | undefined {
  return state.players[state.turn]
}

export const reachedTarget = (s: GameState): boolean => s.duration !== undefined && s.asked.length >= TARGET[s.duration]

function draw(s: GameState, deps: Deps, turn: number): GameState {
  if (!s.level) return s
  const q = pickQuestion(deps.bank, { level: s.level, asked: s.asked, rng: deps.rng })
  if (!q) return s
  return { ...s, phase: 'question', turn, current: q.id, asked: [...s.asked, q.id] }
}

export function reduce(state: GameState, action: Action, deps: Deps): GameState {
  switch (action.type) {
    case 'addPlayer': {
      const name = action.name.trim()
      if (state.phase !== 'joueurs' || name === '') return state
      return { ...state, players: [...state.players, { id: deps.newId(), name }] }
    }
    case 'removePlayer':
      if (state.phase !== 'joueurs') return state
      return { ...state, players: state.players.filter((p) => p.id !== action.id) }
    case 'acceptRules':
      return state.phase === 'regles' ? { ...state, phase: 'joueurs' } : state
    case 'start':
      if (state.phase !== 'joueurs' || state.players.length < 2) return state
      return { ...state, phase: 'choix', turn: 0, asked: [], shared: 0 }
    case 'configure':
      if (state.phase !== 'choix') return state
      return draw({ ...state, duration: action.duration, level: action.level }, deps, state.turn)
    case 'next':
    case 'skip': {
      if (state.phase !== 'question') return state
      const shared = action.type === 'next' ? state.shared + 1 : state.shared
      return draw({ ...state, shared }, deps, (state.turn + 1) % state.players.length)
    }
    case 'changeLevel': {
      if (state.phase !== 'question') return state
      const { current: _c, ...rest } = state
      return { ...rest, phase: 'choix' }
    }
    case 'finish': {
      if (state.phase !== 'question' && state.phase !== 'choix') return state
      const { current: _c, ...rest } = state
      return { ...rest, phase: 'fin' }
    }
    case 'restart':
      if (state.phase !== 'fin') return state
      return { ...initialState, phase: 'joueurs', players: state.players }
    case 'abandon':
      if (state.phase === 'regles' || state.phase === 'joueurs') return state
      return { ...initialState, phase: 'joueurs', players: state.players }
  }
}
