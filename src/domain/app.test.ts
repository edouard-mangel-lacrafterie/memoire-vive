import { describe, expect, test } from 'vitest'
import { initialApp, reduceApp, type AppAction, type AppDeps } from './app'
import type { AppState, InterviewQuestion, Question } from './types'

const bank: Question[] = [{ id: 'q1', text: 'Q1', level: 'petites' }]
const interviewBank: InterviewQuestion[] = [{ id: 'v1', chapter: 'voix', text: 'V1' }]
let counter = 0
const deps: AppDeps = { bank, interviewBank, rng: () => 0, newId: () => `p${++counter}` }
const run = (state: AppState, ...actions: AppAction[]) => actions.reduce((s, a) => reduceApp(s, a, deps), state)
const players = [{ id: 'p1', name: 'Mamie' }, { id: 'p2', name: 'Léo' }]

describe('accueil', () => {
  test("démarre sur l'accueil", () => {
    expect(initialApp.mode).toBe('accueil')
  })
  test('choisir un mode y entre', () => {
    expect(run(initialApp, { type: 'chooseMode', mode: 'jeu' }).mode).toBe('jeu')
    expect(run(initialApp, { type: 'chooseMode', mode: 'interview' }).mode).toBe('interview')
  })
  test("choisir un mode hors de l'accueil est ignoré", () => {
    const inGame = run(initialApp, { type: 'chooseMode', mode: 'jeu' })
    expect(run(inGame, { type: 'chooseMode', mode: 'interview' }).mode).toBe('jeu')
  })
})

describe('sous-états', () => {
  test('une action de jeu ne touche que le jeu', () => {
    const s = run(initialApp, { type: 'chooseMode', mode: 'jeu' }, { type: 'game', action: { type: 'acceptRules' } })
    expect(s.game.phase).toBe('joueurs')
    expect(s.interview).toEqual(initialApp.interview)
  })
  test("une action d'interview ne touche que l'interview", () => {
    const s = run(initialApp, { type: 'chooseMode', mode: 'interview' }, { type: 'interview', action: { type: 'start' } })
    expect(s.interview.phase).toBe('chapitres')
    expect(s.game).toEqual(initialApp.game)
  })
  test('une action de jeu est ignorée hors du mode jeu', () => {
    expect(run(initialApp, { type: 'game', action: { type: 'acceptRules' } })).toEqual(initialApp)
  })
})

describe('retour accueil', () => {
  test('garde les joueurs saisis pour la prochaine fois', () => {
    const s = run(initialApp, { type: 'chooseMode', mode: 'jeu' }, { type: 'game', action: { type: 'acceptRules' } }, { type: 'game', action: { type: 'addPlayer', name: 'Mamie' } }, { type: 'home' })
    expect(s.mode).toBe('accueil')
    expect(s.game.players).toHaveLength(1)
  })
  test('une partie terminée est remise à zéro en rentrant', () => {
    const finished: AppState = { ...initialApp, mode: 'jeu', game: { ...initialApp.game, phase: 'fin', players, shared: 2, asked: ['q1'] } }
    const s = run(finished, { type: 'home' })
    expect(s.game.phase).toBe('joueurs')
    expect(s.game.shared).toBe(0)
  })
  test('un entretien terminé est remis à zéro en rentrant', () => {
    const finished: AppState = { ...initialApp, mode: 'interview', interview: { phase: 'fin', done: ['v1'] } }
    expect(run(finished, { type: 'home' }).interview).toEqual(initialApp.interview)
  })
})

describe('quitter en cours', () => {
  test('quitter une partie en cours revient à l\'accueil, garde les joueurs et oublie la partie', () => {
    const mid: AppState = { ...initialApp, mode: 'jeu', game: { ...initialApp.game, phase: 'question', players, duration: 'courte', level: 'petites', current: 'q1', shared: 1, asked: ['q1'] } }
    const s = run(mid, { type: 'quit' })
    expect(s.mode).toBe('accueil')
    expect(s.game.phase).toBe('joueurs')
    expect(s.game.players).toHaveLength(2)
    expect(s.game.shared).toBe(0)
  })
  test("quitter pendant une question d'entretien revient à l'accueil et garde l'avancement, prêt à reprendre aux chapitres", () => {
    const mid: AppState = { ...initialApp, mode: 'interview', interview: { phase: 'question', chapter: 'voix', current: 'v1', done: ['v0'] } }
    const s = run(mid, { type: 'quit' })
    expect(s.mode).toBe('accueil')
    expect(s.interview).toEqual({ phase: 'chapitres', done: ['v0'] })
  })
  test("quitter depuis l'accueil ne change rien", () => {
    expect(run(initialApp, { type: 'quit' })).toEqual(initialApp)
  })
})
