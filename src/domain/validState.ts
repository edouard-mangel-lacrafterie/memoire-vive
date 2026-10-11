import { initialApp } from './app'
import { initialState as initialGame } from './game'
import { initialInterview } from './interview'
import type { AppState, Chapter, Duration, GameState, InterviewPhase, InterviewQuestion, InterviewState, LevelChoice, LevelInfo, Mode, Phase, Player, Question } from './types'

export type Catalog = {
  bank: readonly Question[]
  levels: readonly LevelInfo[]
  interviewBank: readonly InterviewQuestion[]
  chapters: readonly Chapter[]
}

const MODES: readonly Mode[] = ['accueil', 'jeu', 'interview']
const PHASES: readonly Phase[] = ['regles', 'joueurs', 'choix', 'question', 'fin']
const DURATIONS: readonly Duration[] = ['courte', 'moyenne', 'longue']
const INTERVIEW_PHASES: readonly InterviewPhase[] = ['intro', 'chapitres', 'question', 'fin']

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null

const isPlayer = (p: unknown): p is Player => isObject(p) && typeof p.id === 'string' && typeof p.name === 'string'

/** Garde id et prénom, écarte le reste (l'ancien format portait un âge). */
const validPlayers = (raw: unknown): Player[] =>
  Array.isArray(raw) ? raw.filter(isPlayer).map((p) => ({ id: p.id, name: p.name })) : []

const validLevel = (c: Catalog, level: unknown): level is LevelChoice =>
  level === 'melange' || c.levels.some((l) => l.id === level)

function isPlayable(s: GameState, c: Catalog): boolean {
  if (!PHASES.includes(s.phase) || !Number.isInteger(s.turn) || !Array.isArray(s.asked)) return false
  if (typeof s.shared !== 'number') return false
  if (s.phase === 'regles' || s.phase === 'joueurs') return true
  if (s.players.length < 2 || s.turn < 0 || s.turn >= s.players.length) return false
  if (s.phase === 'question') {
    return validLevel(c, s.level) && DURATIONS.includes(s.duration as Duration) && c.bank.some((q) => q.id === s.current)
  }
  return true
}

/** Partie sauvegardée si elle est cohérente, sinon une partie neuve qui garde les joueurs valides. */
function recoverGame(raw: unknown, c: Catalog): GameState {
  const candidate = isObject(raw) ? (raw as unknown as GameState) : undefined
  const players = validPlayers(candidate?.players)
  if (candidate && Array.isArray(candidate.players) && players.length === candidate.players.length && isPlayable({ ...candidate, players }, c)) {
    return { ...candidate, players }
  }
  return { ...initialGame, phase: players.length > 0 ? 'joueurs' : 'regles', players }
}

function recoverInterview(raw: unknown, c: Catalog): InterviewState {
  if (!isObject(raw) || !Array.isArray(raw.done) || !raw.done.every((d) => typeof d === 'string')) return initialInterview
  const s = raw as unknown as InterviewState
  if (!INTERVIEW_PHASES.includes(s.phase)) return initialInterview
  if (s.phase !== 'question') return { phase: s.phase, done: s.done }
  const q = c.interviewBank.find((x) => x.id === s.current)
  if (!q || q.chapter !== s.chapter || !c.chapters.some((ch) => ch.id === q.chapter)) return initialInterview
  return { phase: 'question', chapter: q.chapter, current: q.id, done: s.done }
}

/** Renvoie l'état sauvegardé s'il est cohérent avec l'app, sinon un état neuf qui garde ce qui l'est encore. */
export function recoverState(raw: unknown, c: Catalog): AppState {
  if (!isObject(raw)) return initialApp
  // Ancien format (avant les modes) : la partie était sauvegardée seule.
  const legacy = Array.isArray(raw.players) && !('mode' in raw)
  if (legacy) return { ...initialApp, game: recoverGame(raw, c) }
  const mode = MODES.includes(raw.mode as Mode) ? (raw.mode as Mode) : 'accueil'
  return { mode, game: recoverGame(raw.game, c), interview: recoverInterview(raw.interview, c) }
}
