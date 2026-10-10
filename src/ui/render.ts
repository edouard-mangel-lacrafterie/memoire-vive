import { currentAsker } from '../domain/game'
import { tableLevel } from '../domain/tableLevel'
import type { Catalog } from '../domain/validState'
import type { AppState, GameState, InterviewState, Player } from '../domain/types'

export type RenderDeps = Catalog & { followUp: { lead: string; probes: readonly string[] }; consent: string }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const byId = (players: Player[], id?: string) => players.find((p) => p.id === id)

const svg = (paths: string, size: number, stroke = 1.6) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" class="ico" style="width:${size}px;height:${size}px;stroke-width:${stroke}">${paths}</svg>`
const ICON_X = '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'
const ICON_CHEVRON = '<path d="M9 5l7 7-7 7"/>'
const ICON_THUMB = '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'
const ICON_TABLE = '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="3.5" r="1.5"/><circle cx="12" cy="20.5" r="1.5"/><circle cx="3.5" cy="12" r="1.5"/><circle cx="20.5" cy="12" r="1.5"/>'
const ICON_MIC = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8.5 21h7"/>'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

function topBar(action: string, label: string): string {
  return `<header class="topbar">
    <span class="wordmark">Mémoire vive</span>
    <button class="pill" data-action="${action}">${label}</button>
  </header>`
}

function homeScreen(): string {
  return `
    <div class="heading center">
      <h1>Mémoire vive</h1>
      <p class="hand-muted">les histoires de famille, à voix haute</p>
    </div>
    <div class="stack modes">
      <button class="polaroid mode-card" data-action="mode" data-mode="jeu" style="--tint:#CFDCC6;--tilt:-1deg">
        <span class="tape" aria-hidden="true"></span>
        <span class="tile-photo">${svg(ICON_TABLE, 44, 1.5)}</span>
        <span class="hand-label">Jeu en famille</span>
        <span class="mode-desc">Autour de la table, chacun pose une question à quelqu'un d'autre. Les questions s'adaptent aux âges.</span>
      </button>
      <button class="polaroid mode-card" data-action="mode" data-mode="interview" style="--tint:#EBCFCB;--tilt:1deg">
        <span class="tape" aria-hidden="true"></span>
        <span class="tile-photo">${svg(ICON_MIC, 44, 1.5)}</span>
        <span class="hand-label">Interview</span>
        <span class="mode-desc">Un proche raconte sa vie. Tu lis les questions, chapitre par chapitre, et tu enregistres si tout le monde est d'accord.</span>
      </button>
    </div>`
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
  return `${topBar('home', 'Accueil')}
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
  return `${topBar('abandon', 'Abandonner')}
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
  return `${topBar('abandon', 'Abandonner')}
    <div class="heading">
      <h1 class="h-md">Une question pour ${esc(target.name)}</h1>
      <p class="muted">Choisis un thème.</p>
    </div>
    <div class="grid">${tiles}</div>`
}

function questionScreen(s: GameState, d: RenderDeps): string {
  const asker = currentAsker(s)!
  const target = byId(s.players, s.target)!
  const q = d.bank.find((x) => x.id === s.current)!
  const theme = d.themes.find((t) => t.id === s.theme)!
  return `${topBar('abandon', 'Abandonner')}
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
      <p class="muted">La table est chaude. On refait un tour ?</p>
      <button class="btn-primary" data-action="restart">Rejouer</button>
    </section>
    <button class="btn-outline wide" data-action="home">Changer de mode</button>`
}

function introScreen(d: RenderDeps): string {
  return `${topBar('home', 'Accueil')}
    <div class="heading">
      <h1 class="h-md">Avant de commencer</h1>
      <p class="muted">Quelques questions par visite suffisent. Laisse la personne divaguer quand un bon souvenir remonte, garde des photos ou des lettres à portée de main.</p>
    </div>
    <section class="polaroid offer">
      <span class="tape" aria-hidden="true"></span>
      <p class="eyebrow left">À demander avant d'enregistrer</p>
      <p class="question sm">${esc(d.consent)}</p>
    </section>
    <button class="btn-primary" data-action="iv-start">Ouvrir les chapitres</button>`
}

function chaptersScreen(s: InterviewState, d: RenderDeps): string {
  const tiles = d.chapters
    .map((c, i) => {
      const qs = d.interviewBank.filter((q) => q.chapter === c.id)
      const done = qs.filter((q) => s.done.includes(q.id)).length
      return `<button class="tile polaroid" data-action="iv-chooseChapter" data-chapter="${c.id}" style="--tilt:${TILT[i % TILT.length]}deg;--tint:${c.tint}">
        <span class="tile-photo">${svg(c.icon, 40, 1.5)}</span>
        <span class="hand-label">${esc(c.label)}</span>
        <span class="age">${done} / ${qs.length}</span>
      </button>`
    })
    .join('')
  return `${topBar('iv-finish', 'Terminer')}
    <div class="heading">
      <h1 class="h-md">Quel chapitre&nbsp;?</h1>
      <p class="muted">${plural(s.done.length, 'question explorée', 'questions explorées')} sur ${d.interviewBank.length}.</p>
    </div>
    <div class="grid">${tiles}</div>`
}

function interviewQuestionScreen(s: InterviewState, d: RenderDeps): string {
  const chapter = d.chapters.find((c) => c.id === s.chapter)!
  const inChapter = d.interviewBank.filter((q) => q.chapter === s.chapter)
  const index = inChapter.findIndex((q) => q.id === s.current)
  const q = inChapter[index]!
  const probes = d.followUp.probes.map((p) => `<li>${esc(p)}</li>`).join('')
  return `${topBar('iv-back', 'Chapitres')}
    <div class="q-head">
      <span class="tape-label">${esc(chapter.label)}</span>
      <p class="muted">Question ${index + 1} sur ${inChapter.length}</p>
    </div>
    <div class="q-card">
      <span class="corner tl" aria-hidden="true"></span><span class="corner tr" aria-hidden="true"></span>
      <span class="corner bl" aria-hidden="true"></span><span class="corner br" aria-hidden="true"></span>
      <p class="question">${esc(q.text)}</p>
      <p class="hand-muted">à lire à voix haute</p>
    </div>
    <aside class="followup">
      <p class="eyebrow left">Si une histoire commence</p>
      <p class="hand-label">«&nbsp;${esc(d.followUp.lead)}&nbsp;»</p>
      <ul class="probes">${probes}</ul>
    </aside>
    <button class="btn-primary tall" data-action="iv-next">
      ${svg(ICON_THUMB, 32, 1.5)}
      <span>Question suivante</span>
      <span class="sub">on a exploré celle-ci</span>
    </button>
    <button class="btn-outline wide" data-action="iv-skip">Passer</button>`
}

function interviewEndScreen(s: InterviewState, d: RenderDeps): string {
  return `
    <div class="heading">
      <h1>${plural(s.done.length, 'question explorée', 'questions explorées')}</h1>
      <p class="hand-muted">sur ${d.interviewBank.length}, pour aujourd'hui</p>
    </div>
    <section class="polaroid offer">
      <span class="tape" aria-hidden="true"></span>
      <h2>Merci pour ces histoires</h2>
      <p class="muted">Note comment se prononcent les noms et les lieux pendant que c'est frais. La prochaine visite reprendra les chapitres non terminés.</p>
      <button class="btn-primary" data-action="iv-restart">Nouvel entretien</button>
    </section>
    <button class="btn-outline wide" data-action="home">Changer de mode</button>`
}

function gameScreen(s: GameState, d: RenderDeps): string {
  const screens: Record<GameState['phase'], () => string> = {
    joueurs: () => playersScreen(s),
    tour: () => turnScreen(s),
    theme: () => themeScreen(s, d),
    question: () => questionScreen(s, d),
    fin: () => endScreen(s),
  }
  return screens[s.phase]()
}

function interviewScreen(s: InterviewState, d: RenderDeps): string {
  const screens: Record<InterviewState['phase'], () => string> = {
    intro: () => introScreen(d),
    chapitres: () => chaptersScreen(s, d),
    question: () => interviewQuestionScreen(s, d),
    fin: () => interviewEndScreen(s, d),
  }
  return screens[s.phase]()
}

export function render(root: HTMLElement, app: AppState, d: RenderDeps): void {
  const [name, html] =
    app.mode === 'jeu' ? [app.game.phase, gameScreen(app.game, d)]
    : app.mode === 'interview' ? [`iv-${app.interview.phase}`, interviewScreen(app.interview, d)]
    : ['accueil', homeScreen()]
  root.innerHTML = `<section class="screen screen-${name}">${html}</section>`
}
