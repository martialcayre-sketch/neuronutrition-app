export type QOption = { value: string; label: string }
export type QField =
  | { type: 'multi'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'text'; id: string; label: string; placeholder?: string }

export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'mes-plaintes-actuelles-et-troubles-ressentis',
  title: 'Mes plaintes actuelles et troubles ressentis',
  fields: [
    { type: 'multi', id: 'troubles', label: 'Troubles ressentis', options: [
      { value: 'douleur', label: 'Douleur' },
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'sommeil', label: 'Sommeil' },
      { value: 'humeur', label: 'Humeur' },
      { value: 'autre', label: 'Autre' },
    ]},
    { type: 'likert', id: 'intensite', label: 'Intensité globale', min: 0, max: 10, left: 'Faible', right: 'Forte' },
    { type: 'text', id: 'commentaire', label: 'Commentaire', placeholder: '(optionnel) Précisions…' },
  ],
}

