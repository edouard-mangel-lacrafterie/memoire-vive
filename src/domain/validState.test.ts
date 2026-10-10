import { expect, test } from 'vitest'
import { recoverState, type Catalog } from './validState'
import { initialApp } from './app'
import type { AppState, GameState, InterviewState, Question, Theme } from './types'

const themes: Theme[] = [{ id: 'enfance', label: 'Enfance', icon: '<path d="M0 0"/>', tint: '#C9D6E8' }]
const bank: Question[] = [{ id: 'q1', text: 'Q', theme: 'enfance', asker: 'toutes', answerer: 'toutes' }]
const catalog: Catalog = {
  bank, themes,
  interviewBank: [{ id: 'v1', chapter: 'voix', text: 'V1' }],
  chapters: [{ id: 'voix', label: 'Ta voix', icon: '<path d="M0 0"/>', tint: '#C9D6E8' }],
}
const players = [{ id: 'p1', name: 'Mamie', age: 72 }, { id: 'p2', name: 'Léo', age: 9 }]
const game: GameState = { phase: 'question', players, turn: 0, target: 'p2', theme: 'enfance', current: 'q1', asked: ['q1'], memories: 0 }
const interview: InterviewState = { phase: 'question', chapter: 'voix', current: 'v1', done: [] }
const ok: AppState = { mode: 'jeu', game, interview }

test('garde un état cohérent tel quel', () => {
  expect(recoverState(ok, catalog)).toEqual(ok)
})

test("l'ancien format (partie seule, sans mode) repart à l'accueil avec ses joueurs", () => {
  const r = recoverState(game, catalog)
  expect(r.mode).toBe('accueil')
  expect(r.game.players).toEqual(players)
})

test.each<[string, unknown]>([
  ['mode inconnu', { ...ok, mode: 'zzz' }],
  ['état null', null],
  ['chaîne', 'x'],
])("repart de l'accueil : %s", (_label, broken) => {
  expect(recoverState(broken, catalog).mode).toBe('accueil')
})

test.each<[string, Record<string, unknown>]>([
  ['phase inconnue', { phase: 'bizarre' as GameState['phase'] }],
  ['question disparue de la banque', { current: 'a-99' }],
  ['thème inconnu', { theme: 'zzz' as GameState['theme'] }],
  ['cible inconnue', { target: 'nope' }],
  ['turn hors bornes', { turn: 5 }],
  ['partie commencée avec un seul joueur', { phase: 'tour', players: [players[0]!] }],
])('une partie incohérente repart aux joueurs en gardant les joueurs valides : %s', (_label, patch) => {
  const r = recoverState({ ...ok, game: { ...game, ...patch } }, catalog)
  expect(r.game.phase).toBe('joueurs')
  expect(r.game.memories).toBe(0)
  expect(r.game.players.length).toBeGreaterThan(0)
})

test('les joueurs mal formés sont écartés', () => {
  const r = recoverState({ ...ok, game: { ...initialApp.game, players: [players[0], { id: 'x' }, 'y'] } }, catalog)
  expect(r.game.players).toEqual([players[0]])
})

test.each<[string, unknown]>([
  ['phase inconnue', { ...interview, phase: 'zzz' }],
  ['chapitre inconnu', { ...interview, chapter: 'zzz' }],
  ['question disparue', { ...interview, current: 'v-99' }],
  ['done non tableau', { ...interview, done: 'x' }],
  ['entretien absent', undefined],
])("un entretien incohérent repart à l'intro : %s", (_label, broken) => {
  const r = recoverState({ ...ok, interview: broken }, catalog)
  expect(r.interview).toEqual(initialApp.interview)
})

test('un entretien aux chapitres garde ses questions traitées', () => {
  const r = recoverState({ ...ok, interview: { phase: 'chapitres', done: ['v1'] } }, catalog)
  expect(r.interview.done).toEqual(['v1'])
})
