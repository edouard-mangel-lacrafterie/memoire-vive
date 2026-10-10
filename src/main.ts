import { reduce, type Action } from './domain/game'
import { recoverState } from './domain/validState'
import type { ThemeId } from './domain/types'
import { questions } from './data/questions'
import { themes } from './data/themes'
import { loadState, saveState } from './storage/local'
import { newId } from './ui/newId'
import { render } from './ui/render'
import { syncWakeLock } from './ui/wakeLock'

const root = document.querySelector<HTMLElement>('#app')!
const deps = { bank: questions, rng: Math.random, newId }
let state = recoverState(loadState(), questions, themes)

function dispatch(action: Action): void {
  state = reduce(state, action, deps)
  saveState(state)
  paint()
}

function paint(): void {
  render(root, state, { themes, questions })
  syncWakeLock(state.phase)
}

root.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!el) return
  e.preventDefault()
  const { action, id, theme } = el.dataset
  switch (action) {
    case 'removePlayer': return dispatch({ type: 'removePlayer', id: id! })
    case 'start': return dispatch({ type: 'start' })
    case 'chooseTarget': return dispatch({ type: 'chooseTarget', id: id! })
    case 'chooseTheme': return dispatch({ type: 'chooseTheme', theme: theme as ThemeId })
    case 'answered': return dispatch({ type: 'answered' })
    case 'restart': return dispatch({ type: 'restart' })
    case 'abandon': return dispatch({ type: 'abandon' })
  }
})

root.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement
  e.preventDefault()
  const data = new FormData(form)
  if (form.id === 'add-player') {
    dispatch({ type: 'addPlayer', name: String(data.get('name') ?? ''), age: Number(data.get('age')) })
    form.reset()
    form.querySelector<HTMLInputElement>('[name=name]')?.focus()
  }
})

paint()
