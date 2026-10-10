import { expect, test } from 'vitest'
import { pickQuestion } from '../domain/pickQuestion'
import type { AgeBand } from '../domain/types'
import { questions } from './questions'
import { themes } from './themes'

const bands: AgeBand[] = ['enfant', 'adulte', 'aine']

test('ids uniques', () => {
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
})

test('chaque thème a au moins une question pour chaque couple de tranches', () => {
  for (const theme of themes) {
    for (const askerBand of bands) {
      for (const answererBand of bands) {
        const q = pickQuestion(questions, { askerBand, answererBand, theme: theme.id, asked: [], rng: () => 0 })
        expect(q, `${theme.id} ${askerBand}→${answererBand}`).toBeDefined()
      }
    }
  }
})
