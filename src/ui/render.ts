import { currentAsker } from '../domain/game'
import { tableLevel } from '../domain/tableLevel'
import type { GameState, Player, Question, Theme } from '../domain/types'
import { playerLabel } from './playerLabel'

export type RenderDeps = { themes: readonly Theme[]; questions: readonly Question[] }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const byId = (players: Player[], id?: string) => players.find((p) => p.id === id)

const svg = (paths: string, size: number, stroke = 1.6) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" class="ico" style="width:${size}px;height:${size}px;stroke-width:${stroke}">${paths}</svg>`
const ICON_X = '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'
const ICON_CHEVRON = '<path d="M9 5l7 7-7 7"/>'
const ICON_THUMB = '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

function topBar(): string {
  return `<header class="topbar">
    <span class="wordmark">Mémoire vive</span>
    <button class="pill" data-action="abandon">Abandonner</button>
  </header>`
}

function playersScreen(s: GameState): string {
  const rows = s.players
    .map(
      (p, i) => `<li class="row-card">
        <span class="rank" aria-hidden="true">${i + 1}</span>
        <span class="hand-name">${esc(p.name)}</span>
        <span class="age">${p.age} ans</span>
        <button class="icon-btn" data-action="removePlayer" data-id="${p.id}" aria-label="Retirer ${esc(p.name)}">${svg(ICON_X, 22, 1.8)}</button>
      </li>`,
    )
    .join('')
  const missing = Math.max(0, 2 - s.players.length)
  const cta = missing
    ? `<p class="cant-start">Encore ${plural(missing, 'joueur', 'joueurs')} pour commencer</p>`
    : `<button class="btn-primary" data-action="start">Commencer la partie</button>`
  return `
    <div class="heading">
      <h1>Qui joue&nbsp;?</h1>
      <p class="muted">Ajoute chaque personne autour de la table, avec son âge. Les questions s'adaptent.</p>
    </div>
    <ul class="list">${rows}</ul>
    <form id="add-player" class="add-form" autocomplete="off">
      <div class="field grow"><label for="name">Prénom</label><input id="name" name="name" placeholder="Mamie" required maxlength="30" /></div>
      <div class="field age-field"><label for="age">Âge</label><input id="age" name="age" type="number" inputmode="numeric" placeholder="72" min="0" max="120" required /></div>
      <button class="btn-outline" type="submit">Ajouter</button>
    </form>
    ${cta}`
}

function turnScreen(s: GameState): string {
  const asker = currentAsker(s)!
  const targets = s.players
    .filter((p) => p.id !== asker.id)
    .map(
      (p) => `<button class="target" data-action="chooseTarget" data-id="${p.id}">
        <span class="hand-name big">${esc(p.name)}</span>
        <span class="age">${p.age} ans</span>
        ${svg(ICON_CHEVRON, 20, 1.8)}
      </button>`,
    )
    .join('')
  return `${topBar()}
    <div class="handoff">
      <p class="eyebrow">C'est au tour de</p>
      <div class="polaroid name-card">
        <span class="tape" aria-hidden="true"></span>
        <span class="hand-huge">${esc(asker.name)}</span>
        <span class="age">${asker.age} ans</span>
      </div>
    </div>
    <div class="heading">
      <h2>À qui poses-tu ta question&nbsp;?</h2>
    </div>
    <div class="stack">${targets}</div>`
}

const TILT = [-1.2, 1, 0.8, -0.8, 1.2, -1, -0.6, 0.9]

function themeScreen(s: GameState, d: RenderDeps): string {
  const target = byId(s.players, s.target)!
  const tiles = d.themes
    .map(
      (t, i) => `<button class="tile polaroid" data-action="chooseTheme" data-theme="${t.id}" style="--tilt:${TILT[i % TILT.length]}deg;--tint:${t.tint}">
        <span class="tile-photo">${svg(t.icon, 40, 1.5)}</span>
        <span class="hand-label">${esc(t.label)}</span>
      </button>`,
    )
    .join('')
  return `${topBar()}
    <div class="heading">
      <h1 class="h-md">Une question pour ${esc(target.name)}</h1>
      <p class="muted">Choisis un thème.</p>
    </div>
    <div class="grid">${tiles}</div>`
}

function questionScreen(s: GameState, d: RenderDeps): string {
  const asker = currentAsker(s)!
  const target = byId(s.players, s.target)!
  const q = d.questions.find((x) => x.id === s.current)!
  const theme = d.themes.find((t) => t.id === s.theme)!
  return `${topBar()}
    <div class="q-head">
      <span class="tape-label">${esc(theme.label)}</span>
      <p><strong>${esc(asker.name)}</strong> demande à <strong>${esc(target.name)}</strong></p>
    </div>
    <div class="q-card">
      <span class="corner tl" aria-hidden="true"></span><span class="corner tr" aria-hidden="true"></span>
      <span class="corner bl" aria-hidden="true"></span><span class="corner br" aria-hidden="true"></span>
      <p class="question">${esc(q.text)}</p>
      <p class="hand-muted">à lire à voix haute</p>
    </div>
    <button class="btn-primary tall" data-action="answered">
      ${svg(ICON_THUMB, 32, 1.5)}
      <span>A répondu</span>
      <span class="sub">un souvenir de plus</span>
    </button>`
}

function endScreen(s: GameState): string {
  return `
    <div class="heading">
      <h1>${plural(s.memories, 'souvenir partagé', 'souvenirs partagés')}</h1>
      <p class="hand-muted">niveau de la table : ${esc(tableLevel(s.memories))}</p>
    </div>
    <section class="polaroid offer">
      <span class="tape" aria-hidden="true"></span>
      <h2>Merci d'avoir joué</h2>
      <p class="muted">Les questions déjà posées ne reviendront pas avant la prochaine partie.</p>
      <button class="btn-primary" data-action="restart">Rejouer</button>
    </section>`
}

export function render(root: HTMLElement, s: GameState, d: RenderDeps): void {
  const screens: Record<GameState['phase'], () => string> = {
    joueurs: () => playersScreen(s),
    tour: () => turnScreen(s),
    theme: () => themeScreen(s, d),
    question: () => questionScreen(s, d),
    fin: () => endScreen(s),
  }
  root.innerHTML = `<section class="screen screen-${s.phase}">${screens[s.phase]()}</section>`
}
