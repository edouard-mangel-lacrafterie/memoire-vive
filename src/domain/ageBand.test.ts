import { expect, test } from 'vitest'
import { ageBand } from './ageBand'

test.each([
  [0, 'enfant'],
  [14, 'enfant'],
  [15, 'adulte'],
  [59, 'adulte'],
  [60, 'aine'],
  [95, 'aine'],
])('ageBand(%i) = %s', (age, band) => {
  expect(ageBand(age)).toBe(band)
})
