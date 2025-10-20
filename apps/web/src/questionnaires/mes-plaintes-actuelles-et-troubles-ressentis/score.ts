export type Score = { intensite: number }
export function score(payload: Record<string, any>): Score {
  return { intensite: Number(payload.intensite ?? 0) }
}

