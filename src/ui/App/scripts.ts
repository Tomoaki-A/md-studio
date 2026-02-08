import { defaultPlanState, fetchPlan, fetchPlanList, savePlan } from "../../domain/plan";
import type { PlanPayload, PlanState, SavePlanPayload } from "../../domain/plan";
import TurndownService from "turndown";
import { marked } from "marked";

const createSuccessState = ({ content, path }: PlanPayload): PlanState => ({
  content,
  path,
  error: null,
  loading: false,
});

const createErrorState = ({ message }: { message: string }): PlanState => ({
  content: "plan.md の読み込みに失敗しました。",
  path: undefined,
  error: message,
  loading: false,
});

export const loadPlanState = async ({ pathValue }: { pathValue?: string }): Promise<PlanState> => {
  try {
    const payload = await fetchPlan({
      pathValue,
    });
    return createSuccessState(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorState({
      message,
    });
  }
};

export const getInitialPlanState = (): PlanState => defaultPlanState;

export const loadPlanPathList = async (): Promise<Array<string>> => {
  try {
    const payload = await fetchPlanList();
    return payload.paths;
  } catch {
    return [];
  }
};

const createTurndownService = () =>
  new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
  });

export const convertMarkdownToHtml = ({ markdown }: { markdown: string }) => marked.parse(markdown);

export const convertHtmlToMarkdown = ({ html }: { html: string }) => {
  const service = createTurndownService();
  return service.turndown(html);
};

export const savePlanContent = async ({ path, content }: SavePlanPayload) => {
  await savePlan({
    path,
    content,
  });
};
