import type { AgeBand } from './types'

export function ageBand(age: number): AgeBand {
  if (age < 15) return 'enfant'
  if (age < 60) return 'adulte'
  return 'aine'
}
