import { currentAsker } from '../domain/game'
import { tableLevel } from '../domain/tableLevel'
import type { GameState, Player, Question, Theme } from '../domain/types'
import { playerLabel } from './playerLabel'

export type UiState = { thanks: boolean }
export type RenderDeps = { themes: readonly Theme[]; questions: readonly Question[] }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const byId = (players: Player[], id?: string) => players.find((p) => p.id === id)

const abandonLink = `<p class="hint"><a href="#" data-action="abandon">Abandonner la partie</a></p>`

function playersScreen(s: GameState): string {
  const rows = s.players
    .map(
      (p) => `<li class="player">
        <span>${esc(p.name)} <small>${p.age} ans</small></span>
        <button class="btn btn-ghost" data-action="removePlayer" data-id="${p.id}" aria-label="Retirer ${esc(p.name)}">✕</button>
      </li>`,
    )
    .join('')
  return `
    <h1>Mémoire vive</h1>
    <p class="lead">Qui joue aujourd'hui ?</p>
    <form id="add-player" class="row" autocomplete="off">
      <input name="name" placeholder="Prénom" required maxlength="30" />
      <input name="age" type="number" inputmode="numeric" placeholder="Âge" min="0" max="120" required />
      <button class="btn" type="submit">Ajouter</button>
    </form>
    <ul class="players">${rows}</ul>
    <button class="btn btn-primary btn-big" data-action="start" ${s.players.length < 2 ? 'disabled' : ''}>
      Démarrer la partie
    </button>
    <p class="hint"><a href="#" data-action="export">Exporter les stats</a></p>`
}

function turnScreen(s: GameState): string {
  const asker = currentAsker(s)!
  const targets = s.players
    .filter((p) => p.id !== asker.id)
    .map((p) => `<button class="btn btn-big" data-action="chooseTarget" data-id="${p.id}">${esc(playerLabel(p))}</button>`)
    .join('')
  return `
    <p class="lead">C'est à <strong>${esc(playerLabel(asker))}</strong> de poser une question.</p>
    <p>À qui ?</p>
    <div class="stack">${targets}</div>
    ${abandonLink}`
}

function themeScreen(s: GameState, d: RenderDeps): string {
  const target = byId(s.players, s.target)!
  const tiles = d.themes
    .map(
      (t) => `<button class="tile" data-action="chooseTheme" data-theme="${t.id}">
        <span class="icon" aria-hidden="true">${t.icon}</span>
        <span>${esc(t.label)}</span>
      </button>`,
    )
    .join('')
  return `
    <p class="lead">Une question pour <strong>${esc(target.name)}</strong>.</p>
    <p>Choisis un thème.</p>
    <div class="grid">${tiles}</div>
    ${abandonLink}`
}

function questionScreen(s: GameState, d: RenderDeps): string {
  const target = byId(s.players, s.target)!
  const q = d.questions.find((x) => x.id === s.current)!
  const theme = d.themes.find((t) => t.id === s.theme)!
  return `
    <p class="lead"><span aria-hidden="true">${theme.icon}</span> ${esc(theme.label)}</p>
    <p class="question">${esc(q.text)}</p>
    <p>${esc(target.name)}, à toi !</p>
    <button class="btn btn-primary btn-big" data-action="answered">Répondu !</button>
    ${abandonLink}`
}

function endScreen(s: GameState, ui: UiState, d: RenderDeps): string {
  const premium = d.questions.filter((q) => q.tier === 'premium').length
  const plural = s.memories > 1 ? 's' : ''
  const door = ui.thanks
    ? `<p class="thanks">Merci ! Le pack arrive bientôt.</p>
       <form id="email-form" class="row">
         <input name="email" type="email" placeholder="Votre email pour être prévenu (facultatif)" />
         <button class="btn" type="submit">OK</button>
       </form>`
    : `<button class="btn btn-primary btn-big" data-action="unlock">Débloquer · 4,99 €</button>`
  return `
    <h1>🎉 ${s.memories} souvenir${plural} partagé${plural}</h1>
    <p class="lead">Niveau de la table : <strong>${esc(tableLevel(s.memories))}</strong></p>
    <section class="card">
      <h2>Continuer avec le pack « Souvenirs profonds »</h2>
      <p>${premium} questions inédites pour aller plus loin.</p>
      ${door}
    </section>
    <button class="btn btn-big" data-action="restart">Rejouer gratuitement</button>`
}

export function render(root: HTMLElement, s: GameState, ui: UiState, d: RenderDeps): void {
  const screens: Record<GameState['phase'], () => string> = {
    joueurs: () => playersScreen(s),
    tour: () => turnScreen(s),
    theme: () => themeScreen(s, d),
    question: () => questionScreen(s, d),
    fin: () => endScreen(s, ui, d),
  }
  root.innerHTML = `<section class="screen screen-${s.phase}">${screens[s.phase]()}</section>`
}
