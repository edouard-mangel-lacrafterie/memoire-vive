export type AgeBand = 'enfant' | 'adulte' | 'aine'
export type BandRule = AgeBand | 'toutes'
export type ThemeId = 'enfance' | 'emotions' | 'souvenirs' | 'amour' | 'famille' | 'voyages' | 'ecole' | 'premieres'

export type Player = { id: string; name: string; age: number }
/** `icon` : contenu SVG au trait (viewBox 0 0 24 24, stroke currentColor) ; `tint` : fond pastel de la vignette. */
export type Theme = { id: ThemeId; label: string; icon: string; tint: string }
export type Question = {
  id: string
  text: string
  theme: ThemeId
  asker: BandRule
  answerer: BandRule
}

export type Phase = 'joueurs' | 'tour' | 'theme' | 'question' | 'fin'
export type GameState = {
  phase: Phase
  players: Player[]
  turn: number
  target?: string
  theme?: ThemeId
  current?: string
  asked: string[]
  memories: number
}

// Mode interview : un aîné raconte, un proche lit les questions chapitre par chapitre.
export type ChapterId = 'voix' | 'enfance' | 'vie' | 'famille' | 'recul'
export type Chapter = { id: ChapterId; label: string; icon: string; tint: string }
export type InterviewQuestion = { id: string; chapter: ChapterId; text: string }
export type InterviewPhase = 'intro' | 'chapitres' | 'question' | 'fin'
export type InterviewState = { phase: InterviewPhase; chapter?: ChapterId; current?: string; done: string[] }

export type Mode = 'accueil' | 'jeu' | 'interview'
export type AppState = { mode: Mode; game: GameState; interview: InterviewState }
