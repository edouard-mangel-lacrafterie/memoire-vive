import { beforeEach, expect, test } from 'vitest'
import { clearState, exportEvents, loadState, logUnlock, saveState } from './local'
import { initialState } from '../domain/game'

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
  const s = { ...initialState, memories: 3 }
  saveState(s)
  expect(loadState()).toEqual(s)
})

test('renvoie undefined sans état ou avec un JSON corrompu', () => {
  expect(loadState()).toBeUndefined()
  localStorage.setItem('mv.state', '{oops')
  expect(loadState()).toBeUndefined()
})

test("clearState efface l'état", () => {
  saveState(initialState)
  clearState()
  expect(loadState()).toBeUndefined()
})

test('journalise les clics de déblocage et les exporte en JSON', () => {
  logUnlock({ date: '2026-10-11T10:00:00Z', players: 3, memories: 3 })
  logUnlock({ date: '2026-10-11T11:00:00Z', players: 2, memories: 2, email: 'a@b.c' })
  expect(JSON.parse(exportEvents())).toHaveLength(2)
})
