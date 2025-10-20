export type Score = { activite_globale: 'faible'|'moyen'|'fort', travail: string, hors_travail: string }
export function score(payload: Record<string, any>): Score {
  const t = String(payload.travail || 'faible') as 'faible'|'moyen'|'fort'
  const h = String(payload.hors_travail || 'faible') as 'faible'|'moyen'|'fort'
  const activite_globale: 'faible'|'moyen'|'fort' = (t === 'fort' || h === 'fort') ? 'fort' : ((t === 'moyen' || h === 'moyen') ? 'moyen' : 'faible')
  return { activite_globale, travail: t, hors_travail: h }
}
