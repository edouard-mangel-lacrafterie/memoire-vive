import type { ChapterId, InterviewQuestion, InterviewState } from './types'

export type InterviewAction =
  | { type: 'start' }
  | { type: 'chooseChapter'; chapter: ChapterId }
  | { type: 'next' }
  | { type: 'skip' }
  | { type: 'back' }
  | { type: 'finish' }
  | { type: 'restart' }

export const initialInterview: InterviewState = { phase: 'intro', done: [] }

const atChapters = (s: InterviewState): InterviewState => ({ phase: 'chapitres', done: s.done })

/** Première question du chapitre après `after` (ou depuis le début) qui n'est pas encore traitée. */
function nextInChapter(bank: readonly InterviewQuestion[], chapter: ChapterId, done: readonly string[], after?: string): InterviewQuestion | undefined {
  const inChapter = bank.filter((q) => q.chapter === chapter)
  const start = after ? inChapter.findIndex((q) => q.id === after) + 1 : 0
  return inChapter.slice(start).find((q) => !done.includes(q.id))
}

export function reduceInterview(s: InterviewState, action: InterviewAction, bank: readonly InterviewQuestion[]): InterviewState {
  switch (action.type) {
    case 'start':
      return s.phase === 'intro' ? atChapters(s) : s
    case 'chooseChapter': {
      if (s.phase !== 'chapitres') return s
      const q = nextInChapter(bank, action.chapter, s.done) ?? bank.find((x) => x.chapter === action.chapter)
      return q ? { phase: 'question', chapter: action.chapter, current: q.id, done: s.done } : s
    }
    case 'next':
    case 'skip': {
      if (s.phase !== 'question' || !s.chapter || !s.current) return s
      const done = action.type === 'next' && !s.done.includes(s.current) ? [...s.done, s.current] : s.done
      const q = nextInChapter(bank, s.chapter, done, s.current)
      return q ? { ...s, current: q.id, done } : atChapters({ ...s, done })
    }
    case 'back':
      return s.phase === 'question' ? atChapters(s) : s
    case 'finish':
      return s.phase === 'chapitres' ? { phase: 'fin', done: s.done } : s
    case 'restart':
      return s.phase === 'fin' ? initialInterview : s
  }
}
