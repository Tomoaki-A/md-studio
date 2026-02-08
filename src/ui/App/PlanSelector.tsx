import { buildProjectLabel } from "./scripts";

type Props = {
  pathList: Array<string>;
  selectedPath?: string;
  onSelect: (nextPath: string) => void;
};

const Placeholder = () => (
  <div className="h-[65px] bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] rounded-md" />
);

export const PlanSelector = ({ pathList, selectedPath, onSelect }: Props) =>
  pathList.length ? (
    <label className="grid gap-1.5 text-[0.85rem] text-[#5b4f43]">
      <span className="text-[0.8rem] text-[#7a6a58]">読み込むplan.md</span>
      <select
        className="appearance-none border border-[#e6dfd3] rounded-[10px] px-3 py-2 bg-white text-[0.9rem] text-[#2e241c]"
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
