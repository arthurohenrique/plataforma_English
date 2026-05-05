type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
};

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-brandBlue">
        <span>Progresso do curso</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-brandBlue transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
