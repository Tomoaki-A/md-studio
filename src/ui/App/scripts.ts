import { defaultPlanState, fetchPlan } from '../../domain/plan'
import type { PlanPayload, PlanState } from '../../domain/plan'

const createSuccessState = ({ content, path }: PlanPayload): PlanState => ({
  content,
  path,
  error: null,
  loading: false,
})

const createErrorState = ({ message }: { message: string }): PlanState => ({
  content: 'plan.md の読み込みに失敗しました。',
  path: undefined,
  error: message,
  loading: false,
})

export const loadPlanState = async (): Promise<PlanState> => {
  try {
    const payload = await fetchPlan()
    return createSuccessState(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorState({ message })
  }
}

export const getInitialPlanState = (): PlanState => defaultPlanState
