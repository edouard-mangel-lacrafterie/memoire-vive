import { afterEach, expect, test } from 'vitest'
import { newId } from './newId'

const original = globalThis.crypto
afterEach(() => Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true }))

test('génère des ids uniques non vides', () => {
  const ids = new Set(Array.from({ length: 50 }, () => newId()))
  expect(ids.size).toBe(50)
  for (const id of ids) expect(id.length).toBeGreaterThan(8)
})

test('fonctionne sans crypto.randomUUID (contexte HTTP non sécurisé)', () => {
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true })
  const a = newId()
  const b = newId()
  expect(a).not.toBe(b)
  expect(a.length).toBeGreaterThan(8)
})
