import { expect, test } from 'vitest'
import { chapters, interviewQuestions } from './interview'

test('ids uniques', () => {
  expect(new Set(interviewQuestions.map((q) => q.id)).size).toBe(interviewQuestions.length)
})

test('les 28 questions du document sont présentes', () => {
  expect(interviewQuestions).toHaveLength(28)
})

test('chaque chapitre a au moins une question et chaque question un chapitre connu', () => {
  for (const c of chapters) {
    expect(interviewQuestions.some((q) => q.chapter === c.id), c.id).toBe(true)
  }
  for (const q of interviewQuestions) {
    expect(chapters.some((c) => c.id === q.chapter), q.id).toBe(true)
  }
})
