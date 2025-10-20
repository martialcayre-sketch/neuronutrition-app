export type QOption = { value: string; label: string }
export type QField =
  | { type: 'radio'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: QOption[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'questionnaire-contextuel-mode-de-vie',
  title: 'Questionnaire contextuel mode de vie',
  fields: [
    { type: 'radio', id: 'rythme', label: 'Rythme hebdomadaire', options: [
      { value: 'stable', label: 'Plutôt stable' },
      { value: 'variable', label: 'Très variable' },
    ]},
    { type: 'likert', id: 'stress', label: 'Niveau de stress perçu', min: 0, max: 10, left: 'Faible', right: 'Élevé' },
    { type: 'multi', id: 'contraintes', label: 'Contraintes principales', options: [
      { value: 'horaires', label: 'Horaires' },
      { value: 'deplacements', label: 'Déplacements' },
      { value: 'familiales', label: 'Familiales' },
      { value: 'autres', label: 'Autres' },
    ]},
    { type: 'text', id: 'notes', label: 'Notes contextuelles', placeholder: 'Activités, environnement, obstacles…' },
  ],
}

