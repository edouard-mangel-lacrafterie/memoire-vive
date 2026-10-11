// Jeu en famille (règles « Nos histoires, nos liens ») : un lecteur lit, la table répond librement.
export type Level = 'petites' | 'souvenirs' | 'valeurs' | 'personnelles'
export type LevelChoice = Level | 'melange'
export type Duration = 'courte' | 'moyenne' | 'longue'

export type Player = { id: string; name: string }
/** `icon` : contenu SVG au trait (viewBox 0 0 24 24, stroke currentColor) ; `tint` : fond pastel de la vignette. */
export type LevelInfo = { id: Level; label: string; hint: string; icon: string; tint: string }
export type Question = { id: string; text: string; level: Level }

export type Phase = 'regles' | 'joueurs' | 'choix' | 'question' | 'fin'
export type GameState = {
  phase: Phase
  players: Player[]
  turn: number
  duration?: Duration
  level?: LevelChoice
  current?: string
  asked: string[]
  shared: number
}

// Mode interview : un aîné raconte, un proche lit les questions chapitre par chapitre.
export type ChapterId = 'voix' | 'enfance' | 'vie' | 'famille' | 'recul'
export type Chapter = { id: ChapterId; label: string; icon: string; tint: string }
export type InterviewQuestion = { id: string; chapter: ChapterId; text: string }
export type InterviewPhase = 'intro' | 'chapitres' | 'question' | 'fin'
export type InterviewState = { phase: InterviewPhase; chapter?: ChapterId; current?: string; done: string[] }

/** 'liens' : la page d'entrée (linktree) ; 'accueil' : le choix du mode. */
export type Mode = 'liens' | 'accueil' | 'jeu' | 'interview'
export type AppState = { mode: Mode; game: GameState; interview: InterviewState }
