import type { PlanState } from './types'

export const defaultPlanState: PlanState = {
  content: 'plan.md を読み込み中です。',
  path: undefined,
  error: null,
  loading: true,
}
