import { expect, test } from 'vitest'
import { pickQuestion } from './pickQuestion'
import type { Question } from './types'

const q = (id: string, level: Question['level'] = 'petites'): Question => ({ id, text: id, level })
const first = () => 0
const base = { level: 'petites', asked: [], rng: first } as const

test('tire dans le niveau demandé, inédite d\'abord', () => {
  const bank = [q('a'), q('b'), q('v', 'valeurs')]
  expect(pickQuestion(bank, { ...base, asked: ['a'] })?.id).toBe('b')
})

test('recycle les déjà posées quand le niveau est épuisé', () => {
  const bank = [q('a')]
  expect(pickQuestion(bank, { ...base, asked: ['a'] })?.id).toBe('a')
})

test('ignore les autres niveaux', () => {
  const bank = [q('v', 'valeurs')]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('mélange : tire dans toute la banque', () => {
  const bank = [q('v', 'valeurs'), q('p', 'personnelles')]
  expect(pickQuestion(bank, { ...base, level: 'melange', rng: () => 0.99 })?.id).toBe('p')
})

test('utilise le rng injecté pour choisir parmi les candidates', () => {
  const bank = [q('x'), q('y'), q('z')]
  expect(pickQuestion(bank, { ...base, rng: () => 0.99 })?.id).toBe('z')
})
