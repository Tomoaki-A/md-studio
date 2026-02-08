import type { PlanPayload } from './types'

export const fetchPlan = async (): Promise<PlanPayload> => {
  const response = await fetch('/__plan')
  if (!response.ok) {
    throw new Error('plan.md の取得に失敗しました。')
  }
  const payload = (await response.json()) as { content: string; path: string | null }
  return {
    content: payload.content,
    path: payload.path ?? undefined,
  }
}
