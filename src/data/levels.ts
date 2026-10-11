import type { LevelInfo } from '../domain/types'

// Les quatre types de questions des règles (étape 2), du plus léger au plus personnel.
export const levels: readonly LevelInfo[] = [
  { id: 'petites', label: 'Les petites histoires', hint: 'pour commencer en douceur', tint: '#CFDCC6',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/><path d="M9 9.5v.5"/><path d="M15 9.5v.5"/>' },
  { id: 'souvenirs', label: 'Les souvenirs à transmettre', hint: 'anecdotes et traditions', tint: '#EDDBB0',
    icon: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2.5h5L16 6"/>' },
  { id: 'valeurs', label: 'Les valeurs et les choix de vie', hint: 'ce qui a façonné chacun', tint: '#C9D6E8',
    icon: '<path d="M4 19c3-7 6-7 8-3s5 4 8-9"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="7" r="1.5"/>' },
  { id: 'personnelles', label: 'Les histoires plus personnelles', hint: 'pour aller un peu plus loin', tint: '#D9CFE6',
    icon: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>' },
]
