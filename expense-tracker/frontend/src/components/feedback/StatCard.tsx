import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/feedback/Skeleton";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
  stagger?: 1 | 2 | 3 | 4 | 5;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  className,
  stagger = 1,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 animate-fade-up",
        `stagger-${stagger}`,
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
            )}
            {hint ? <div className="text-sm text-muted-foreground">{hint}</div> : null}
          </div>
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
