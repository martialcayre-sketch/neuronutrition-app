export type Score = { stress: number }
export function score(payload: Record<string, any>): Score {
  return { stress: Number(payload.stress ?? 0) }
}

