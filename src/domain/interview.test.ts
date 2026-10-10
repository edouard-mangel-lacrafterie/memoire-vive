import { describe, expect, test } from 'vitest'
import { initialInterview, reduceInterview, type InterviewAction } from './interview'
import type { InterviewQuestion, InterviewState } from './types'

const bank: InterviewQuestion[] = [
  { id: 'v1', chapter: 'voix', text: 'V1' },
  { id: 'v2', chapter: 'voix', text: 'V2' },
  { id: 'e1', chapter: 'enfance', text: 'E1' },
]
const run = (state: InterviewState, ...actions: InterviewAction[]) =>
  actions.reduce((s, a) => reduceInterview(s, a, bank), state)
const atChapters = () => run(initialInterview, { type: 'start' })

describe('intro', () => {
  test("commence par l'intro et passe aux chapitres", () => {
    expect(initialInterview.phase).toBe('intro')
    expect(atChapters().phase).toBe('chapitres')
  })
  test('ignore un choix de chapitre depuis l\'intro', () => {
    expect(reduceInterview(initialInterview, { type: 'chooseChapter', chapter: 'voix' }, bank)).toEqual(initialInterview)
  })
})

describe('chapitre', () => {
  test('ouvre la première question non traitée du chapitre, dans l\'ordre du document', () => {
    const s = run(atChapters(), { type: 'chooseChapter', chapter: 'voix' })
    expect(s.phase).toBe('question')
    expect(s.chapter).toBe('voix')
    expect(s.current).toBe('v1')
  })
  test('saute les questions déjà traitées', () => {
    const s = run({ ...atChapters(), done: ['v1'] }, { type: 'chooseChapter', chapter: 'voix' })
    expect(s.current).toBe('v2')
  })
  test('rouvre le chapitre depuis le début quand tout y est traité', () => {
    const s = run({ ...atChapters(), done: ['v1', 'v2'] }, { type: 'chooseChapter', chapter: 'voix' })
    expect(s.current).toBe('v1')
  })
  test('ignore un chapitre sans question', () => {
    const s = run(atChapters(), { type: 'chooseChapter', chapter: 'recul' })
    expect(s.phase).toBe('chapitres')
  })
})

describe('question', () => {
  const open = () => run(atChapters(), { type: 'chooseChapter', chapter: 'voix' })
  test('suivante marque la question traitée et ouvre la suivante du chapitre', () => {
    const s = run(open(), { type: 'next' })
    expect(s.done).toEqual(['v1'])
    expect(s.current).toBe('v2')
    expect(s.phase).toBe('question')
  })
  test('suivante après la dernière du chapitre revient aux chapitres', () => {
    const s = run(open(), { type: 'next' }, { type: 'next' })
    expect(s.done).toEqual(['v1', 'v2'])
    expect(s.phase).toBe('chapitres')
    expect(s.current).toBeUndefined()
    expect(s.chapter).toBeUndefined()
  })
  test('passer ouvre la suivante sans marquer la question traitée', () => {
    const s = run(open(), { type: 'skip' })
    expect(s.done).toEqual([])
    expect(s.current).toBe('v2')
  })
  test('passer la dernière du chapitre revient aux chapitres', () => {
    expect(run(open(), { type: 'skip' }, { type: 'skip' }).phase).toBe('chapitres')
  })
  test('retour revient aux chapitres sans rien marquer', () => {
    const s = run(open(), { type: 'back' })
    expect(s.phase).toBe('chapitres')
    expect(s.done).toEqual([])
  })
  test('ne compte pas deux fois une question déjà traitée', () => {
    const s = run({ ...open(), done: ['v1'] }, { type: 'next' })
    expect(s.done).toEqual(['v1'])
  })
})

describe('fin', () => {
  test('terminer depuis les chapitres passe en fin', () => {
    expect(run(atChapters(), { type: 'finish' }).phase).toBe('fin')
  })
  test('terminer est ignoré pendant une question', () => {
    const s = run(atChapters(), { type: 'chooseChapter', chapter: 'voix' }, { type: 'finish' })
    expect(s.phase).toBe('question')
  })
  test('recommencer repart à l\'intro sans historique', () => {
    const s = run({ ...atChapters(), phase: 'fin', done: ['v1'] }, { type: 'restart' })
    expect(s).toEqual(initialInterview)
  })
})
