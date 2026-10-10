import { expect, test } from 'vitest'
import { themes } from './themes'

test('huit thèmes aux ids uniques', () => {
  expect(themes.map((t) => t.id)).toEqual(['enfance', 'emotions', 'souvenirs', 'amour', 'famille', 'voyages', 'ecole', 'premieres'])
})

test('chaque thème a un libellé, une icône SVG au trait et une teinte pastel', () => {
  for (const t of themes) {
    expect(t.label.length).toBeGreaterThan(2)
    expect(t.icon).toMatch(/^<(path|circle|rect|ellipse|span)/)
    expect(t.tint).toMatch(/^#[0-9A-F]{6}$/i)
  }
})
