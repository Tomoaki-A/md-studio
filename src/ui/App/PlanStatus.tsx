type Props = {
  isSaving: boolean;
  loadError: string | null;
  saveError: string | null;
};

export const PlanStatus = ({ isSaving, loadError, saveError }: Props) => (
  <>
    {loadError ? <p className="m-0 text-[0.8rem] text-[#b33030]">{loadError}</p> : null}
    {isSaving ? <p className="m-0 text-[0.8rem] text-[#7a6a58]">保存中...</p> : null}
    {saveError ? <p className="m-0 text-[0.8rem] text-[#b33030]">{saveError}</p> : null}
  </>
);
