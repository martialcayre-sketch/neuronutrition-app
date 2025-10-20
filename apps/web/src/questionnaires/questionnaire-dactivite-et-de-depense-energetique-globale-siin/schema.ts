export type QField = { type: 'likert'; id: string; label: string; min: number; max: number }
export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'questionnaire-dactivite-et-de-depense-energetique-globale-siin',
  title: 'Activité et dépense énergétique (SIIN)',
  fields: [
    { type: 'likert', id: 'marche', label: 'Marche (heures/sem)', min: 0, max: 20 },
    { type: 'likert', id: 'sport_modere', label: 'Sport modéré (heures/sem)', min: 0, max: 20 },
    { type: 'likert', id: 'sport_intense', label: 'Sport intense (heures/sem)', min: 0, max: 20 },
  ],
}

