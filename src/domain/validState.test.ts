import { expect, test } from 'vitest'
import { recoverState, type Catalog } from './validState'
import { initialApp } from './app'
import type { AppState, GameState, InterviewState, Question } from './types'

const bank: Question[] = [{ id: 'q1', text: 'Q', level: 'petites' }]
const catalog: Catalog = {
  bank,
  levels: [{ id: 'petites', label: 'Les petites histoires', hint: 'en douceur', icon: '<path d="M0 0"/>', tint: '#C9D6E8' }],
  interviewBank: [{ id: 'v1', chapter: 'voix', text: 'V1' }],
  chapters: [{ id: 'voix', label: 'Ta voix', icon: '<path d="M0 0"/>', tint: '#C9D6E8' }],
}
const players = [{ id: 'p1', name: 'Mamie' }, { id: 'p2', name: 'Léo' }]
const game: GameState = { phase: 'question', players, turn: 0, duration: 'courte', level: 'petites', current: 'q1', asked: ['q1'], shared: 0 }
const interview: InterviewState = { phase: 'question', chapter: 'voix', current: 'v1', done: [] }
const ok: AppState = { mode: 'jeu', game, interview }

test('garde un état cohérent tel quel', () => {
  expect(recoverState(ok, catalog)).toEqual(ok)
})

test('une partie en mode mélange est cohérente', () => {
  const s = { ...ok, game: { ...game, level: 'melange' as const } }
  expect(recoverState(s, catalog)).toEqual(s)
})

test("l'ancien format (joueurs avec âge, phases d'avant) garde les prénoms et repart aux joueurs", () => {
  const legacy = { phase: 'tour', players: [{ id: 'p1', name: 'Mamie', age: 72 }, { id: 'p2', name: 'Léo', age: 9 }], turn: 0, asked: [], memories: 0 }
  const r = recoverState(legacy, catalog)
  expect(r.mode).toBe('accueil')
  expect(r.game.phase).toBe('joueurs')
  expect(r.game.players).toEqual(players)
})

test.each<[string, unknown]>([
  ['mode inconnu', { ...ok, mode: 'zzz' }],
  ['état null', null],
  ['chaîne', 'x'],
])("repart de l'accueil : %s", (_label, broken) => {
  expect(recoverState(broken, catalog).mode).toBe('accueil')
})

test('sans joueur connu, la partie repart aux règles', () => {
  expect(recoverState({ ...ok, game: { ...game, players: [] } }, catalog).game.phase).toBe('regles')
})

test.each<[string, Record<string, unknown>]>([
  ['phase inconnue', { phase: 'bizarre' }],
  ['question disparue de la banque', { current: 'a-99' }],
  ['niveau inconnu', { level: 'zzz' }],
  ['durée inconnue', { duration: 'infinie' }],
  ['turn hors bornes', { turn: 5 }],
  ['partie commencée avec un seul joueur', { phase: 'choix', players: [players[0]!] }],
])('une partie incohérente repart aux joueurs en gardant les joueurs valides : %s', (_label, patch) => {
  const r = recoverState({ ...ok, game: { ...game, ...patch } }, catalog)
  expect(r.game.phase).toBe('joueurs')
  expect(r.game.shared).toBe(0)
  expect(r.game.players.length).toBeGreaterThan(0)
})

test('les joueurs mal formés sont écartés', () => {
  const r = recoverState({ ...ok, game: { ...initialApp.game, phase: 'joueurs', players: [players[0], { id: 'x' }, 'y'] } }, catalog)
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
