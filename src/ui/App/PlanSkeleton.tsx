type Props = {
  lineCount?: number;
};

export const PlanSkeleton = ({ lineCount = 10 }: Props) => (
  <div
    className="border border-[#efe6d6] rounded-xl p-4 bg-[#fbf8f2] flex flex-col gap-1 h-full"
    aria-label="Loading plan"
  >
    {Array.from({ length: lineCount }).map((_, index) => (
      <div key={index} className="flex flex-col gap-4">
        <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-full" />
      </div>
    ))}
  </div>
);
