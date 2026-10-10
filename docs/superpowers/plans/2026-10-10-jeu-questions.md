# Prototype web « jeu de questions » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une page web responsive où une famille saisit des joueurs (nom, âge), puis joue un tour par joueur : choisir à qui poser une question, choisir un thème parmi 4 pictos, lire la question adaptée aux âges, et arriver sur un écran de fin avec une porte factice « Débloquer 4,99 € ».

**Architecture:** Domaine en TypeScript pur (réducteur `reduce(state, action, deps)` + sélection de question `pickQuestion`), testé avec Vitest sans DOM. Une couche UI minimale rend les 5 écrans à partir de `GameState` par `innerHTML` et délégation d'événements. localStorage persiste l'état et journalise les clics sur la porte factice.

**Tech Stack:** pnpm, Vite 6, TypeScript 5, Vitest 3. Aucun framework UI, CSS vanilla.

**Spec:** `docs/superpowers/specs/2026-10-10-jeu-questions-design.md`

## Global Constraints

- Tranches d'âge : enfant < 15, adulte 15 à 59, aîné 60 et plus.
- Une partie dure exactement `players.length` tours, un tour par joueur dans l'ordre de saisie.
- Un joueur ne se pose jamais de question à lui-même.
- Une question `premium` n'est jamais tirée.
- Démarrer refuse moins de 2 joueurs.
- Rien ne part sur le réseau ; le paiement est une porte factice journalisée dans localStorage.
- Boutons tactiles d'au moins 56 px de haut, texte de question à 1,5 rem minimum.
- Messages de commit : décrire le changement uniquement, jamais de mention d'IA ni de ligne d'attribution.
- Toujours préfixer les commandes shell par `rtk`.

## Review Focus

1. Nom vide ou composé d'espaces à l'ajout d'un joueur : refusé sans crash (test dans Task 5).
2. Âge non entier, négatif ou supérieur à 120 : refusé (test dans Task 5).
3. Deux joueurs du même nom : acceptés, distingués par `id`, la cible se choisit par `id` (test dans Task 5).
4. Thème sans question correspondante pour un couple d'âges : la banque garantit au moins une question `toutes`/`toutes` par thème, donc `pickQuestion` ne renvoie jamais `undefined` en jeu (test de couverture dans Task 6) ; si cela arrivait quand même, le réducteur ignore l'action (test dans Task 5).
5. Rechargement de page en cours de partie : l'état repart de localStorage ; un état corrompu (JSON invalide) est ignoré et on repart de zéro (test dans Task 7).

---

### Task 1 : Squelette du projet

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/smoke.test.ts`

**Interfaces:**
- Produces : scripts `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm preview`.

- [ ] **Step 1 : Créer `package.json`**

```json
{
  "name": "memoire-vive",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2 : Installer les dépendances**

Run: `rtk pnpm add -D vite typescript vitest`
Expected : `node_modules/` créé, versions ajoutées à `package.json` (Vite ≥ 6, TypeScript ≥ 5, Vitest ≥ 3).

- [ ] **Step 3 : Créer `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4 : Créer `vite.config.ts`**

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  test: { include: ['src/**/*.test.ts'] },
})
```

Note : la clé `test` est lue par Vitest ; ajouter `/// <reference types="vitest/config" />` en tête du fichier si `tsc` se plaint.

- [ ] **Step 5 : Créer `index.html`**

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Mémoire vive</title>
    <link rel="stylesheet" href="/src/ui/styles.css" />
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6 : Créer `src/main.ts` provisoire et `src/ui/styles.css` vide**

```ts
document.querySelector<HTMLElement>('#app')!.textContent = 'Mémoire vive'
```

Run: `mkdir -p src/ui && touch src/ui/styles.css`

- [ ] **Step 7 : Écrire le test de fumée `src/smoke.test.ts`**

```ts
import { expect, test } from 'vitest'

test('vitest fonctionne', () => {
  expect(1 + 1).toBe(2)
})
```

- [ ] **Step 8 : Lancer les tests et le build**

Run: `rtk pnpm test && rtk pnpm build`
Expected : 1 test passé, dossier `dist/` produit.

- [ ] **Step 9 : Commit**

```bash
rtk git add -A && rtk git commit -m "Initialise le projet Vite + TypeScript + Vitest"
```

---

### Task 2 : Types du domaine et tranche d'âge

**Files:**
- Create: `src/domain/types.ts`, `src/domain/ageBand.ts`, `src/domain/ageBand.test.ts`

**Interfaces:**
- Produces : tous les types ci-dessous, et `ageBand(age: number): AgeBand`.

- [ ] **Step 1 : Créer `src/domain/types.ts`**

```ts
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
```

- [ ] **Step 2 : Écrire le test `src/domain/ageBand.test.ts`**

```ts
import { expect, test } from 'vitest'
import { ageBand } from './ageBand'

test.each([
  [0, 'enfant'],
  [14, 'enfant'],
  [15, 'adulte'],
  [59, 'adulte'],
  [60, 'aine'],
  [95, 'aine'],
])('ageBand(%i) = %s', (age, band) => {
  expect(ageBand(age)).toBe(band)
})
```

- [ ] **Step 3 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/domain/ageBand.test.ts`
Expected : FAIL, module `./ageBand` introuvable.

- [ ] **Step 4 : Implémenter `src/domain/ageBand.ts`**

```ts
import type { AgeBand } from './types'

export function ageBand(age: number): AgeBand {
  if (age < 15) return 'enfant'
  if (age < 60) return 'adulte'
  return 'aine'
}
```

- [ ] **Step 5 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/domain/ageBand.test.ts`
Expected : 6 tests passés.

- [ ] **Step 6 : Commit**

```bash
rtk git add src/domain && rtk git commit -m "Ajoute les types du domaine et le calcul de tranche d'âge"
```

---

### Task 3 : Sélection de question

**Files:**
- Create: `src/domain/pickQuestion.ts`, `src/domain/pickQuestion.test.ts`

**Interfaces:**
- Consumes : `Question`, `AgeBand`, `BandRule`, `ThemeId` de `types.ts`.
- Produces : `type Rng = () => number`, `type PickCriteria`, `pickQuestion(bank, criteria): Question | undefined`.

- [ ] **Step 1 : Écrire le test `src/domain/pickQuestion.test.ts`**

```ts
import { expect, test } from 'vitest'
import { pickQuestion } from './pickQuestion'
import type { Question } from './types'

const q = (id: string, over: Partial<Question> = {}): Question => ({
  id, text: id, theme: 'a', asker: 'toutes', answerer: 'toutes', tier: 'gratuit', ...over,
})
const first = () => 0
const base = { askerBand: 'adulte', answererBand: 'aine', theme: 'a', asked: [], rng: first } as const

test('préfère une correspondance exacte inédite', () => {
  const bank = [q('large'), q('exact', { asker: 'adulte', answerer: 'aine' })]
  expect(pickQuestion(bank, base)?.id).toBe('exact')
})

test('se replie sur une question "toutes" inédite', () => {
  const bank = [q('exact', { asker: 'adulte', answerer: 'aine' }), q('large')]
  expect(pickQuestion(bank, { ...base, asked: ['exact'] })?.id).toBe('large')
})

test('recycle les déjà posées quand tout est épuisé', () => {
  const bank = [q('large')]
  expect(pickQuestion(bank, { ...base, asked: ['large'] })?.id).toBe('large')
})

test('ne tire jamais une question premium', () => {
  const bank = [q('prem', { tier: 'premium' })]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('ignore les autres thèmes', () => {
  const bank = [q('b', { theme: 'b' })]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('ignore une question dont la tranche ne correspond pas', () => {
  const bank = [q('enf', { answerer: 'enfant' })]
  expect(pickQuestion(bank, base)).toBeUndefined()
})

test('utilise le rng injecté pour choisir parmi les candidates', () => {
  const bank = [q('x'), q('y'), q('z')]
  expect(pickQuestion(bank, { ...base, rng: () => 0.99 })?.id).toBe('z')
})
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/domain/pickQuestion.test.ts`
Expected : FAIL, module `./pickQuestion` introuvable.

- [ ] **Step 3 : Implémenter `src/domain/pickQuestion.ts`**

```ts
import type { AgeBand, BandRule, Question, ThemeId } from './types'

export type Rng = () => number

export type PickCriteria = {
  askerBand: AgeBand
  answererBand: AgeBand
  theme: ThemeId
  asked: readonly string[]
  rng: Rng
}

const matches = (rule: BandRule, band: AgeBand): boolean => rule === 'toutes' || rule === band

export function pickQuestion(bank: readonly Question[], c: PickCriteria): Question | undefined {
  const free = bank.filter((q) => q.tier === 'gratuit' && q.theme === c.theme)
  const loose = free.filter((q) => matches(q.asker, c.askerBand) && matches(q.answerer, c.answererBand))
  const exact = loose.filter((q) => q.asker === c.askerBand && q.answerer === c.answererBand)
  const unasked = (qs: Question[]) => qs.filter((q) => !c.asked.includes(q.id))

  const candidates = [unasked(exact), unasked(loose), loose].find((l) => l.length > 0)
  if (!candidates) return undefined
  return candidates[Math.floor(c.rng() * candidates.length)]
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/domain/pickQuestion.test.ts`
Expected : 7 tests passés.

- [ ] **Step 5 : Commit**

```bash
rtk git add src/domain && rtk git commit -m "Ajoute la sélection de question par tranches d'âge et thème"
```

---

### Task 4 : Niveau de table

**Files:**
- Create: `src/domain/tableLevel.ts`, `src/domain/tableLevel.test.ts`

**Interfaces:**
- Produces : `tableLevel(memories: number): string`.

- [ ] **Step 1 : Écrire le test `src/domain/tableLevel.test.ts`**

```ts
import { expect, test } from 'vitest'
import { tableLevel } from './tableLevel'

test.each([
  [0, 'Timides'],
  [1, 'Curieux'],
  [3, 'Curieux'],
  [4, 'Complices'],
  [6, 'Complices'],
  [7, 'Inséparables'],
  [20, 'Inséparables'],
])('tableLevel(%i) = %s', (n, label) => {
  expect(tableLevel(n)).toBe(label)
})
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/domain/tableLevel.test.ts`
Expected : FAIL, module introuvable.

- [ ] **Step 3 : Implémenter `src/domain/tableLevel.ts`**

```ts
export function tableLevel(memories: number): string {
  if (memories >= 7) return 'Inséparables'
  if (memories >= 4) return 'Complices'
  if (memories >= 1) return 'Curieux'
  return 'Timides'
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/domain/tableLevel.test.ts`
Expected : 7 tests passés.

- [ ] **Step 5 : Commit**

```bash
rtk git add src/domain && rtk git commit -m "Ajoute le niveau de table calculé sur les souvenirs"
```

---

### Task 5 : Réducteur de partie

**Files:**
- Create: `src/domain/game.ts`, `src/domain/game.test.ts`

**Interfaces:**
- Consumes : `pickQuestion`, `Rng` (Task 3), `ageBand` (Task 2), types (Task 2).
- Produces : `type Action`, `type Deps = { bank; rng; newId }`, `initialState: GameState`, `reduce(state, action, deps): GameState`, `currentAsker(state): Player | undefined`.

- [ ] **Step 1 : Écrire le test `src/domain/game.test.ts`**

```ts
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
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/domain/game.test.ts`
Expected : FAIL, module `./game` introuvable.

- [ ] **Step 3 : Implémenter `src/domain/game.ts`**

```ts
import { ageBand } from './ageBand'
import { pickQuestion, type Rng } from './pickQuestion'
import type { GameState, Player, Question, ThemeId } from './types'

export type Action =
  | { type: 'addPlayer'; name: string; age: number }
  | { type: 'removePlayer'; id: string }
  | { type: 'start' }
  | { type: 'chooseTarget'; id: string }
  | { type: 'chooseTheme'; theme: ThemeId }
  | { type: 'answered' }
  | { type: 'restart' }

export type Deps = { bank: readonly Question[]; rng: Rng; newId: () => string }

export const initialState: GameState = { phase: 'joueurs', players: [], turn: 0, asked: [], memories: 0 }

export function currentAsker(state: GameState): Player | undefined {
  return state.players[state.turn]
}

const validAge = (age: number) => Number.isInteger(age) && age >= 0 && age <= 120

export function reduce(state: GameState, action: Action, deps: Deps): GameState {
  switch (action.type) {
    case 'addPlayer': {
      const name = action.name.trim()
      if (state.phase !== 'joueurs' || name === '' || !validAge(action.age)) return state
      return { ...state, players: [...state.players, { id: deps.newId(), name, age: action.age }] }
    }
    case 'removePlayer':
      if (state.phase !== 'joueurs') return state
      return { ...state, players: state.players.filter((p) => p.id !== action.id) }
    case 'start':
      if (state.phase !== 'joueurs' || state.players.length < 2) return state
      return { ...state, phase: 'tour', turn: 0, asked: [], memories: 0 }
    case 'chooseTarget': {
      const asker = currentAsker(state)
      const target = state.players.find((p) => p.id === action.id)
      if (state.phase !== 'tour' || !asker || !target || target.id === asker.id) return state
      return { ...state, phase: 'theme', target: target.id }
    }
    case 'chooseTheme': {
      const asker = currentAsker(state)
      const target = state.players.find((p) => p.id === state.target)
      if (state.phase !== 'theme' || !asker || !target) return state
      const q = pickQuestion(deps.bank, {
        askerBand: ageBand(asker.age),
        answererBand: ageBand(target.age),
        theme: action.theme,
        asked: state.asked,
        rng: deps.rng,
      })
      if (!q) return state
      return { ...state, phase: 'question', theme: action.theme, current: q.id, asked: [...state.asked, q.id] }
    }
    case 'answered': {
      if (state.phase !== 'question') return state
      const { target: _t, theme: _th, current: _c, ...rest } = state
      const memories = state.memories + 1
      const last = state.turn + 1 >= state.players.length
      return last ? { ...rest, phase: 'fin', memories } : { ...rest, phase: 'tour', turn: state.turn + 1, memories }
    }
    case 'restart':
      if (state.phase !== 'fin') return state
      return { ...initialState, players: state.players }
  }
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/domain/game.test.ts`
Expected : 14 tests passés.

- [ ] **Step 5 : Commit**

```bash
rtk git add src/domain && rtk git commit -m "Ajoute le réducteur de partie avec ses invariants"
```

---

### Task 6 : Thèmes et banque de questions

**Files:**
- Create: `src/data/themes.ts`, `src/data/questions.ts`, `src/data/questions.test.ts`

**Interfaces:**
- Consumes : types (Task 2), `pickQuestion` (Task 3).
- Produces : `themes: readonly Theme[]` (4 entrées), `questions: readonly Question[]`.

- [ ] **Step 1 : Créer `src/data/themes.ts`** (libellés et pictos provisoires, à renommer sans toucher au code)

```ts
import type { Theme } from '../domain/types'

export const themes: readonly Theme[] = [
  { id: 'a', label: 'Quand tu étais petit', icon: '🧸' },
  { id: 'b', label: 'Rigolo', icon: '🤪' },
  { id: 'c', label: 'Premières fois', icon: '🌟' },
  { id: 'd', label: 'Et si…', icon: '🪄' },
]
```

- [ ] **Step 2 : Écrire le test de couverture `src/data/questions.test.ts`**

```ts
import { expect, test } from 'vitest'
import { pickQuestion } from '../domain/pickQuestion'
import type { AgeBand } from '../domain/types'
import { questions } from './questions'
import { themes } from './themes'

const bands: AgeBand[] = ['enfant', 'adulte', 'aine']

test('ids uniques', () => {
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
})

test('chaque thème a au moins une question gratuite pour chaque couple de tranches', () => {
  for (const theme of themes) {
    for (const askerBand of bands) {
      for (const answererBand of bands) {
        const q = pickQuestion(questions, { askerBand, answererBand, theme: theme.id, asked: [], rng: () => 0 })
        expect(q, `${theme.id} ${askerBand}→${answererBand}`).toBeDefined()
      }
    }
  }
})

test('il y a 12 questions premium pour le texte de la porte factice', () => {
  expect(questions.filter((q) => q.tier === 'premium')).toHaveLength(12)
})
```

- [ ] **Step 3 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/data/questions.test.ts`
Expected : FAIL, module `./questions` introuvable.

- [ ] **Step 4 : Créer `src/data/questions.ts`**

Première fournée. Convention d'id : `thème-numéro`. `asker: 'toutes'` par défaut, précisé seulement quand la question dépend de qui la pose.

```ts
import type { Question } from '../domain/types'

const q = (
  id: string,
  theme: Question['theme'],
  text: string,
  answerer: Question['answerer'] = 'toutes',
  asker: Question['asker'] = 'toutes',
  tier: Question['tier'] = 'gratuit',
): Question => ({ id, theme, text, asker, answerer, tier })

export const questions: readonly Question[] = [
  // a — Quand tu étais petit
  q('a-01', 'a', 'Quel était ton jouet préféré ?'),
  q('a-02', 'a', 'Quelle bêtise as-tu faite et que tes parents n\'ont jamais sue ?'),
  q('a-03', 'a', 'À quoi ressemblait ta chambre ?'),
  q('a-04', 'a', 'Quel était ton plat préféré à la cantine, ou le pire ?'),
  q('a-05', 'a', 'Raconte ta plus belle journée d\'école.'),
  q('a-06', 'a', 'Qu\'est-ce que tu voulais devenir quand tu serais grand ?', 'aine'),
  q('a-07', 'a', 'Quel jeu jouais-tu dans la rue ou dans la cour ?', 'aine'),
  q('a-08', 'a', 'Comment allais-tu à l\'école, et avec qui ?', 'aine'),
  q('a-09', 'a', 'Qu\'est-ce qui n\'existait pas quand tu avais mon âge ?', 'aine', 'enfant'),
  q('a-10', 'a', 'Quelle chanson te chantait-on pour t\'endormir ?', 'adulte'),
  q('a-11', 'a', 'Quel dessin animé regardais-tu le mercredi ?', 'adulte'),
  q('a-12', 'a', 'Qu\'est-ce que tu préfères faire à la récré ?', 'enfant'),
  q('a-13', 'a', 'C\'est quoi ton doudou, et il s\'appelle comment ?', 'enfant'),
  q('a-14', 'a', 'Quel était ton surnom quand tu étais petit ?', 'toutes', 'enfant'),

  // b — Rigolo
  q('b-01', 'b', 'Quelle est la chose la plus ridicule que tu aies portée ?'),
  q('b-02', 'b', 'Raconte un fou rire dont tu te souviens encore.'),
  q('b-03', 'b', 'Quel est le pire cadeau que tu aies reçu ?'),
  q('b-04', 'b', 'Quelle est ta plus grosse gaffe en public ?'),
  q('b-05', 'b', 'Imite quelqu\'un de la famille, on devine qui.'),
  q('b-06', 'b', 'Quelle mode de ta jeunesse te fait honte aujourd\'hui ?', 'aine'),
  q('b-07', 'b', 'Quel mot de mon époque ne comprends-tu pas du tout ?', 'aine', 'enfant'),
  q('b-08', 'b', 'Quelle a été ta pire coupe de cheveux ?', 'adulte'),
  q('b-09', 'b', 'Quel est ton bruit préféré pour faire rire les autres ?', 'enfant'),
  q('b-10', 'b', 'Fais ta tête la plus bizarre pendant 5 secondes.', 'enfant'),
  q('b-11', 'b', 'Quelle blague te fait rire à chaque fois ?'),
  q('b-12', 'b', 'Quel animal te ressemble le plus, et pourquoi ?'),

  // c — Premières fois
  q('c-01', 'c', 'Ton premier voyage loin de la maison, c\'était où ?'),
  q('c-02', 'c', 'La première fois que tu as eu vraiment peur ?'),
  q('c-03', 'c', 'Ta première grande fierté ?'),
  q('c-04', 'c', 'Ton premier jour de travail, ça s\'est passé comment ?', 'aine'),
  q('c-05', 'c', 'Ta première voiture, ou ton premier vélo ?', 'aine'),
  q('c-06', 'c', 'La première fois que tu as vu la mer, ou la montagne ?', 'aine'),
  q('c-07', 'c', 'Ton premier concert ou ton premier film au cinéma ?', 'adulte'),
  q('c-08', 'c', 'Ton premier appartement, il ressemblait à quoi ?', 'adulte'),
  q('c-09', 'c', 'La première fois que tu as fait quelque chose tout seul ?', 'enfant'),
  q('c-10', 'c', 'Ton premier meilleur ami, tu l\'as rencontré comment ?', 'enfant'),
  q('c-11', 'c', 'Le premier plat que tu as cuisiné pour quelqu\'un ?'),
  q('c-12', 'c', 'La première fois que tu as pris le train, ou l\'avion ?'),
  q('c-13', 'c', 'Qu\'est-ce que tu m\'as appris en premier ?', 'aine', 'enfant'),

  // d — Et si…
  q('d-01', 'd', 'Si tu pouvais revivre une journée, laquelle ?'),
  q('d-02', 'd', 'Si tu avais un super-pouvoir pour la famille, lequel ?'),
  q('d-03', 'd', 'Si tu devais emporter un seul objet de la maison, lequel ?'),
  q('d-04', 'd', 'Si tu pouvais parler à toi-même à 20 ans, tu dirais quoi ?', 'aine'),
  q('d-05', 'd', 'Si tu pouvais retourner dans un lieu de ta jeunesse, lequel ?', 'aine'),
  q('d-06', 'd', 'Si on faisait un film de ta vie, qui jouerait ton rôle ?', 'adulte'),
  q('d-07', 'd', 'Si tu changeais de métier demain, tu ferais quoi ?', 'adulte'),
  q('d-08', 'd', 'Si tu avais un dragon, il s\'appellerait comment ?', 'enfant'),
  q('d-09', 'd', 'Si tu étais le chef de la maison un jour, quelle règle tu ferais ?', 'enfant'),
  q('d-10', 'd', 'Si tu pouvais me montrer un seul endroit, lequel ?', 'toutes', 'enfant'),
  q('d-11', 'd', 'Si tu gagnais au loto, tu offrirais quoi à la famille ?'),
  q('d-12', 'd', 'Si tu pouvais dîner avec quelqu\'un du passé, qui ?'),

  // premium — jamais tirées, servent la porte factice
  q('p-01', 'a', 'Quel secret de famille as-tu découvert en grandissant ?', 'toutes', 'toutes', 'premium'),
  q('p-02', 'a', 'De quoi avais-tu honte enfant, et que tu assumes aujourd\'hui ?', 'toutes', 'toutes', 'premium'),
  q('p-03', 'a', 'Quel adulte t\'a le plus marqué, et pourquoi ?', 'toutes', 'toutes', 'premium'),
  q('p-04', 'b', 'Quelle est la chose la plus folle que tu aies faite par amour ?', 'toutes', 'toutes', 'premium'),
  q('p-05', 'b', 'Quel mensonge as-tu tenu le plus longtemps ?', 'toutes', 'toutes', 'premium'),
  q('p-06', 'b', 'Quelle fête de famille a mal tourné, et pourquoi on en rit ?', 'toutes', 'toutes', 'premium'),
  q('p-07', 'c', 'La première fois que tu as dit « je t\'aime » ?', 'toutes', 'toutes', 'premium'),
  q('p-08', 'c', 'La première fois que tu as perdu quelqu\'un ?', 'toutes', 'toutes', 'premium'),
  q('p-09', 'c', 'La première fois que tu t\'es senti adulte ?', 'toutes', 'toutes', 'premium'),
  q('p-10', 'd', 'Si tu devais écrire une lettre à lire dans 20 ans, à qui ?', 'toutes', 'toutes', 'premium'),
  q('p-11', 'd', 'Si tu pouvais réparer une chose du passé, laquelle ?', 'toutes', 'toutes', 'premium'),
  q('p-12', 'd', 'Si tu devais résumer ce que tu as appris de la vie en une phrase ?', 'toutes', 'toutes', 'premium'),
]
```

- [ ] **Step 5 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/data/questions.test.ts`
Expected : 3 tests passés.

- [ ] **Step 6 : Commit**

```bash
rtk git add src/data && rtk git commit -m "Ajoute les 4 thèmes et la première banque de questions"
```

---

### Task 7 : Persistance localStorage

**Files:**
- Create: `src/storage/local.ts`, `src/storage/local.test.ts`

**Interfaces:**
- Consumes : `GameState` (Task 2).
- Produces : `loadState(): GameState | undefined`, `saveState(s)`, `clearState()`, `type UnlockEvent`, `logUnlock(e)`, `exportEvents(): string`.

Vitest tourne en environnement Node : le test fournit un faux `localStorage` sur `globalThis`.

- [ ] **Step 1 : Écrire le test `src/storage/local.test.ts`**

```ts
import { beforeEach, expect, test } from 'vitest'
import { clearState, exportEvents, loadState, logUnlock, saveState } from './local'
import { initialState } from '../domain/game'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage
})

test('sauvegarde et recharge l\'état', () => {
  const s = { ...initialState, memories: 3 }
  saveState(s)
  expect(loadState()).toEqual(s)
})

test('renvoie undefined sans état ou avec un JSON corrompu', () => {
  expect(loadState()).toBeUndefined()
  localStorage.setItem('mv.state', '{oops')
  expect(loadState()).toBeUndefined()
})

test('clearState efface l\'état', () => {
  saveState(initialState)
  clearState()
  expect(loadState()).toBeUndefined()
})

test('journalise les clics de déblocage et les exporte en JSON', () => {
  logUnlock({ date: '2026-10-11T10:00:00Z', players: 3, memories: 3 })
  logUnlock({ date: '2026-10-11T11:00:00Z', players: 2, memories: 2, email: 'a@b.c' })
  expect(JSON.parse(exportEvents())).toHaveLength(2)
})
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `rtk pnpm test src/storage/local.test.ts`
Expected : FAIL, module `./local` introuvable.

- [ ] **Step 3 : Implémenter `src/storage/local.ts`**

```ts
import type { GameState } from '../domain/types'

const STATE_KEY = 'mv.state'
const EVENTS_KEY = 'mv.events'

export type UnlockEvent = { date: string; players: number; memories: number; email?: string }

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function loadState(): GameState | undefined {
  const s = readJson<GameState>(STATE_KEY)
  return s && typeof s.phase === 'string' && Array.isArray(s.players) ? s : undefined
}

export function saveState(state: GameState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STATE_KEY)
}

export function logUnlock(event: UnlockEvent): void {
  const events = readJson<UnlockEvent[]>(EVENTS_KEY) ?? []
  localStorage.setItem(EVENTS_KEY, JSON.stringify([...events, event]))
}

export function exportEvents(): string {
  return JSON.stringify(readJson<UnlockEvent[]>(EVENTS_KEY) ?? [], null, 2)
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `rtk pnpm test src/storage/local.test.ts`
Expected : 4 tests passés.

- [ ] **Step 5 : Commit**

```bash
rtk git add src/storage && rtk git commit -m "Ajoute la persistance de la partie et le journal de déblocage"
```

---

### Task 8 : Rendu des écrans et câblage

**Files:**
- Create: `src/ui/render.ts`, `src/ui/styles.css`
- Modify: `src/main.ts` (remplacer le contenu provisoire de Task 1)

**Interfaces:**
- Consumes : `reduce`, `initialState`, `currentAsker`, `Action` (Task 5), `themes`, `questions` (Task 6), `tableLevel` (Task 4), `ageBand` (Task 2), storage (Task 7).
- Produces : `render(root, state, ui)` où `ui = { thanks: boolean }` ; `main.ts` branche tout.

Pas de test automatisé sur cette couche : elle ne contient aucune règle métier. Vérification visuelle en Task 9.

- [ ] **Step 1 : Créer `src/ui/render.ts`**

```ts
import { currentAsker } from '../domain/game'
import { tableLevel } from '../domain/tableLevel'
import type { GameState, Player, Question, Theme } from '../domain/types'

export type UiState = { thanks: boolean }
export type RenderDeps = { themes: readonly Theme[]; questions: readonly Question[] }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const byId = (players: Player[], id?: string) => players.find((p) => p.id === id)

function playersScreen(s: GameState): string {
  const rows = s.players
    .map(
      (p) => `<li class="player">
        <span>${esc(p.name)} <small>${p.age} ans</small></span>
        <button class="btn btn-ghost" data-action="removePlayer" data-id="${p.id}" aria-label="Retirer ${esc(p.name)}">✕</button>
      </li>`,
    )
    .join('')
  return `
    <h1>Mémoire vive</h1>
    <p class="lead">Qui joue aujourd'hui ?</p>
    <form id="add-player" class="row" autocomplete="off">
      <input name="name" placeholder="Prénom" required maxlength="30" />
      <input name="age" type="number" inputmode="numeric" placeholder="Âge" min="0" max="120" required />
      <button class="btn" type="submit">Ajouter</button>
    </form>
    <ul class="players">${rows}</ul>
    <button class="btn btn-primary btn-big" data-action="start" ${s.players.length < 2 ? 'disabled' : ''}>
      Démarrer la partie
    </button>
    <p class="hint"><a href="#" data-action="export">Exporter les stats</a></p>`
}

function turnScreen(s: GameState): string {
  const asker = currentAsker(s)!
  const targets = s.players
    .filter((p) => p.id !== asker.id)
    .map((p) => `<button class="btn btn-big" data-action="chooseTarget" data-id="${p.id}">${esc(p.name)}</button>`)
    .join('')
  return `
    <p class="lead">C'est à <strong>${esc(asker.name)}</strong> de poser une question.</p>
    <p>À qui ?</p>
    <div class="stack">${targets}</div>`
}

function themeScreen(s: GameState, d: RenderDeps): string {
  const target = byId(s.players, s.target)!
  const tiles = d.themes
    .map(
      (t) => `<button class="tile" data-action="chooseTheme" data-theme="${t.id}">
        <span class="icon" aria-hidden="true">${t.icon}</span>
        <span>${esc(t.label)}</span>
      </button>`,
    )
    .join('')
  return `
    <p class="lead">Une question pour <strong>${esc(target.name)}</strong>.</p>
    <p>Choisis un thème.</p>
    <div class="grid">${tiles}</div>`
}

function questionScreen(s: GameState, d: RenderDeps): string {
  const target = byId(s.players, s.target)!
  const q = d.questions.find((x) => x.id === s.current)!
  const theme = d.themes.find((t) => t.id === s.theme)!
  return `
    <p class="lead"><span aria-hidden="true">${theme.icon}</span> ${esc(theme.label)}</p>
    <p class="question">${esc(q.text)}</p>
    <p>${esc(target.name)}, à toi !</p>
    <button class="btn btn-primary btn-big" data-action="answered">Répondu !</button>`
}

function endScreen(s: GameState, ui: UiState, d: RenderDeps): string {
  const premium = d.questions.filter((q) => q.tier === 'premium').length
  const door = ui.thanks
    ? `<p class="thanks">Merci ! Le pack arrive bientôt.</p>
       <form id="email-form" class="row">
         <input name="email" type="email" placeholder="Votre email pour être prévenu (facultatif)" />
         <button class="btn" type="submit">OK</button>
       </form>`
    : `<button class="btn btn-primary btn-big" data-action="unlock">Débloquer · 4,99 €</button>`
  return `
    <h1>🎉 ${s.memories} souvenir${s.memories > 1 ? 's' : ''} partagé${s.memories > 1 ? 's' : ''}</h1>
    <p class="lead">Niveau de la table : <strong>${esc(tableLevel(s.memories))}</strong></p>
    <section class="card">
      <h2>Continuer avec le pack « Souvenirs profonds »</h2>
      <p>${premium} questions inédites pour aller plus loin.</p>
      ${door}
    </section>
    <button class="btn btn-big" data-action="restart">Rejouer gratuitement</button>`
}

export function render(root: HTMLElement, s: GameState, ui: UiState, d: RenderDeps): void {
  const screens: Record<GameState['phase'], () => string> = {
    joueurs: () => playersScreen(s),
    tour: () => turnScreen(s),
    theme: () => themeScreen(s, d),
    question: () => questionScreen(s, d),
    fin: () => endScreen(s, ui, d),
  }
  root.innerHTML = `<section class="screen screen-${s.phase}">${screens[s.phase]()}</section>`
}
```

- [ ] **Step 2 : Remplacer `src/main.ts`**

```ts
import { initialState, reduce, type Action } from './domain/game'
import { questions } from './data/questions'
import { themes } from './data/themes'
import { clearState, exportEvents, loadState, logUnlock, saveState } from './storage/local'
import { render, type UiState } from './ui/render'

const root = document.querySelector<HTMLElement>('#app')!
const deps = { bank: questions, rng: Math.random, newId: () => crypto.randomUUID() }
let state = loadState() ?? initialState
const ui: UiState = { thanks: false }

function dispatch(action: Action): void {
  state = reduce(state, action, deps)
  if (action.type === 'restart') ui.thanks = false
  saveState(state)
  paint()
}

function paint(): void {
  render(root, state, ui, { themes, questions })
}

function download(name: string, content: string): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

root.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!el) return
  e.preventDefault()
  const { action, id, theme } = el.dataset
  switch (action) {
    case 'removePlayer': return dispatch({ type: 'removePlayer', id: id! })
    case 'start': return dispatch({ type: 'start' })
    case 'chooseTarget': return dispatch({ type: 'chooseTarget', id: id! })
    case 'chooseTheme': return dispatch({ type: 'chooseTheme', theme: theme as Action & { type: 'chooseTheme' } extends { theme: infer T } ? T : never })
    case 'answered': return dispatch({ type: 'answered' })
    case 'restart': return dispatch({ type: 'restart' })
    case 'unlock':
      logUnlock({ date: new Date().toISOString(), players: state.players.length, memories: state.memories })
      ui.thanks = true
      return paint()
    case 'export': return download('memoire-vive-stats.json', exportEvents())
  }
})

root.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement
  e.preventDefault()
  const data = new FormData(form)
  if (form.id === 'add-player') {
    dispatch({ type: 'addPlayer', name: String(data.get('name') ?? ''), age: Number(data.get('age')) })
    form.reset()
    form.querySelector<HTMLInputElement>('[name=name]')?.focus()
  }
  if (form.id === 'email-form') {
    const email = String(data.get('email') ?? '').trim()
    if (email) logUnlock({ date: new Date().toISOString(), players: state.players.length, memories: state.memories, email })
    form.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Noté, merci !' }))
  }
})

paint()
export { clearState }
```

Note : la ligne `chooseTheme` utilise un type conditionnel verbeux. Si `tsc` râle, remplacer par `theme: theme as ThemeId` avec `import type { ThemeId } from './domain/types'`. La dernière ligne `export { clearState }` évite un avertissement d'import inutilisé ; la supprimer avec l'import si l'on préfère.

- [ ] **Step 3 : Écrire `src/ui/styles.css`**

```css
:root {
  --bg: #fffaf3;
  --ink: #2b2118;
  --accent: #d9531e;
  --accent-ink: #fff;
  --muted: #8a7a6d;
  --card: #fff;
  --radius: 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  background: var(--bg);
}
* { box-sizing: border-box; }
body { margin: 0; min-height: 100dvh; display: grid; place-items: start center; padding: 1rem; padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
#app { width: 100%; max-width: 560px; }
.screen { display: flex; flex-direction: column; gap: 1rem; }
h1 { font-size: 2rem; margin: 0; }
h2 { font-size: 1.25rem; margin: 0 0 .5rem; }
.lead { font-size: 1.25rem; margin: 0; }
.question { font-size: 1.75rem; line-height: 1.3; font-weight: 600; margin: 1rem 0; }
.hint { color: var(--muted); font-size: .9rem; text-align: center; }
.hint a { color: inherit; }
.row { display: flex; gap: .5rem; flex-wrap: wrap; }
.row input { flex: 1 1 8rem; min-height: 56px; font-size: 1.1rem; padding: 0 1rem; border: 2px solid #ddd; border-radius: var(--radius); }
.row input[name=age] { flex: 0 1 6rem; }
.stack { display: flex; flex-direction: column; gap: .75rem; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }
.btn { min-height: 56px; font-size: 1.1rem; padding: 0 1.25rem; border: 2px solid var(--ink); border-radius: var(--radius); background: var(--card); color: var(--ink); cursor: pointer; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.btn-big { width: 100%; font-size: 1.3rem; min-height: 64px; }
.btn-ghost { border: none; background: transparent; min-height: 44px; min-width: 44px; }
.tile { min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; font-size: 1.1rem; border: 2px solid var(--ink); border-radius: var(--radius); background: var(--card); cursor: pointer; }
.tile .icon { font-size: 2.5rem; }
.players { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
.player { display: flex; justify-content: space-between; align-items: center; background: var(--card); padding: .5rem 1rem; border-radius: var(--radius); font-size: 1.1rem; }
.player small { color: var(--muted); }
.card { background: var(--card); padding: 1rem; border-radius: var(--radius); border: 2px dashed var(--accent); display: flex; flex-direction: column; gap: .75rem; }
.thanks { font-weight: 600; margin: 0; }
@media (min-width: 768px) {
  body { place-items: center; }
  .grid { grid-template-columns: repeat(4, 1fr); }
  .question { font-size: 2.25rem; }
}
```

- [ ] **Step 4 : Vérifier la compilation et le build**

Run: `rtk pnpm build`
Expected : `tsc` sans erreur, `dist/` produit.

- [ ] **Step 5 : Commit**

```bash
rtk git add src index.html && rtk git commit -m "Ajoute le rendu des cinq écrans et le câblage de la partie"
```

---

### Task 9 : Vérification visuelle et responsive

**Files:** aucun fichier produit, captures dans le scratchpad de session.

- [ ] **Step 1 : Lancer le serveur de dev en arrière-plan**

Run: `rtk pnpm dev --port 5173` (en arrière-plan)
Expected : serveur sur `http://localhost:5173`.

- [ ] **Step 2 : Parcourir une partie à 3 joueurs avec Playwright MCP**

Avec les outils `browser_navigate`, `browser_fill_form`, `browser_click`, `browser_snapshot` : ajouter Mamie 72, Papa 45, Léo 9 ; démarrer ; Mamie choisit Léo, thème a ; Répondu ; Papa choisit Mamie, thème c ; Répondu ; Léo choisit Papa, thème d ; Répondu. Vérifier que l'écran de fin affiche « 3 souvenirs partagés » et « Niveau de la table : Curieux ». Cliquer « Débloquer », vérifier le message de remerciement.

- [ ] **Step 3 : Captures responsive**

Avec `browser_resize` puis `browser_take_screenshot` à 360×740, 768×1024 et 1024×768 sur les écrans Joueurs, Thème et Question. Vérifier : aucun débordement horizontal, boutons d'au moins 56 px, question lisible à bout de bras.

- [ ] **Step 4 : Rechargement en cours de partie**

En phase `theme`, recharger la page : on doit retrouver l'écran Thème avec la même cible.

- [ ] **Step 5 : Test sur un vrai téléphone**

Run: `rtk pnpm dev --host` puis ouvrir l'URL réseau affichée depuis un téléphone sur le même Wi-Fi. Jouer une partie à 2.

- [ ] **Step 6 : Corriger ce qui a été vu, relancer tests et build, commit**

Run: `rtk pnpm test && rtk pnpm build`
Expected : tous les tests passent, build OK.

```bash
rtk git add -A && rtk git commit -m "Ajuste l'interface après vérification sur mobile"
```
