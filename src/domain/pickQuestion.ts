import type { LevelChoice, Question } from './types'

export type Rng = () => number

export type PickCriteria = {
  level: LevelChoice
  asked: readonly string[]
  rng: Rng
}

/** Tire une question du niveau choisi (ou de toute la banque en mode mélange), inédite d'abord, recyclée sinon. */
export function pickQuestion(bank: readonly Question[], c: PickCriteria): Question | undefined {
  const pool = c.level === 'melange' ? [...bank] : bank.filter((q) => q.level === c.level)
  const unasked = pool.filter((q) => !c.asked.includes(q.id))
  const candidates = unasked.length > 0 ? unasked : pool
  if (candidates.length === 0) return undefined
  return candidates[Math.floor(c.rng() * candidates.length)]
}
