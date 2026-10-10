import { ageBand } from './ageBand'
import { pickQuestion, type Rng } from './pickQuestion'
import type { GameState, Player, Question, ThemeId } from './types'

export type Action =
  | { type: 'addPlayer'; name: string; age: number }
  | { type: 'removePlayer'; id: string }
  | { type: 'start' }
  | { type: 'chooseTarget'; id: string }
  | { type: 'chooseTheme'; theme: ThemeId }
  | { type: 'answered' }
  | { type: 'restart' }
  | { type: 'abandon' }

export type Deps = { bank: readonly Question[]; rng: Rng; newId: () => string }

export const initialState: GameState = { phase: 'joueurs', players: [], turn: 0, asked: [], memories: 0 }

export function currentAsker(state: GameState): Player | undefined {
  return state.players[state.turn]
}

const validAge = (age: number) => Number.isInteger(age) && age >= 0 && age <= 120

export function reduce(state: GameState, action: Action, deps: Deps): GameState {
  switch (action.type) {
    case 'addPlayer': {
      const name = action.name.trim()
      if (state.phase !== 'joueurs' || name === '' || !validAge(action.age)) return state
      return { ...state, players: [...state.players, { id: deps.newId(), name, age: action.age }] }
    }
    case 'removePlayer':
      if (state.phase !== 'joueurs') return state
      return { ...state, players: state.players.filter((p) => p.id !== action.id) }
    case 'start':
      if (state.phase !== 'joueurs' || state.players.length < 2) return state
      return { ...state, phase: 'tour', turn: 0, asked: [], memories: 0 }
    case 'chooseTarget': {
      const asker = currentAsker(state)
      const target = state.players.find((p) => p.id === action.id)
      if (state.phase !== 'tour' || !asker || !target || target.id === asker.id) return state
      return { ...state, phase: 'theme', target: target.id }
    }
    case 'chooseTheme': {
      const asker = currentAsker(state)
      const target = state.players.find((p) => p.id === state.target)
      if (state.phase !== 'theme' || !asker || !target) return state
      const q = pickQuestion(deps.bank, {
        askerBand: ageBand(asker.age),
        answererBand: ageBand(target.age),
        theme: action.theme,
        asked: state.asked,
        rng: deps.rng,
      })
      if (!q) return state
      return { ...state, phase: 'question', theme: action.theme, current: q.id, asked: [...state.asked, q.id] }
    }
    case 'answered': {
      if (state.phase !== 'question') return state
      const { target: _t, theme: _th, current: _c, ...rest } = state
      const memories = state.memories + 1
      const last = state.turn + 1 >= state.players.length
      return last ? { ...rest, phase: 'fin', memories } : { ...rest, phase: 'tour', turn: state.turn + 1, memories }
    }
    case 'restart':
      if (state.phase !== 'fin') return state
      return { ...initialState, players: state.players }
    case 'abandon':
      if (state.phase === 'joueurs') return state
      return { ...initialState, players: state.players }
  }
}
