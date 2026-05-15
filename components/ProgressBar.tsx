type Props = {
  completed: number;
  total: number;
  label?: string;
  thin?: boolean;
};

export default function ProgressBar({ completed, total, label, thin }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-baseline justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>{label}</span>
          <span className="tabular-nums">
            {completed} / {total} · {pct}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-white/10 ${
          thin ? "h-1" : "h-1.5"
        }`}
      >
        <div
          className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
