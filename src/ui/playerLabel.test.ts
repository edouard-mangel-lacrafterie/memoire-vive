import { expect, test } from 'vitest'
import { playerLabel } from './playerLabel'

test('affiche le prénom et l\'âge pour distinguer les homonymes', () => {
  expect(playerLabel({ id: 'x', name: 'Léo', age: 9 })).toBe('Léo · 9 ans')
})
