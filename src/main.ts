import { reduce, type Action } from './domain/game'
import { recoverState } from './domain/validState'
import type { ThemeId } from './domain/types'
import { questions } from './data/questions'
import { themes } from './data/themes'
import { exportEvents, loadState, logUnlock, saveState } from './storage/local'
import { newId } from './ui/newId'
import { render, type UiState } from './ui/render'
import { syncWakeLock } from './ui/wakeLock'

const root = document.querySelector<HTMLElement>('#app')!
const deps = { bank: questions, rng: Math.random, newId }
let state = recoverState(loadState(), questions, themes)
const ui: UiState = { thanks: false }

function dispatch(action: Action): void {
  state = reduce(state, action, deps)
  if (action.type === 'restart' || action.type === 'abandon') ui.thanks = false
  saveState(state)
  paint()
}

function paint(): void {
  render(root, state, ui, { themes, questions })
  syncWakeLock(state.phase)
}

function download(name: string, content: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
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
    case 'unlock':
      logUnlock({ kind: 'unlock', date: new Date().toISOString(), players: state.players.length, memories: state.memories })
      ui.thanks = true
      return paint()
    case 'export': return download('memoire-vive-stats.json', exportEvents())
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
  if (form.id === 'email-form') {
    const email = String(data.get('email') ?? '').trim()
    if (email) logUnlock({ kind: 'email', date: new Date().toISOString(), players: state.players.length, memories: state.memories, email })
    form.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Noté, merci !' }))
  }
})

paint()
