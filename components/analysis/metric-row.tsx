import { cn } from "@/lib/utils/cn";

interface MetricRowProps {
  label: string;
  value: string;
  verdict?: string;
  className?: string;
}

export function MetricRow({ label, value, verdict, className }: MetricRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3",
        className,
      )}
    >
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {verdict ? (
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
            {verdict}
          </div>
        ) : null}
      </div>
      <div className="text-right text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}
