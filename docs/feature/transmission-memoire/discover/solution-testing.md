# Solution Testing — transmission-memoire

**Statut** : Phase 3 ouverte en parallèle de la Phase 1 (contexte startup weekend). G1 non passé : la solution est une hypothèse, pas une réponse à un problème validé.

## Concept de solution (2026-10-10)

Jeu de société sur mobile, dans l'esprit de « Blanc Manger Coco » : des questions légères et drôles posées à des personnes âgées, en famille, autour d'une table. Le téléphone est posé sur la table et enregistre les conversations. En fin de partie, on propose soit une transcription écrite, soit un récit audio monté et gamifié.

## Ce que cette solution dit implicitement du problème

Elle parie que le vrai frein n'est pas « je n'ai pas les outils », mais « c'est gênant et solennel de faire parler son parent de sa vie ». Le jeu sert de prétexte et casse la solennité. C'est l'hypothèse centrale à vérifier, car si le frein réel est ailleurs (manque de temps, parent réticent, famille dispersée), le jeu ne le lève pas.

## Hypothèse principale

> Nous croyons qu'un jeu de questions légères joué en famille autour d'une table, avec enregistrement passif sur téléphone, permettra aux familles de capturer les récits de vie de leurs aînés sans l'effort ni la gêne d'un « interview ».
> Nous saurons que c'est VRAI quand, sur 5 parties jouées avec de vraies familles, 4 produisent spontanément au moins 3 anecdotes de vie non demandées par les cartes, et qu'au moins 2 familles s'engagent (paiement, précommande, demande de la suite) pour obtenir le récit.
> Nous saurons que c'est FAUX quand les parties restent au niveau de la blague sans glisser vers le récit, ou que les aînés refusent ou subissent l'enregistrement.

## Hypothèses portées par la solution (score = impact×3 + incertitude×2 + facilité×1)

| ID | Catégorie | Hypothèse | Impact | Incert. | Facilité | Score | Test ce weekend ? |
|---|---|---|---|---|---|---|---|
| B1 | Valeur | Les questions légères font glisser la conversation vers des récits de vie substantiels, pas seulement vers des blagues | 3 | 3 | 1 | 16 | Oui, partie papier |
| B2 | Valeur | Les aînés acceptent un téléphone qui enregistre au milieu de la table, et restent naturels | 3 | 2 | 1 | 14 | Oui, observer la réaction à « je pose le téléphone, il enregistre » |
| B3 | Valeur | La sortie (transcription ou récit audio) est réellement conservée, réécoutée, partagée, contrairement aux vidéos de repas de famille | 3 | 3 | 1 | 16 | Oui, livrer une sortie le lendemain et observer |
| B4 | Viabilité | Quelqu'un paie pour la sortie, et c'est identifiable (l'enfant adulte ? le petit-enfant ?) | 3 | 3 | 1 | 16 | Oui, demander un engagement concret |
| B5 | Valeur | L'occasion de jeu existe assez souvent (repas du dimanche, fêtes) pour qu'un produit mobile ait une fréquence d'usage | 2 | 2 | 1 | 11 | Partiel, questions sur les réunions passées |
| B6 | Faisabilité | On peut transcrire et attribuer les voix dans un enregistrement de table (plusieurs voix, bruit, vaisselle) | 2 | 2 | 2 | 12 | Oui, un seul enregistrement réel suffit à mesurer |
| B7 | Faisabilité | Un récit audio « gamifié » monté automatiquement a une qualité que la famille trouve digne d'être gardée | 2 | 3 | 2 | 14 | Partiel, montage manuel en Wizard of Oz |
| B8 | Viabilité | Le consentement à l'enregistrement de la voix (donnée personnelle) est gérable sans tuer la spontanéité | 2 | 2 | 1 | 11 | Oui, tester la formulation de consentement |
| B9 | Usabilité | Le jeu se joue sans qu'un « animateur » de la famille doive tout porter (le petit-enfant qui a l'appli) | 2 | 2 | 1 | 11 | Oui, observer qui tient le téléphone |

## Plan de test du weekend (Wizard of Oz, zéro code)

### Test 1 — La partie papier (B1, B2, B5, B9)
- Fabriquer 30 cartes papier de questions légères (3 niveaux : rigolo, souvenir, intime-mais-doux).
- Jouer avec 3 à 5 vrais groupes incluant au moins un aîné : grands-parents de l'équipe par téléphone ou visio, résidence seniors proche, café associatif, voisins.
- Poser un téléphone en mode dictaphone. Dire exactement la phrase prévue pour l'enregistrement et noter la réaction.
- Observer et compter : durée de la partie, nombre d'anecdotes de vie non demandées, rires, moments où l'aîné prend la main, qui tient le téléphone, qui veut arrêter en premier.

### Test 2 — La livraison (B3, B4, B6, B7)
- Le soir même, transcrire à la main un enregistrement et écrire une page de récit, plus un montage audio simple de 2 minutes.
- Le lendemain, montrer les deux formats à la même famille. Ne pas demander « lequel préférez-vous ? » mais : « lequel vous gardez ? », « à qui vous l'envoyez, là, maintenant ? », « combien vous mettriez pour avoir ça pour toute une vie ? ».
- Demander un engagement : précommande à prix réel, prochaine partie planifiée, intro vers une autre famille.

### Test 3 — La porte factice (B4)
- Une page ou une affiche à l'événement : « Le récit de vie de vos parents, en une partie de jeu. Précommandez. » Compter les inscriptions avec email ou paiement symbolique.

## Seuils de décision pour dimanche

| Signal | Proceed | Pivot | Kill |
|---|---|---|---|
| Parties qui glissent vers le récit | 4 sur 5 | 2-3 sur 5 | 0-1 sur 5 |
| Aînés à l'aise avec l'enregistrement | 5 sur 5 | 3-4 sur 5 | moins de 3 |
| Familles qui s'engagent pour la sortie | 2+ sur 5 | 1 | 0 |
| Format conservé | un format domine clairement | les deux ignorés après 24 h | — |

## Résultats

_Aucun pour l'instant._
