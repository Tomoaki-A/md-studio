export type PlanPayload = {
  content: string;
  path?: string;
};

export type PlanListPayload = {
  paths: Array<string>;
};

export type SavePlanPayload = {
  path: string;
  content: string;
};

export type PlanState = {
  content: string;
  path?: string;
  error: string | null;
  loading: boolean;
};
