import type { Theme } from '../domain/types'

// Icônes au trait (viewBox 0 0 24 24, fill none, stroke currentColor), teintes pastel du design.
export const themes: readonly Theme[] = [
  { id: 'enfance', label: 'Enfance', tint: '#C9D6E8',
    icon: '<ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"/><path d="M12 16v1.5"/><path d="M12 17.5c-1.5 1.2 1.5 2.3 0 3.5"/>' },
  { id: 'emotions', label: 'Émotions', tint: '#EBCFCB',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/><path d="M9 9.5v.5"/><path d="M15 9.5v.5"/>' },
  { id: 'souvenirs', label: 'Souvenirs', tint: '#EDDBB0',
    icon: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2.5h5L16 6"/>' },
  { id: 'amour', label: 'Amour, mariage', tint: '#D9CFE6',
    icon: '<circle cx="9" cy="13.5" r="5.5"/><circle cx="15" cy="13.5" r="5.5"/><path d="M7.5 5l1.5-2 1.5 2-1.5 2z"/>' },
  { id: 'famille', label: 'Famille', tint: '#CFDCC6',
    icon: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>' },
  { id: 'voyages', label: 'Voyages', tint: '#C9D6E8',
    icon: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8"/><path d="M4 13h16"/>' },
  { id: 'ecole', label: 'École, métiers', tint: '#EBCFCB',
    icon: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5v13"/>' },
  { id: 'premieres', label: 'Premières fois', tint: '#EDDBB0',
    icon: '<path d="M9 6l3-2v16"/><path d="M8 20h8"/><path d="M15 5h4l-2 3h2.5"/>' },
]
