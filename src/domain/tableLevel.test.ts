import { expect, test } from 'vitest'
import { tableLevel } from './tableLevel'

test.each([
  [0, 'Timides'],
  [1, 'Curieux'],
  [3, 'Curieux'],
  [4, 'Complices'],
  [6, 'Complices'],
  [7, 'Inséparables'],
  [20, 'Inséparables'],
])('tableLevel(%i) = %s', (n, label) => {
  expect(tableLevel(n)).toBe(label)
})
