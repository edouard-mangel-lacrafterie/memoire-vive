import { beforeEach, expect, test } from 'vitest'
import { clearState, loadState, saveState } from './local'
import { initialApp } from '../domain/app'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage
})

test("sauvegarde et recharge l'état", () => {
  const s = { ...initialApp, mode: 'jeu' as const }
  saveState(s)
  expect(loadState()).toEqual(s)
})

test('renvoie undefined sans état ou avec un JSON corrompu', () => {
  expect(loadState()).toBeUndefined()
  localStorage.setItem('mv.state', '{oops')
  expect(loadState()).toBeUndefined()
})

test("clearState efface l'état", () => {
  saveState(initialApp)
  clearState()
  expect(loadState()).toBeUndefined()
})
