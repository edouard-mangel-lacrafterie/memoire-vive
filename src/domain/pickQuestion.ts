import type { AgeBand, BandRule, Question, ThemeId } from './types'

export type Rng = () => number

export type PickCriteria = {
  askerBand: AgeBand
  answererBand: AgeBand
  theme: ThemeId
  asked: readonly string[]
  rng: Rng
}

const matches = (rule: BandRule, band: AgeBand): boolean => rule === 'toutes' || rule === band

export function pickQuestion(bank: readonly Question[], c: PickCriteria): Question | undefined {
  const inTheme = bank.filter((q) => q.theme === c.theme)
  const loose = inTheme.filter((q) => matches(q.asker, c.askerBand) && matches(q.answerer, c.answererBand))
  const exact = loose.filter((q) => q.asker === c.askerBand && q.answerer === c.answererBand)
  const unasked = (qs: Question[]) => qs.filter((q) => !c.asked.includes(q.id))

  const candidates = [unasked(exact), unasked(loose), loose].find((l) => l.length > 0)
  if (!candidates) return undefined
  return candidates[Math.floor(c.rng() * candidates.length)]
}
