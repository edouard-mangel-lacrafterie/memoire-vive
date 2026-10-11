import { describe, expect, test } from 'vitest'
import { currentReader, initialState, reachedTarget, reduce, TARGET, type Action, type Deps } from './game'
import type { GameState, Question } from './types'

const bank: Question[] = [
  { id: 'p1', text: 'P1', level: 'petites' },
  { id: 'p2', text: 'P2', level: 'petites' },
  { id: 'v1', text: 'V1', level: 'valeurs' },
]
let counter = 0
const deps: Deps = { bank, rng: () => 0, newId: () => `p${++counter}` }
const run = (state: GameState, ...actions: Action[]) => actions.reduce((s, a) => reduce(s, a, deps), state)

const atPlayers = () => reduce(initialState, { type: 'acceptRules' }, deps)
const twoPlayers = () => run(atPlayers(), { type: 'addPlayer', name: 'Mamie' }, { type: 'addPlayer', name: 'Léo' })
const atChoice = () => reduce(twoPlayers(), { type: 'start' }, deps)
const playing = () => reduce(atChoice(), { type: 'configure', duration: 'courte', level: 'petites' }, deps)

describe('règles', () => {
  test('commence par les règles, puis les joueurs', () => {
    expect(initialState.phase).toBe('regles')
    expect(atPlayers().phase).toBe('joueurs')
  })
  test('on ne peut pas ajouter de joueur avant d\'avoir lu les règles', () => {
    expect(reduce(initialState, { type: 'addPlayer', name: 'Mamie' }, deps).players).toHaveLength(0)
  })
})

describe('joueurs', () => {
  test('ajoute un joueur avec un id unique, prénom seulement', () => {
    const s = twoPlayers()
    expect(s.players.map((p) => p.name)).toEqual(['Mamie', 'Léo'])
    expect(new Set(s.players.map((p) => p.id)).size).toBe(2)
  })
  test('refuse un nom vide ou blanc', () => {
    expect(reduce(atPlayers(), { type: 'addPlayer', name: '   ' }, deps).players).toHaveLength(0)
  })
  test('accepte deux joueurs du même nom', () => {
    const s = run(atPlayers(), { type: 'addPlayer', name: 'Léo' }, { type: 'addPlayer', name: 'Léo' })
    expect(s.players).toHaveLength(2)
  })
  test('retire un joueur par id', () => {
    const s = twoPlayers()
    expect(reduce(s, { type: 'removePlayer', id: s.players[0]!.id }, deps).players.map((p) => p.name)).toEqual(['Léo'])
  })
  test('refuse de démarrer avec moins de 2 joueurs', () => {
    const one = reduce(atPlayers(), { type: 'addPlayer', name: 'Solo' }, deps)
    expect(reduce(one, { type: 'start' }, deps).phase).toBe('joueurs')
  })
  test('démarrer mène au choix de la partie', () => {
    expect(atChoice().phase).toBe('choix')
  })
})

describe('choix de la partie', () => {
  test('configurer tire une première question du niveau choisi, lue par le premier joueur', () => {
    const s = playing()
    expect(s.phase).toBe('question')
    expect(s.duration).toBe('courte')
    expect(s.level).toBe('petites')
    expect(s.current).toBe('p1')
    expect(s.asked).toEqual(['p1'])
    expect(currentReader(s)?.name).toBe('Mamie')
  })
  test('un niveau sans question laisse sur le choix', () => {
    const s = reduce(atChoice(), { type: 'configure', duration: 'courte', level: 'personnelles' }, deps)
    expect(s.phase).toBe('choix')
  })
  test('mélanger tire dans toute la banque', () => {
    const s = reduce(atChoice(), { type: 'configure', duration: 'courte', level: 'melange' }, deps)
    expect(s.phase).toBe('question')
  })
})

describe('questions', () => {
  test('suivante compte une histoire partagée, passe le livre au joueur suivant et tire une inédite', () => {
    const s = reduce(playing(), { type: 'next' }, deps)
    expect(s.shared).toBe(1)
    expect(currentReader(s)?.name).toBe('Léo')
    expect(s.current).toBe('p2')
    expect(s.asked).toEqual(['p1', 'p2'])
  })
  test('passer ne compte rien mais tourne et tire aussi', () => {
    const s = reduce(playing(), { type: 'skip' }, deps)
    expect(s.shared).toBe(0)
    expect(currentReader(s)?.name).toBe('Léo')
    expect(s.current).toBe('p2')
  })
  test('le lecteur revient au premier après le dernier', () => {
    const s = run(playing(), { type: 'next' }, { type: 'next' })
    expect(currentReader(s)?.name).toBe('Mamie')
  })
  test('un niveau épuisé recycle sans bloquer la partie', () => {
    const s = run(playing(), { type: 'next' }, { type: 'next' })
    expect(s.phase).toBe('question')
    expect(s.asked).toHaveLength(3)
  })
  test('changer de niveau revient au choix en gardant la durée et l\'historique', () => {
    const s = reduce(playing(), { type: 'changeLevel' }, deps)
    expect(s.phase).toBe('choix')
    expect(s.duration).toBe('courte')
    expect(s.asked).toEqual(['p1'])
    expect(s.current).toBeUndefined()
  })
  test('la durée suggère un nombre de questions, sans arrêter la partie', () => {
    let s = playing()
    expect(reachedTarget(s)).toBe(false)
    for (let i = 1; i < TARGET.courte; i++) s = reduce(s, { type: 'next' }, deps)
    expect(reachedTarget(s)).toBe(true)
    expect(reduce(s, { type: 'next' }, deps).phase).toBe('question')
  })
})

describe('fin et sortie', () => {
  test('terminer depuis une question ou le choix mène à la fin', () => {
    expect(reduce(playing(), { type: 'finish' }, deps).phase).toBe('fin')
    expect(reduce(atChoice(), { type: 'finish' }, deps).phase).toBe('fin')
  })
  test('rejouer garde les joueurs, saute les règles et remet les compteurs à zéro', () => {
    const fin = reduce(run(playing(), { type: 'next' }), { type: 'finish' }, deps)
    const s = reduce(fin, { type: 'restart' }, deps)
    expect(s.phase).toBe('joueurs')
    expect(s.players).toHaveLength(2)
    expect(s.asked).toEqual([])
    expect(s.shared).toBe(0)
    expect(s.level).toBeUndefined()
  })
  test('abandonner en cours de partie revient aux joueurs sans rien compter', () => {
    const out = reduce(playing(), { type: 'abandon' }, deps)
    expect(out.phase).toBe('joueurs')
    expect(out.players).toHaveLength(2)
    expect(out.shared).toBe(0)
    expect(out.current).toBeUndefined()
  })
  test('abandonner sur les règles ou les joueurs ne change rien', () => {
    expect(reduce(initialState, { type: 'abandon' }, deps)).toEqual(initialState)
    const s = twoPlayers()
    expect(reduce(s, { type: 'abandon' }, deps)).toEqual(s)
  })
})
