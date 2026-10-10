import { describe, expect, test } from 'vitest'
import { currentAsker, initialState, reduce, type Action, type Deps } from './game'
import type { GameState, Question } from './types'

const bank: Question[] = [
  { id: 'q1', text: 'Q1', theme: 'a', asker: 'toutes', answerer: 'toutes', tier: 'gratuit' },
  { id: 'q2', text: 'Q2', theme: 'a', asker: 'toutes', answerer: 'toutes', tier: 'gratuit' },
]
let counter = 0
const deps: Deps = { bank, rng: () => 0, newId: () => `p${++counter}` }
const run = (state: GameState, ...actions: Action[]) => actions.reduce((s, a) => reduce(s, a, deps), state)

const twoPlayers = () =>
  run(initialState, { type: 'addPlayer', name: 'Mamie', age: 72 }, { type: 'addPlayer', name: 'Léo', age: 9 })

describe('joueurs', () => {
  test('ajoute un joueur avec un id unique', () => {
    const s = twoPlayers()
    expect(s.players.map((p) => p.name)).toEqual(['Mamie', 'Léo'])
    expect(new Set(s.players.map((p) => p.id)).size).toBe(2)
  })
  test('refuse un nom vide ou blanc', () => {
    expect(reduce(initialState, { type: 'addPlayer', name: '   ', age: 30 }, deps).players).toHaveLength(0)
  })
  test('refuse un âge non entier, négatif ou > 120', () => {
    for (const age of [-1, 3.5, 121, Number.NaN]) {
      expect(reduce(initialState, { type: 'addPlayer', name: 'X', age }, deps).players).toHaveLength(0)
    }
  })
  test('accepte deux joueurs du même nom', () => {
    const s = run(initialState, { type: 'addPlayer', name: 'Léo', age: 9 }, { type: 'addPlayer', name: 'Léo', age: 40 })
    expect(s.players).toHaveLength(2)
  })
  test('retire un joueur par id', () => {
    const s = twoPlayers()
    expect(reduce(s, { type: 'removePlayer', id: s.players[0]!.id }, deps).players.map((p) => p.name)).toEqual(['Léo'])
  })
})

describe('démarrage', () => {
  test('refuse de démarrer avec moins de 2 joueurs', () => {
    const one = reduce(initialState, { type: 'addPlayer', name: 'Solo', age: 30 }, deps)
    expect(reduce(one, { type: 'start' }, deps).phase).toBe('joueurs')
  })
  test('démarre en phase tour avec le premier joueur', () => {
    const s = reduce(twoPlayers(), { type: 'start' }, deps)
    expect(s.phase).toBe('tour')
    expect(currentAsker(s)?.name).toBe('Mamie')
  })
})

describe('tour', () => {
  const started = () => reduce(twoPlayers(), { type: 'start' }, deps)
  test('refuse de se cibler soi-même', () => {
    const s = started()
    expect(reduce(s, { type: 'chooseTarget', id: s.players[0]!.id }, deps).phase).toBe('tour')
  })
  test('refuse un id inconnu', () => {
    expect(reduce(started(), { type: 'chooseTarget', id: 'nope' }, deps).phase).toBe('tour')
  })
  test('passe au thème avec une cible valide', () => {
    const s = started()
    const next = reduce(s, { type: 'chooseTarget', id: s.players[1]!.id }, deps)
    expect(next.phase).toBe('theme')
    expect(next.target).toBe(s.players[1]!.id)
  })
  test('choisir un thème tire une question et la marque posée', () => {
    const s = started()
    const next = run(s, { type: 'chooseTarget', id: s.players[1]!.id }, { type: 'chooseTheme', theme: 'a' })
    expect(next.phase).toBe('question')
    expect(next.current).toBe('q1')
    expect(next.asked).toEqual(['q1'])
  })
  test('ignore un thème sans question disponible', () => {
    const s = started()
    const next = run(s, { type: 'chooseTarget', id: s.players[1]!.id }, { type: 'chooseTheme', theme: 'd' })
    expect(next.phase).toBe('theme')
  })
  test('répondu passe au joueur suivant et compte un souvenir', () => {
    const s = started()
    const next = run(s, { type: 'chooseTarget', id: s.players[1]!.id }, { type: 'chooseTheme', theme: 'a' }, { type: 'answered' })
    expect(next.phase).toBe('tour')
    expect(next.turn).toBe(1)
    expect(next.memories).toBe(1)
    expect(next.target).toBeUndefined()
  })
  test('répondu après le dernier joueur termine la partie', () => {
    const s = started()
    const [a, b] = s.players as [GameState['players'][0], GameState['players'][0]]
    const end = run(
      s,
      { type: 'chooseTarget', id: b.id }, { type: 'chooseTheme', theme: 'a' }, { type: 'answered' },
      { type: 'chooseTarget', id: a.id }, { type: 'chooseTheme', theme: 'a' }, { type: 'answered' },
    )
    expect(end.phase).toBe('fin')
    expect(end.memories).toBe(2)
    expect(end.turn).toBeLessThan(end.players.length)
  })
  test('rejouer conserve les joueurs et remet les compteurs à zéro', () => {
    const fin: GameState = { ...twoPlayers(), phase: 'fin', turn: 1, asked: ['q1'], memories: 2 }
    const s = reduce(fin, { type: 'restart' }, deps)
    expect(s.phase).toBe('joueurs')
    expect(s.players).toHaveLength(2)
    expect(s.asked).toEqual([])
    expect(s.memories).toBe(0)
  })
})

describe('homonymes et abandon', () => {
  test('la cible se choisit par id parmi deux joueurs du même nom', () => {
    const s = run(
      initialState,
      { type: 'addPlayer', name: 'Mamie', age: 72 },
      { type: 'addPlayer', name: 'Léo', age: 9 },
      { type: 'addPlayer', name: 'Léo', age: 40 },
      { type: 'start' },
    )
    const leoAdulte = s.players[2]!
    expect(reduce(s, { type: 'chooseTarget', id: leoAdulte.id }, deps).target).toBe(leoAdulte.id)
  })
  test('abandonner en cours de partie revient aux joueurs sans compter de souvenir', () => {
    const s = reduce(twoPlayers(), { type: 'start' }, deps)
    const mid = run(s, { type: 'chooseTarget', id: s.players[1]!.id }, { type: 'chooseTheme', theme: 'a' })
    const out = reduce(mid, { type: 'abandon' }, deps)
    expect(out.phase).toBe('joueurs')
    expect(out.players).toHaveLength(2)
    expect(out.memories).toBe(0)
    expect(out.target).toBeUndefined()
  })
  test('abandonner sur l\'écran des joueurs ne change rien', () => {
    const s = twoPlayers()
    expect(reduce(s, { type: 'abandon' }, deps)).toEqual(s)
  })
})
