export type QuestionnaireItem = { id: string; label: string; href: string }
export type QuestionnaireCategory = { id: string; label: string; items: QuestionnaireItem[] }

// Default categories. If a generated file exists, the page can import that instead.
export const defaultCategories: QuestionnaireCategory[] = [
  {
    id: 'sommeil',
    label: 'Sommeil',
    items: [
      { id: 'psqi', label: 'PSQI', href: '/questionnaires/psqi' },
    ],
  },
  {
    id: 'humeur',
    label: 'Humeur',
    items: [
      { id: 'had', label: 'HAD', href: '/questionnaires/had' },
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    items: [
      { id: 'dnsm', label: 'DNSM', href: '/questionnaires/dnsm' },
    ],
  },
]

