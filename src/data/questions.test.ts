import { expect, test } from 'vitest'
import { questions } from './questions'
import { levels } from './levels'

test('ids uniques', () => {
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
})

test('chaque niveau a au moins de quoi tenir une partie courte (6 questions)', () => {
  for (const level of levels) {
    expect(questions.filter((q) => q.level === level.id).length, level.id).toBeGreaterThanOrEqual(6)
  }
})

test('chaque question appartient à un niveau connu', () => {
  for (const q of questions) {
    expect(levels.some((l) => l.id === q.level), q.id).toBe(true)
  }
})
