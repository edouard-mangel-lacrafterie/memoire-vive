// Règles du jeu « Nos histoires, nos liens », condensées pour l'écran. Le texte complet est dans docs/.
export const rules = {
  title: 'Nos histoires, nos liens',
  welcome:
    "Ce jeu vous invite à prendre le temps de vous écouter, de découvrir ce que vous ne savez pas encore les uns des autres et de transmettre les histoires qui comptent pour vous.",
  motto:
    "Il n'y a pas de bonne ou de mauvaise réponse. Il n'y a rien à gagner, rien à prouver et rien à dévoiler à tout prix. Le plus important est le moment que vous partagez.",
  howTo: [
    'À tour de rôle, un joueur lit une question à voix haute.',
    'La personne qui souhaite répondre prend la parole. Les autres écoutent, sans interrompre.',
    'Une seule question peut suffire à faire naître une belle conversation. Laissez venir les silences.',
    'Vous pouvez changer de niveau ou arrêter à tout moment.',
  ],
  golden: [
    { title: 'Chacun est libre de répondre ou non.', text: "Répondre, répondre brièvement, raconter autre chose ou passer : sans jamais se justifier. Personne n'insiste." },
    { title: 'Nous écoutons sans juger.', text: "Curiosité et respect. Pas de moqueries, de reproches ni de comparaisons. Un souvenir n'a pas besoin de ressembler à celui des autres." },
    { title: 'Nous avons le droit de voir les choses différemment.', text: "Une même époque, une même personne peut être vécue de plusieurs manières. Comprendre l'autre sans imposer son point de vue." },
    { title: 'Nous respectons ce qui nous est confié.', text: "Une confidence ne se raconte pas ailleurs sans accord. On demande avant d'enregistrer, de photographier ou de partager." },
    { title: 'Nous prenons soin les uns des autres.', text: "Si une question met mal à l'aise : on passe, on change de sujet, on fait une pause. On écoute sans chercher de solution." },
  ],
  difficult: {
    intro: 'Certaines questions peuvent faire remonter des émotions ou des souvenirs douloureux. Si cela arrive :',
    tips: [
      'Chacun peut demander à passer à la question suivante.',
      'La personne qui parle choisit ce qu\'elle raconte et jusqu\'où elle va.',
      'Les autres peuvent demander si elle souhaite poursuivre, faire une pause ou changer de sujet.',
      'Personne n\'est obligé de donner un conseil, de se justifier ou de conclure.',
    ],
  },
  reminder: 'Chacun est libre de répondre ou non.',
  lastWord: [
    'Une histoire que vous avez aimé découvrir.',
    'Une chose que vous comprenez mieux chez quelqu\'un.',
    'Un souvenir que vous aimeriez raconter à votre tour.',
  ],
  thanks: "Merci d'avoir pris ce temps ensemble.",
} as const
