import type { PlanListPayload, PlanPayload, SavePlanPayload } from "./types";

export const fetchPlan = async ({
  pathValue,
}: {
  pathValue?: string;
} = {}): Promise<PlanPayload> => {
  const query = pathValue ? `?path=${encodeURIComponent(pathValue)}` : "";
  const response = await fetch(`/__plan${query}`);
  if (!response.ok) {
    throw new Error("plan.md の取得に失敗しました。");
  }
  const payload = (await response.json()) as {
    content: string;
    path: string | null;
  };
  return {
    content: payload.content,
    path: payload.path ?? undefined,
  };
};

export const fetchPlanList = async (): Promise<PlanListPayload> => {
  const response = await fetch("/__plans");
  if (!response.ok) {
    throw new Error("plan.md の一覧取得に失敗しました。");
  }
  const payload = (await response.json()) as {
    paths: Array<string>;
  };
  return {
    paths: payload.paths,
  };
};

export const savePlan = async ({ path, content }: SavePlanPayload): Promise<void> => {
  const response = await fetch("/__plan-save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      content,
    }),
  });
  if (!response.ok) {
    throw new Error("plan.md の保存に失敗しました。");
  }
};
