import { initialState as initialGame, reduce as reduceGame, type Action as GameAction, type Deps as GameDeps } from './game'
import { initialInterview, reduceInterview, type InterviewAction } from './interview'
import type { AppState, GameState, InterviewQuestion, InterviewState } from './types'

export type AppAction =
  | { type: 'chooseMode'; mode: 'jeu' | 'interview' }
  | { type: 'home' }
  | { type: 'quit' }
  | { type: 'game'; action: GameAction }
  | { type: 'interview'; action: InterviewAction }

export type AppDeps = GameDeps & { interviewBank: readonly InterviewQuestion[] }

export const initialApp: AppState = { mode: 'liens', game: initialGame, interview: initialInterview }

// En rentrant à l'accueil, un parcours terminé est remis à zéro ; un parcours en cours reprendra où il en était.
const settleGame = (g: GameState, deps: GameDeps): GameState => (g.phase === 'fin' ? reduceGame(g, { type: 'restart' }, deps) : g)
const settleInterview = (i: InterviewState): InterviewState => (i.phase === 'fin' ? initialInterview : i)

export function reduceApp(s: AppState, action: AppAction, deps: AppDeps): AppState {
  switch (action.type) {
    case 'chooseMode':
      return s.mode === 'accueil' ? { ...s, mode: action.mode } : s
    case 'home':
      return { mode: 'accueil', game: settleGame(s.game, deps), interview: settleInterview(s.interview) }
    case 'quit': {
      // Sortie en cours de route : la partie est oubliée (joueurs gardés), l'entretien reprendra aux chapitres.
      if (s.mode === 'jeu') return { ...s, mode: 'accueil', game: reduceGame(s.game, { type: 'abandon' }, deps) }
      if (s.mode === 'interview') return { ...s, mode: 'accueil', interview: reduceInterview(s.interview, { type: 'back' }, deps.interviewBank) }
      return s
    }
    case 'game':
      return s.mode === 'jeu' ? { ...s, game: reduceGame(s.game, action.action, deps) } : s
    case 'interview':
      return s.mode === 'interview' ? { ...s, interview: reduceInterview(s.interview, action.action, deps.interviewBank) } : s
  }
}
