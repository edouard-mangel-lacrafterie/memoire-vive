# Spec — Prototype web « jeu de questions » (memoire-vive)

Date : 2026-10-10 · Statut : validé en brainstorming, en attente de relecture écrite

## 1. Pourquoi

Le concept memoire-vive (voir `docs/feature/transmission-memoire/discover/solution-testing.md`) parie qu'un jeu de questions légères joué en famille fait glisser la conversation vers des récits de vie. Ce prototype web est le support jouable des tests B1 (glissement vers le récit), B4 (quelqu'un paie), B5 (fréquence d'usage) et B9 (pas besoin d'animateur). Il doit être jouable sur un téléphone posé sur la table, ce weekend.

Hors périmètre : enregistrement audio, transcription, génération de récit, paiement réel, comptes utilisateurs, backend.

## 2. Décisions prises

| Sujet | Décision |
|---|---|
| Tranches d'âge | enfant < 15, adulte 15 à 59, aîné 60 et plus |
| Thématiques | 4 thèmes, noms et pictos génériques dans un fichier de données, à nommer plus tard |
| Fin de partie | un tour complet par joueur, puis écran de fin |
| Freemium | partie courte gratuite, pack « questions profondes » proposé à la fin via une porte factice |
| Techno | Vite, TypeScript vanilla, Vitest, pnpm, aucun framework UI |

## 3. Parcours et machine à états

```
Joueurs ──Démarrer──▶ Tour ──cible choisie──▶ Thème ──thème choisi──▶ Question
   ▲                   ▲                                                  │
   │                   └──────────── Répondu (tour suivant) ──────────────┤
   │                                                                      │ Répondu
   │                                                   (dernier joueur)   ▼
   └──────────────── Rejouer ◀──────────────────────────────────────── Fin
```

Écrans :

1. **Joueurs** : liste nom + âge, ajout, suppression. Démarrer actif à partir de 2 joueurs. Un lien discret « exporter les stats » télécharge le journal des événements en JSON.
2. **Tour** : « C'est à {demandeur} de poser une question ». Boutons pour chaque autre joueur. Le demandeur ne figure pas dans la liste.
3. **Thème** : 4 pictogrammes, un par thème.
4. **Question** : texte en gros, nom du répondant, bouton « Répondu ! ». Chaque réponse ajoute 1 au compteur de souvenirs.
5. **Fin** : compteur de souvenirs, niveau de table, bloc « Continuer avec le pack Souvenirs profonds, 12 questions inédites », bouton « Débloquer 4,99 € », bouton « Rejouer gratuitement ».

Ordre des tours : ordre de saisie des joueurs. Une partie dure exactement `nombre de joueurs` tours. Le niveau de table est un libellé calculé à partir du nombre de souvenirs (par exemple 1 à 3 « Curieux », 4 à 6 « Complices », 7 et plus « Inséparables »), à ajuster.

Porte factice : le clic sur « Débloquer » enregistre un événement `{date, joueurs, souvenirs}` dans localStorage, puis affiche « Merci, bientôt disponible » avec un champ email facultatif, lui aussi stocké localement. Rien n'est encaissé, rien ne part sur le réseau.

Persistance : l'état de partie est écrit dans localStorage à chaque transition. Au chargement, si une partie est en cours, elle reprend là où elle en était.

## 4. Domaine

Tout le domaine est en TypeScript pur, sans accès au DOM ni à `Math.random`.

```ts
type AgeBand = 'enfant' | 'adulte' | 'aine'
type BandRule = AgeBand | 'toutes'
type Tier = 'gratuit' | 'premium'

type Player   = { id: string; name: string; age: number }
type Theme    = { id: ThemeId; label: string; icon: string }
type Question = { id: string; text: string; theme: ThemeId;
                  asker: BandRule; answerer: BandRule; tier: Tier }

type Phase = 'joueurs' | 'tour' | 'theme' | 'question' | 'fin'
type GameState = {
  phase: Phase; players: Player[]; turn: number;
  target?: Player['id']; theme?: ThemeId; current?: Question['id'];
  asked: Question['id'][]; memories: number
}
```

Fonctions :

- `ageBand(age: number): AgeBand`
- `pickQuestion(bank, { askerBand, answererBand, theme, asked, rng }): Question`. Ne considère que le palier gratuit. Ordre de repli : (1) correspondance exacte des deux tranches, inédite ; (2) correspondance avec « toutes » sur l'une ou les deux tranches, inédite ; (3) recyclage parmi les déjà posées, mêmes critères. Le `rng` est injecté pour les tests.
- `reduce(state, action): GameState`, réducteur pur. Actions : `addPlayer`, `removePlayer`, `start`, `chooseTarget`, `chooseTheme`, `answered`, `restart`. `start` refuse moins de 2 joueurs. `chooseTarget` refuse le demandeur lui-même.
- `tableLevel(memories: number): string`

Invariants :

- Un joueur ne se pose jamais de question à lui-même.
- Une partie en phase `tour` ou plus a au moins 2 joueurs.
- `turn` est toujours dans `[0, players.length)`.
- Une question premium n'est jamais tirée.

## 5. Banque de questions

Fichier `src/data/questions.ts`. Première fournée : 2 à 3 questions gratuites par case (thème × tranche demandeur × tranche répondant), en privilégiant `asker: 'toutes'` quand la question ne dépend pas de qui la pose. Objectif : 60 à 90 questions gratuites, 12 questions premium réservées au texte de la porte factice. Contenu en français, ton léger, jamais morbide. Les questions sont des données : personne ne touche au code pour en ajouter.

Fichier `src/data/themes.ts` : 4 entrées avec `id`, `label` et `icon` (emoji), provisoires.

## 6. Interface

Mobile-first, CSS vanilla, police système. Boutons d'au moins 56 px de haut, texte de question à 1,5 rem minimum, contraste élevé. Une seule colonne jusqu'à 768 px, puis grille centrée. Pictos en emoji pour n'avoir aucun asset à produire, remplaçables par des SVG plus tard.

## 7. Tests

- Vitest : `ageBand` (bornes 14/15, 59/60), `pickQuestion` (chaque niveau de repli, jamais de premium, déterminisme avec un `rng` fixe), `reduce` (refus de démarrer à 1 joueur, refus de se cibler soi-même, passage en `fin` après le dernier joueur, `restart` qui conserve les joueurs).
- Playwright via MCP : captures à 360, 768 et 1024 px pour chaque écran.
- Vérification manuelle : une partie complète à 3 joueurs sur un vrai téléphone.

## 8. Structure du projet

```
memoire-vive/
  index.html  package.json  vite.config.ts  tsconfig.json
  src/main.ts                 bootstrap, branchement du réducteur sur le rendu
  src/ui/render.ts            rendu des 5 écrans à partir de GameState
  src/ui/styles.css
  src/domain/types.ts  ageBand.ts  pickQuestion.ts  game.ts  tableLevel.ts
  src/domain/*.test.ts
  src/data/themes.ts  questions.ts
  src/storage/local.ts        localStorage : état de partie, journal des événements
```

## 9. Critères de réussite du prototype

- Une famille joue une partie complète sans que quelqu'un doive expliquer l'interface.
- L'écran de fin s'affiche après un tour par joueur et le clic « Débloquer » est bien journalisé.
- Les tests Vitest passent, le build Vite produit un dossier statique déployable.
