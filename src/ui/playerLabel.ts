import type { Player } from '../domain/types'

export const playerLabel = (p: Player): string => `${p.name} · ${p.age} ans`
