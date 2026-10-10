import { expect, test } from 'vitest'
import { pickQuestion } from './pickQuestion'
import type { Question } from './types'

const q = (id: string, over: Partial<Question> = {}): Question => ({
  id, text: id, theme: 'enfance', asker: 'toutes', answerer: 'toutes', ...over,
})
const first = () => 0
const base = { askerBand: 'adulte', answererBand: 'aine', theme: 'enfance', asked: [], rng: first } as const

test('préfère une correspondance exacte inédite', () => {
  const bank = [q('large'), q('exact', { asker: 'adulte', answerer: 'aine' })]
  expect(pickQuestion(bank, base)?.id).toBe('exact')
})

test('se replie sur une question "toutes" inédite', () => {
  const bank = [q('exact', { asker: 'adulte', answerer: 'aine' }), q('large')]
  expect(pickQuestion(bank, { ...base, asked: ['exact'] })?.id).toBe('large')
})

test('recycle les déjà posées quand tout est épuisé', () => {
  const bank = [q('large')]
  expect(pickQuestion(bank, { ...base, asked: ['large'] })?.id).toBe('large')
})

test('ignore les autres thèmes', () => {
  const bank = [q('b', { theme: 'voyages' })]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('ignore une question dont la tranche ne correspond pas', () => {
  const bank = [q('enf', { answerer: 'enfant' })]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('utilise le rng injecté pour choisir parmi les candidates', () => {
  const bank = [q('x'), q('y'), q('z')]
  expect(pickQuestion(bank, { ...base, rng: () => 0.99 })?.id).toBe('z')
})
