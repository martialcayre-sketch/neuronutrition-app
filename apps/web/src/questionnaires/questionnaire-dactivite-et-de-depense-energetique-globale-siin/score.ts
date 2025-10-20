export type Score = { depense: number }
export function score(payload: Record<string, any>): Score {
  const marche = Number(payload.marche || 0)
  const mod = Number(payload.sport_modere || 0)
  const intense = Number(payload.sport_intense || 0)
  return { depense: marche*1 + mod*3 + intense*6 }
}

