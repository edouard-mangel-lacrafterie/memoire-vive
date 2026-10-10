import { expect, test } from 'vitest'
import { shouldKeepAwake } from './wakeLock'

test.each([
  ['joueurs', false],
  ['tour', true],
  ['theme', true],
  ['question', true],
  ['fin', false],
] as const)('shouldKeepAwake(%s) = %s', (phase, expected) => {
  expect(shouldKeepAwake(phase)).toBe(expected)
})
