export type AgeBand = 'enfant' | 'adulte' | 'aine'
export type BandRule = AgeBand | 'toutes'
export type Tier = 'gratuit' | 'premium'
export type ThemeId = 'a' | 'b' | 'c' | 'd'

export type Player = { id: string; name: string; age: number }
export type Theme = { id: ThemeId; label: string; icon: string }
export type Question = {
  id: string
  text: string
  theme: ThemeId
  asker: BandRule
  answerer: BandRule
  tier: Tier
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
