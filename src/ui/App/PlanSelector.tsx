import { appTheme } from "./theme";
import { buildProjectLabel } from "./scripts";

type Props = {
  pathList: Array<string>;
  selectedPath?: string;
  onSelect: (nextPath: string) => void;
};

const Placeholder = () => (
  <div
    className={`h-[65px] bg-gradient-to-r ${appTheme.accent.shimmerFrom} ${appTheme.accent.shimmerVia} ${appTheme.accent.shimmerTo} bg-[length:200%_100%] rounded-md`}
  />
);

export const PlanSelector = ({ pathList, selectedPath, onSelect }: Props) =>
  pathList.length ? (
    <label className={`grid gap-1.5 text-[0.85rem] ${appTheme.text.muted}`}>
      <span className={`text-[0.8rem] ${appTheme.text.subtle}`}>読み込むplan.md</span>
      <select
        className={`appearance-none border ${appTheme.input.border} rounded-[10px] px-3 py-2 ${appTheme.input.background} text-[0.9rem] ${appTheme.input.text}`}
        value={selectedPath ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        {pathList.map((pathValue) => (
          <option key={pathValue} value={pathValue}>
            {buildProjectLabel({ pathValue })}
          </option>
        ))}
      </select>
    </label>
  ) : (
    <Placeholder />
  );
