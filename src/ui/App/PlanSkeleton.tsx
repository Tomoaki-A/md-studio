import { appTheme } from "./theme";

type Props = {
  lineCount?: number;
};

export const PlanSkeleton = ({ lineCount = 10 }: Props) => (
  <div
    className={`border ${appTheme.panel.border} rounded-xl p-4 ${appTheme.panel.background} flex flex-col gap-1 h-full`}
    aria-label="Loading plan"
  >
    {Array.from({ length: lineCount }).map((_, index) => (
      <div key={index} className="flex flex-col gap-4">
        <div
          className={`h-3.5 rounded-full bg-gradient-to-r ${appTheme.accent.shimmerFrom} ${appTheme.accent.shimmerVia} ${appTheme.accent.shimmerTo} bg-[length:200%_100%] animate-shimmer w-full`}
        />
      </div>
    ))}
  </div>
);
