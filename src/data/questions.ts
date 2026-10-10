import type { Question } from '../domain/types'

// Banque de questions. Pour en ajouter : une ligne q(id, thème, texte, répondant?, demandeur?, palier?).
// Tranches : 'enfant' (< 15), 'adulte' (15-59), 'aine' (60+), 'toutes'. Palier : 'gratuit' (défaut) ou 'premium'.
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
  q('a-02', 'a', "Quelle bêtise as-tu faite et que tes parents n'ont jamais sue ?"),
  q('a-03', 'a', 'À quoi ressemblait ta chambre ?'),
  q('a-04', 'a', 'Quel était ton plat préféré à la cantine, ou le pire ?'),
  q('a-05', 'a', "Raconte ta plus belle journée d'école."),
  q('a-06', 'a', "Qu'est-ce que tu voulais devenir quand tu serais grand ?", 'aine'),
  q('a-07', 'a', 'Quel jeu jouais-tu dans la rue ou dans la cour ?', 'aine'),
  q('a-08', 'a', "Comment allais-tu à l'école, et avec qui ?", 'aine'),
  q('a-09', 'a', "Qu'est-ce qui n'existait pas quand tu avais mon âge ?", 'aine', 'enfant'),
  q('a-10', 'a', "Quelle chanson te chantait-on pour t'endormir ?", 'adulte'),
  q('a-11', 'a', 'Quel dessin animé regardais-tu le mercredi ?', 'adulte'),
  q('a-12', 'a', "Qu'est-ce que tu préfères faire à la récré ?", 'enfant'),
  q('a-13', 'a', "C'est quoi ton doudou, et il s'appelle comment ?", 'enfant'),
  q('a-14', 'a', 'Quel était ton surnom quand tu étais petit ?', 'toutes', 'enfant'),

  // b — Rigolo
  q('b-01', 'b', 'Quelle est la chose la plus ridicule que tu aies portée ?'),
  q('b-02', 'b', 'Raconte un fou rire dont tu te souviens encore.'),
  q('b-03', 'b', 'Quel est le pire cadeau que tu aies reçu ?'),
  q('b-04', 'b', 'Quelle est ta plus grosse gaffe en public ?'),
  q('b-05', 'b', "Imite quelqu'un de la famille, on devine qui."),
  q('b-06', 'b', "Quelle mode de ta jeunesse te fait honte aujourd'hui ?", 'aine'),
  q('b-07', 'b', 'Quel mot de mon époque ne comprends-tu pas du tout ?', 'aine', 'enfant'),
  q('b-08', 'b', 'Quelle a été ta pire coupe de cheveux ?', 'adulte'),
  q('b-09', 'b', 'Quel est ton bruit préféré pour faire rire les autres ?', 'enfant'),
  q('b-10', 'b', 'Fais ta tête la plus bizarre pendant 5 secondes.', 'enfant'),
  q('b-11', 'b', 'Quelle blague te fait rire à chaque fois ?'),
  q('b-12', 'b', 'Quel animal te ressemble le plus, et pourquoi ?'),

  // c — Premières fois
  q('c-01', 'c', "Ton premier voyage loin de la maison, c'était où ?"),
  q('c-02', 'c', 'La première fois que tu as eu vraiment peur ?'),
  q('c-03', 'c', 'Ta première grande fierté ?'),
  q('c-04', 'c', "Ton premier jour de travail, ça s'est passé comment ?", 'aine'),
  q('c-05', 'c', 'Ta première voiture, ou ton premier vélo ?', 'aine'),
  q('c-06', 'c', 'La première fois que tu as vu la mer, ou la montagne ?', 'aine'),
  q('c-07', 'c', 'Ton premier concert ou ton premier film au cinéma ?', 'adulte'),
  q('c-08', 'c', 'Ton premier appartement, il ressemblait à quoi ?', 'adulte'),
  q('c-09', 'c', 'La première fois que tu as fait quelque chose tout seul ?', 'enfant'),
  q('c-10', 'c', "Ton premier meilleur ami, tu l'as rencontré comment ?", 'enfant'),
  q('c-11', 'c', "Le premier plat que tu as cuisiné pour quelqu'un ?"),
  q('c-12', 'c', "La première fois que tu as pris le train, ou l'avion ?"),
  q('c-13', 'c', "Qu'est-ce que tu m'as appris en premier ?", 'aine', 'enfant'),

  // d — Et si…
  q('d-01', 'd', 'Si tu pouvais revivre une journée, laquelle ?'),
  q('d-02', 'd', 'Si tu avais un super-pouvoir pour la famille, lequel ?'),
  q('d-03', 'd', 'Si tu devais emporter un seul objet de la maison, lequel ?'),
  q('d-04', 'd', 'Si tu pouvais parler à toi-même à 20 ans, tu dirais quoi ?', 'aine'),
  q('d-05', 'd', 'Si tu pouvais retourner dans un lieu de ta jeunesse, lequel ?', 'aine'),
  q('d-06', 'd', 'Si on faisait un film de ta vie, qui jouerait ton rôle ?', 'adulte'),
  q('d-07', 'd', 'Si tu changeais de métier demain, tu ferais quoi ?', 'adulte'),
  q('d-08', 'd', "Si tu avais un dragon, il s'appellerait comment ?", 'enfant'),
  q('d-09', 'd', 'Si tu étais le chef de la maison un jour, quelle règle tu ferais ?', 'enfant'),
  q('d-10', 'd', 'Si tu pouvais me montrer un seul endroit, lequel ?', 'toutes', 'enfant'),
  q('d-11', 'd', 'Si tu gagnais au loto, tu offrirais quoi à la famille ?'),
  q('d-12', 'd', "Si tu pouvais dîner avec quelqu'un du passé, qui ?"),

  // premium — jamais tirées, servent la porte factice
  q('p-01', 'a', 'Quel secret de famille as-tu découvert en grandissant ?', 'toutes', 'toutes', 'premium'),
  q('p-02', 'a', "De quoi avais-tu honte enfant, et que tu assumes aujourd'hui ?", 'toutes', 'toutes', 'premium'),
  q('p-03', 'a', "Quel adulte t'a le plus marqué, et pourquoi ?", 'toutes', 'toutes', 'premium'),
  q('p-04', 'b', 'Quelle est la chose la plus folle que tu aies faite par amour ?', 'toutes', 'toutes', 'premium'),
  q('p-05', 'b', 'Quel mensonge as-tu tenu le plus longtemps ?', 'toutes', 'toutes', 'premium'),
  q('p-06', 'b', 'Quelle fête de famille a mal tourné, et pourquoi on en rit ?', 'toutes', 'toutes', 'premium'),
  q('p-07', 'c', "La première fois que tu as dit « je t'aime » ?", 'toutes', 'toutes', 'premium'),
  q('p-08', 'c', "La première fois que tu as perdu quelqu'un ?", 'toutes', 'toutes', 'premium'),
  q('p-09', 'c', "La première fois que tu t'es senti adulte ?", 'toutes', 'toutes', 'premium'),
  q('p-10', 'd', 'Si tu devais écrire une lettre à lire dans 20 ans, à qui ?', 'toutes', 'toutes', 'premium'),
  q('p-11', 'd', 'Si tu pouvais réparer une chose du passé, laquelle ?', 'toutes', 'toutes', 'premium'),
  q('p-12', 'd', 'Si tu devais résumer ce que tu as appris de la vie en une phrase ?', 'toutes', 'toutes', 'premium'),
]
