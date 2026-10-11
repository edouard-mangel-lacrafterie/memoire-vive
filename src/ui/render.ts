import { currentReader, DURATION_LABEL, reachedTarget, TARGET } from '../domain/game'
import type { Catalog } from '../domain/validState'
import type { AppState, GameState, InterviewState, Player } from '../domain/types'
import type { rules } from '../data/rules'
import { formatTime, type Recorder } from './recorder'

export type RenderDeps = Catalog & { followUp: { lead: string; probes: readonly string[] }; consent: string; rules: typeof rules }
/** État d'interface non persisté : enregistreur simulé, transmission en cours, toast à afficher. */
export type UiState = { recorder: Recorder; sending: boolean; toast: string | undefined }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const byId = (players: Player[], id?: string) => players.find((p) => p.id === id)

const svg = (paths: string, size: number, stroke = 1.6) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" class="ico" style="width:${size}px;height:${size}px;stroke-width:${stroke}">${paths}</svg>`
const ICON_X = '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'
const ICON_CHEVRON = '<path d="M9 5l7 7-7 7"/>'
const ICON_THUMB = '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'
const ICON_TABLE = '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="3.5" r="1.5"/><circle cx="12" cy="20.5" r="1.5"/><circle cx="3.5" cy="12" r="1.5"/><circle cx="20.5" cy="12" r="1.5"/>'
const ICON_REC = '<circle cx="12" cy="12" r="6"/>'
const ICON_PAUSE = '<path d="M8 5v14"/><path d="M16 5v14"/>'
const ICON_STOP = '<rect x="6" y="6" width="12" height="12" rx="1.5"/>'
const ICON_MIC = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8.5 21h7"/>'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** Barre de navigation : le nom, un bouton de contexte facultatif, et toujours une sortie vers l'accueil. */
function topBar(context?: { action: string; label: string }): string {
  const ctx = context ? `<button class="pill" data-action="${context.action}">${context.label}</button>` : ''
  return `<header class="topbar">
    <span class="wordmark">Mémoires vives !</span>
    <nav class="pills">${ctx}<button class="pill" data-action="quit" aria-label="Quitter et revenir à l'accueil">Quitter</button></nav>
  </header>`
}

function homeScreen(): string {
  return `
    <div class="heading center">
      <h1>Mémoires vives !</h1>
      <p class="hand-muted">les histoires de famille, à voix haute</p>
    </div>
    <div class="stack modes">
      <button class="polaroid mode-card" data-action="mode" data-mode="jeu" style="--tint:#CFDCC6;--tilt:-1deg">
        <span class="tape" aria-hidden="true"></span>
        <span class="tile-photo">${svg(ICON_TABLE, 44, 1.5)}</span>
        <span class="hand-label">Jeu en famille</span>
        <span class="mode-desc">Autour de la table, chacun lit une question à son tour. Qui veut répond, les autres écoutent.</span>
      </button>
      <button class="polaroid mode-card" data-action="mode" data-mode="interview" style="--tint:#EBCFCB;--tilt:1deg">
        <span class="tape" aria-hidden="true"></span>
        <span class="tile-photo">${svg(ICON_MIC, 44, 1.5)}</span>
        <span class="hand-label">Interview</span>
        <span class="mode-desc">Un proche raconte sa vie. Tu lis les questions, chapitre par chapitre, et tu enregistres si tout le monde est d'accord.</span>
      </button>
    </div>`
}

function rulesScreen(d: RenderDeps): string {
  const r = d.rules
  const golden = r.golden.map((g, i) => `<li><strong>${i + 1}. ${esc(g.title)}</strong><span class="muted">${esc(g.text)}</span></li>`).join('')
  const howTo = r.howTo.map((h) => `<li>${esc(h)}</li>`).join('')
  const tips = r.difficult.tips.map((t) => `<li>${esc(t)}</li>`).join('')
  return `${topBar()}
    <div class="heading">
      <p class="eyebrow left">Bienvenue autour de la table</p>
      <h1 class="h-md">${esc(r.title)}</h1>
      <p class="muted">${esc(r.welcome)}</p>
    </div>
    <section class="polaroid offer">
      <span class="tape" aria-hidden="true"></span>
      <p class="question sm">${esc(r.motto)}</p>
    </section>
    <section class="rules-block">
      <h2>Comment jouer</h2>
      <ul class="probes big">${howTo}</ul>
    </section>
    <section class="rules-block">
      <h2>Les cinq règles d'or</h2>
      <ol class="golden">${golden}</ol>
    </section>
    <details class="rules-block">
      <summary>Et si une question est difficile ?</summary>
      <p class="muted">${esc(r.difficult.intro)}</p>
      <ul class="probes big">${tips}</ul>
    </details>
    <button class="btn-primary" data-action="acceptRules">C'est compris, on s'installe</button>`
}

function playersScreen(s: GameState): string {
  const rows = s.players
    .map(
      (p, i) => `<li class="row-card">
        <span class="rank" aria-hidden="true">${i + 1}</span>
        <span class="hand-name">${esc(p.name)}</span>
        <button class="icon-btn" data-action="removePlayer" data-id="${p.id}" aria-label="Retirer ${esc(p.name)}">${svg(ICON_X, 22, 1.8)}</button>
      </li>`,
    )
    .join('')
  const missing = Math.max(0, 2 - s.players.length)
  const cta = missing
    ? `<p class="cant-start">Encore ${plural(missing, 'personne', 'personnes')} pour commencer</p>`
    : `<button class="btn-primary" data-action="start">Choisir la partie</button>`
  return `${topBar()}
    <div class="heading">
      <h1>Qui est là&nbsp;?</h1>
      <p class="muted">Les prénoms de chacun autour de la table. On lira les questions à tour de rôle.</p>
    </div>
    <ul class="list">${rows}</ul>
    <form id="add-player" class="add-form" autocomplete="off">
      <div class="field grow"><label for="name">Prénom</label><input id="name" name="name" placeholder="Mamie" required maxlength="30" /></div>
      <button class="btn-outline" type="submit">Ajouter</button>
    </form>
    ${cta}`
}

const TILT = [-1.2, 1, 0.8, -0.8, 1.2, -1, -0.6, 0.9]
const ICON_SHUFFLE = '<path d="M3 7h4l8 10h6"/><path d="M18 14l3 3-3 3"/><path d="M3 17h4l2.5-3"/><path d="M14.5 10L17 7h4"/><path d="M18 4l3 3-3 3"/>'

function choiceScreen(s: GameState, d: RenderDeps): string {
  const chips = (['courte', 'moyenne', 'longue'] as const)
    .map((dur) => `<label class="chip"><input type="radio" name="duration" value="${dur}" ${(s.duration ?? 'courte') === dur ? 'checked' : ''} /><span>${DURATION_LABEL[dur]}</span><small>≈ ${TARGET[dur]} questions</small></label>`)
    .join('')
  const tiles = d.levels
    .map(
      (l, i) => `<button class="tile polaroid" data-action="configure" data-level="${l.id}" style="--tilt:${TILT[i % TILT.length]}deg;--tint:${l.tint}">
        <span class="tile-photo">${svg(l.icon, 40, 1.5)}</span>
        <span class="hand-label">${esc(l.label)}</span>
        <span class="tile-hint">${esc(l.hint)}</span>
      </button>`,
    )
    .join('')
  const mix = `<button class="tile polaroid wide-tile" data-action="configure" data-level="melange" style="--tilt:0.6deg;--tint:#EBCFCB">
        <span class="tile-photo">${svg(ICON_SHUFFLE, 40, 1.5)}</span>
        <span class="hand-label">Mélanger</span>
        <span class="tile-hint">un peu de tout, au hasard</span>
      </button>`
  const context = s.asked.length > 0 ? { action: 'finish', label: 'Terminer' } : undefined
  return `${topBar(context)}
    <div class="heading">
      <h1 class="h-md">Choisissez votre partie</h1>
      <p class="muted">Le temps dont vous disposez, puis le type de questions. Vous pourrez changer de niveau à tout moment.</p>
    </div>
    <div class="chips" role="radiogroup" aria-label="Durée">${chips}</div>
    <div class="grid">${tiles}${mix}</div>`
}

function questionScreen(s: GameState, d: RenderDeps): string {
  const reader = currentReader(s)!
  const q = d.bank.find((x) => x.id === s.current)!
  const level = d.levels.find((l) => l.id === s.level)
  const label = level ? level.label : 'Mélange'
  const note = reachedTarget(s)
    ? `<p class="target-note">Vous avez fait le tour prévu. Continuez si vous en avez envie, ou terminez quand la conversation s'achève.</p>`
    : ''
  return `${topBar({ action: 'finish', label: 'Terminer' })}
    <div class="q-head">
      <span class="tape-label">${esc(label)}</span>
      <p><strong>${esc(reader.name)}</strong> lit la question à voix haute</p>
    </div>
    <div class="q-card">
      <span class="corner tl" aria-hidden="true"></span><span class="corner tr" aria-hidden="true"></span>
      <span class="corner bl" aria-hidden="true"></span><span class="corner br" aria-hidden="true"></span>
      <p class="question">${esc(q.text)}</p>
      <p class="hand-muted">${esc(d.rules.reminder)}</p>
    </div>
    ${note}
    <button class="btn-primary tall" data-action="next">
      ${svg(ICON_THUMB, 32, 1.5)}
      <span>Question suivante</span>
      <span class="sub">une histoire partagée</span>
    </button>
    <div class="row-actions">
      <button class="btn-outline grow" data-action="skip">Passer</button>
      <button class="btn-outline grow" data-action="changeLevel">Changer de niveau</button>
    </div>`
}

function endScreen(s: GameState, d: RenderDeps): string {
  const prompts = d.rules.lastWord.map((w) => `<li>${esc(w)}</li>`).join('')
  return `
    <div class="heading">
      <h1>${plural(s.shared, 'question partagée', 'questions partagées')}</h1>
      <p class="hand-muted">ni gagnant, ni perdant</p>
    </div>
    <section class="polaroid offer">
      <span class="tape" aria-hidden="true"></span>
      <h2>Un dernier mot, si vous en avez envie</h2>
      <ul class="probes big">${prompts}</ul>
      <p class="muted">Vous pouvez aussi terminer simplement, sans bilan ni commentaire.</p>
    </section>
    <p class="question sm center">${esc(d.rules.thanks)}</p>
    <button class="btn-primary" data-action="restart">Rejouer</button>
    <button class="btn-outline wide" data-action="home">Changer de mode</button>`
}

function introScreen(d: RenderDeps): string {
  return `${topBar()}
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
  return `${topBar({ action: 'iv-finish', label: 'Terminer' })}
    <div class="heading">
      <h1 class="h-md">Quel chapitre&nbsp;?</h1>
      <p class="muted">${plural(s.done.length, 'question explorée', 'questions explorées')} sur ${d.interviewBank.length}.</p>
    </div>
    <div class="grid">${tiles}</div>`
}

const REC_LABEL: Record<Recorder['status'], string> = { idle: 'Prêt à enregistrer', recording: 'Enregistrement', paused: 'En pause' }

function recorderBar(r: Recorder, sending: boolean): string {
  const btn = (action: string, label: string, icon: string, cls = '') =>
    `<button class="icon-btn rec-btn ${cls}" data-action="${action}" aria-label="${label}" title="${label}">${svg(icon, 24, 2)}</button>`
  const controls =
    r.status === 'recording' ? btn('rec-pause', 'Mettre en pause', ICON_PAUSE) + btn('rec-stop', 'Arrêter', ICON_STOP)
    : r.status === 'paused' ? btn('rec-record', 'Reprendre', ICON_REC, 'rec') + btn('rec-stop', 'Arrêter', ICON_STOP)
    : btn('rec-record', 'Enregistrer', ICON_REC, 'rec')
  const status = sending
    ? `<span class="rec-label sending" role="status"><span class="spinner" aria-hidden="true"></span>Transmission…</span>`
    : `<span class="rec-label">${REC_LABEL[r.status]}</span><span class="rec-time">${formatTime(r.seconds)}</span>`
  return `<div class="recorder ${r.status}">
    <span class="rec-dot" aria-hidden="true"></span>
    ${status}
    <span class="rec-controls">${controls}</span>
  </div>`
}

function interviewQuestionScreen(s: InterviewState, d: RenderDeps, ui: UiState): string {
  const chapter = d.chapters.find((c) => c.id === s.chapter)!
  const inChapter = d.interviewBank.filter((q) => q.chapter === s.chapter)
  const index = inChapter.findIndex((q) => q.id === s.current)
  const q = inChapter[index]!
  const probes = d.followUp.probes.map((p) => `<li>${esc(p)}</li>`).join('')
  return `${topBar({ action: 'iv-back', label: 'Chapitres' })}
    <div class="q-head">
      <span class="tape-label">${esc(chapter.label)}</span>
      <p class="muted">Question ${index + 1} sur ${inChapter.length}</p>
    </div>
    ${recorderBar(ui.recorder, ui.sending)}
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
    regles: () => rulesScreen(d),
    joueurs: () => playersScreen(s),
    choix: () => choiceScreen(s, d),
    question: () => questionScreen(s, d),
    fin: () => endScreen(s, d),
  }
  return screens[s.phase]()
}

function interviewScreen(s: InterviewState, d: RenderDeps, ui: UiState): string {
  const screens: Record<InterviewState['phase'], () => string> = {
    intro: () => introScreen(d),
    chapitres: () => chaptersScreen(s, d),
    question: () => interviewQuestionScreen(s, d, ui),
    fin: () => interviewEndScreen(s, d),
  }
  return screens[s.phase]()
}

export function render(root: HTMLElement, app: AppState, d: RenderDeps, ui: UiState): void {
  const [name, html] =
    app.mode === 'jeu' ? [app.game.phase, gameScreen(app.game, d)]
    : app.mode === 'interview' ? [`iv-${app.interview.phase}`, interviewScreen(app.interview, d, ui)]
    : ['accueil', homeScreen()]
  const toast = ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : ''
  root.innerHTML = `<section class="screen screen-${name}">${html}</section>${toast}`
}
