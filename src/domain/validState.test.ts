import { expect, test } from 'vitest'
import { recoverState } from './validState'
import { initialState } from './game'
import type { GameState, Question, Theme } from './types'

const themes: Theme[] = [{ id: 'a', label: 'A', icon: 'x' }]
const bank: Question[] = [{ id: 'q1', text: 'Q', theme: 'a', asker: 'toutes', answerer: 'toutes', tier: 'gratuit' }]
const players = [{ id: 'p1', name: 'Mamie', age: 72 }, { id: 'p2', name: 'Léo', age: 9 }]
const ok: GameState = { phase: 'question', players, turn: 0, target: 'p2', theme: 'a', current: 'q1', asked: ['q1'], memories: 0 }

test('garde un état cohérent tel quel', () => {
  expect(recoverState(ok, bank, themes)).toEqual(ok)
})

test.each<[string, unknown]>([
  ['phase inconnue', { ...ok, phase: 'bizarre' }],
  ['question disparue de la banque', { ...ok, current: 'a-99' }],
  ['thème inconnu', { ...ok, theme: 'z' }],
  ['cible inconnue', { ...ok, target: 'nope' }],
  ['turn hors bornes', { ...ok, turn: 5 }],
  ['partie commencée avec un seul joueur', { ...ok, phase: 'tour', players: [players[0]] }],
  ['players non tableau', { ...ok, players: 'x' }],
  ['état null', null],
])('repart au début en gardant les joueurs valides : %s', (_label, broken) => {
  const r = recoverState(broken, bank, themes)
  expect(r.phase).toBe('joueurs')
  expect(r.memories).toBe(0)
})

test('les joueurs valides sont conservés après récupération', () => {
  const r = recoverState({ ...ok, current: 'a-99' }, bank, themes)
  expect(r.players).toEqual(players)
})

test('les joueurs mal formés sont écartés', () => {
  const r = recoverState({ ...initialState, players: [players[0], { id: 'x' }, 'y'] }, bank, themes)
  expect(r.players).toEqual([players[0]])
})
