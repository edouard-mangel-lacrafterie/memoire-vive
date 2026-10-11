import type { Chapter, InterviewQuestion } from '../domain/types'

// Chapitres et questions traduits de docs/family-interview-questions.md, dans l'ordre du document.
export const chapters: readonly Chapter[] = [
  { id: 'voix', label: 'Ta voix', tint: '#FCE192',
    icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8.5 21h7"/>' },
  { id: 'enfance', label: 'Le monde de ton enfance', tint: '#C3ECF8',
    icon: '<ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"/><path d="M12 16v1.5"/><path d="M12 17.5c-1.5 1.2 1.5 2.3 0 3.5"/>' },
  { id: 'vie', label: 'Le fil de ta vie', tint: '#7CEFD5',
    icon: '<path d="M4 19c3-7 6-7 8-3s5 4 8-9"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="7" r="1.5"/>' },
  { id: 'famille', label: "L'histoire de la famille", tint: '#E6CCEC',
    icon: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>' },
  { id: 'recul', label: 'Avec le recul', tint: '#C3ECF8',
    icon: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2.5h5L16 6"/>' },
]

const q = (id: string, chapter: InterviewQuestion['chapter'], text: string): InterviewQuestion => ({ id, chapter, text })

export const interviewQuestions: readonly InterviewQuestion[] = [
  // Ta voix
  q('voix-01', 'voix', "Qu'est-ce que tu aimerais que tes enfants ou tes petits-enfants sachent de toi ?"),
  q('voix-02', 'voix', 'Si tu devais leur raconter où commence ton histoire, par où commencerais-tu ?'),
  q('voix-03', 'voix', "Y a-t-il une histoire sur toi que la famille raconte souvent ? Comment tu t'en souviens, toi ?"),
  q('voix-04', 'voix', 'Y a-t-il des parties de ta vie que tu préfères garder pour toi ?'),

  // Le monde de ton enfance
  q('enf-01', 'enfance', 'À quoi ressemblait ta maison quand tu étais enfant ? Fais-moi la visite.'),
  q('enf-02', 'enfance', 'Qui était autour de la table quand tu grandissais ? Comment étaient-ils ?'),
  q('enf-03', 'enfance', "À quoi ressemblait une journée ordinaire, à l'époque ?"),
  q('enf-04', 'enfance', 'Quels sons, quelles odeurs, quels plats ou quelles expressions te ramènent tout droit en enfance ?'),
  q('enf-05', 'enfance', "Qu'est-ce que tu adorais faire ? Qu'est-ce qui t'attirait des ennuis ?"),
  q('enf-06', 'enfance', "Qui te faisait te sentir en sécurité, ou t'a aidé à devenir toi-même ?"),

  // Le fil de ta vie
  q('vie-01', 'vie', 'Quand tu étais jeune, comment imaginais-tu ta vie ?'),
  q('vie-02', 'vie', "Raconte-moi comment tu as rencontré quelqu'un qui est devenu important pour toi."),
  q('vie-03', 'vie', "Comment as-tu choisi ton métier, ou comment t'a-t-il choisi ?"),
  q('vie-04', 'vie', "Y a-t-il eu un moment où tout a semblé basculer ? Que s'est-il passé ce jour-là ?"),
  q('vie-05', 'vie', "Quelle a été l'une de tes périodes les plus heureuses ? Qu'est-ce qui rendait le quotidien bon ?"),
  q('vie-06', 'vie', "Quelle a été une période difficile, et qu'est-ce qui t'a aidé à la traverser ?"),
  q('vie-07', 'vie', 'Y a-t-il un choix que tu as fait qui te surprend encore ?'),
  q('vie-08', 'vie', "À quoi as-tu renoncé pour prendre soin de quelqu'un, ou pour poursuivre quelque chose d'important ?"),

  // L'histoire de la famille
  q('fam-01', 'famille', 'De quoi te souviens-tu de tes débuts comme parent, grand-parent, ou dans le rôle que tu as eu dans cette famille ?'),
  q('fam-02', 'famille', "Quelle tradition familiale aimerais-tu que nous continuions ? D'où vient-elle ?"),
  q('fam-03', 'famille', 'Qui, dans la famille, devrions-nous mieux connaître à travers tes histoires ?'),
  q('fam-04', 'famille', "De quoi te souviens-tu à propos de [un événement partagé] ? J'aimerais l'entendre de ton point de vue."),
  q('fam-05', 'famille', "Qu'est-ce que nous avons toujours mal compris, ou jamais pensé à demander ?"),

  // Avec le recul
  q('rec-01', 'recul', "De quoi es-tu fier, ou fière, qui n'apparaîtrait pas dans une liste de réussites ?"),
  q('rec-02', 'recul', "Que croyais-tu quand tu étais plus jeune, et que tu vois autrement aujourd'hui ?"),
  q('rec-03', 'recul', "Que t'ont appris les gens que tu aimes ?"),
  q('rec-04', 'recul', 'Quels moments voudrais-tu absolument voir figurer dans ton histoire ?'),
  q('rec-05', 'recul', "Qu'aimerais-tu dire directement aux personnes qui liront ou écouteront ton histoire ?"),
]

/** Relance à proposer quand une histoire commence (section « Follow-up prompts » du document). */
export const followUp = {
  lead: 'Raconte-moi ce qui s\'est passé ensuite.',
  probes: ['Qui était là ?', "À quoi ressemblait l'endroit ?", "Qu'est-ce qui a été dit ?", "Qu'est-ce que tu ressentais, à ce moment-là ?"],
}

/** Phrase de consentement à lire avant d'enregistrer. */
export const consent =
  "Es-tu d'accord pour qu'on enregistre, et qu'on garde des passages de tes mots ou de ta voix dans un livre ou un récit audio pour la famille ? Y a-t-il des choses, aujourd'hui, qui restent entre nous ?"
