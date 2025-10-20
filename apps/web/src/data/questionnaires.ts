export type QuestionnaireItem = { id: string; label: string; href: string }
export type QuestionnaireCategory = { id: string; label: string; items: QuestionnaireItem[] }

// Catégories par défaut (modifiables).
export const defaultCategories: QuestionnaireCategory[] = [
  { id: 'alimentaire', label: 'Alimentaire', items: [
    { id: 'dnsm', label: 'DNSM', href: '/questionnaires/dnsm' },
  ]},
  { id: 'cancerologie', label: 'Cancerologie', items: [] },
  { id: 'cardiologie', label: 'Cardiologie', items: [] },
  { id: 'gastro-enterologie', label: 'Gastro-enterologie', items: [] },
  { id: 'mode-de-vie', label: 'Mode de vie', items: [] },
  { id: 'neuro-psychologie', label: 'Neuro-psychologie', items: [
    { id: 'had', label: 'HAD', href: '/questionnaires/had' },
  ]},
  { id: 'pediatrie', label: 'Pédiatrie', items: [] },
  { id: 'rhumatologie', label: 'Rhumatologie', items: [] },
  { id: 'sommeil', label: 'Sommeil', items: [
    { id: 'psqi', label: 'PSQI', href: '/questionnaires/psqi' },
  ]},
  { id: 'stress', label: 'Stress', items: [] },
  { id: 'tabacologie', label: 'Tabacologie', items: [] },
  { id: 'urologie', label: 'Urologie', items: [] },
]
