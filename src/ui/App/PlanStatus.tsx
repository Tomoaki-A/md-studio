import { appTheme } from "./theme";

type Props = {
  isSaving: boolean;
  loadError: string | null;
  saveError: string | null;
};

export const PlanStatus = ({ isSaving, loadError, saveError }: Props) => (
  <>
    {loadError ? <p className={`m-0 text-[0.8rem] ${appTheme.error}`}>{loadError}</p> : null}
    {isSaving ? (
      <p className={`m-0 text-[0.8rem] ${appTheme.text.subtle}`}>保存中...</p>
    ) : null}
    {saveError ? <p className={`m-0 text-[0.8rem] ${appTheme.error}`}>{saveError}</p> : null}
  </>
);
