import { reduceApp, type AppAction } from './domain/app'
import type { Action as GameAction } from './domain/game'
import type { InterviewAction } from './domain/interview'
import { recoverState, type Catalog } from './domain/validState'
import type { ChapterId, ThemeId } from './domain/types'
import { chapters, consent, followUp, interviewQuestions } from './data/interview'
import { questions } from './data/questions'
import { themes } from './data/themes'
import { loadState, saveState } from './storage/local'
import { newId } from './ui/newId'
import { render } from './ui/render'
import { syncWakeLock } from './ui/wakeLock'

const root = document.querySelector<HTMLElement>('#app')!
const catalog: Catalog = { bank: questions, themes, interviewBank: interviewQuestions, chapters }
const deps = { ...catalog, rng: Math.random, newId }
let state = recoverState(loadState(), catalog)

function dispatch(action: AppAction): void {
  state = reduceApp(state, action, deps)
  saveState(state)
  paint()
}
const game = (action: GameAction) => dispatch({ type: 'game', action })
const interview = (action: InterviewAction) => dispatch({ type: 'interview', action })

function paint(): void {
  render(root, state, { ...catalog, followUp, consent })
  syncWakeLock(state)
}

root.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!el) return
  e.preventDefault()
  const { action, id, theme, mode, chapter } = el.dataset
  switch (action) {
    case 'mode': return dispatch({ type: 'chooseMode', mode: mode as 'jeu' | 'interview' })
    case 'home': return dispatch({ type: 'home' })
    case 'quit': return dispatch({ type: 'quit' })
    case 'removePlayer': return game({ type: 'removePlayer', id: id! })
    case 'start': return game({ type: 'start' })
    case 'chooseTarget': return game({ type: 'chooseTarget', id: id! })
    case 'chooseTheme': return game({ type: 'chooseTheme', theme: theme as ThemeId })
    case 'answered': return game({ type: 'answered' })
    case 'restart': return game({ type: 'restart' })
    case 'abandon': return game({ type: 'abandon' })
    case 'iv-start': return interview({ type: 'start' })
    case 'iv-chooseChapter': return interview({ type: 'chooseChapter', chapter: chapter as ChapterId })
    case 'iv-next': return interview({ type: 'next' })
    case 'iv-skip': return interview({ type: 'skip' })
    case 'iv-back': return interview({ type: 'back' })
    case 'iv-finish': return interview({ type: 'finish' })
    case 'iv-restart': return interview({ type: 'restart' })
  }
})

root.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement
  e.preventDefault()
  const data = new FormData(form)
  if (form.id === 'add-player') {
    game({ type: 'addPlayer', name: String(data.get('name') ?? ''), age: Number(data.get('age')) })
    form.reset()
    form.querySelector<HTMLInputElement>('[name=name]')?.focus()
  }
})

paint()
