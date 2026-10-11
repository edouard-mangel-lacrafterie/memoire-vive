import { expect, test } from 'vitest'
import { shouldKeepAwake } from './wakeLock'
import { initialApp } from '../domain/app'
import type { AppState } from '../domain/types'

const app = (patch: Partial<AppState>): AppState => ({ ...initialApp, ...patch })
const game = (phase: AppState['game']['phase']) => app({ mode: 'jeu', game: { ...initialApp.game, phase } })
const interview = (phase: AppState['interview']['phase']) => app({ mode: 'interview', interview: { ...initialApp.interview, phase } })

test.each<[string, AppState, boolean]>([
  ['liens', app({ mode: 'liens' }), false],
  ['accueil', app({ mode: 'accueil' }), false],
  ['jeu/regles', game('regles'), false],
  ['jeu/joueurs', game('joueurs'), false],
  ['jeu/choix', game('choix'), true],
  ['jeu/question', game('question'), true],
  ['jeu/fin', game('fin'), false],
  ['interview/intro', interview('intro'), false],
  ['interview/chapitres', interview('chapitres'), true],
  ['interview/question', interview('question'), true],
  ['interview/fin', interview('fin'), false],
  ['accueil avec partie en cours', app({ mode: 'accueil', game: { ...initialApp.game, phase: 'question' } }), false],
])('shouldKeepAwake(%s) = %s', (_label, state, expected) => {
  expect(shouldKeepAwake(state)).toBe(expected)
})
