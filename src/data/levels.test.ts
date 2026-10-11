import { expect, test } from 'vitest'
import { levels } from './levels'

test('quatre niveaux aux ids uniques, dans l\'ordre des règles', () => {
  expect(levels.map((l) => l.id)).toEqual(['petites', 'souvenirs', 'valeurs', 'personnelles'])
})

test('chaque niveau a un libellé, une aide, une icône SVG au trait et une teinte', () => {
  for (const l of levels) {
    expect(l.label.length).toBeGreaterThan(3)
    expect(l.hint.length).toBeGreaterThan(3)
    expect(l.icon).toMatch(/<(path|circle|rect)/)
    expect(l.tint).toMatch(/^#[0-9A-F]{6}$/i)
  }
})
