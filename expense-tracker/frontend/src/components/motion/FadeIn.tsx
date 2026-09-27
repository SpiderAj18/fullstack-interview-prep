import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: 1 | 2 | 3 | 4 | 5;
  variant?: "up" | "in" | "scale";
};

export function FadeIn({
  children,
  className,
  stagger,
  variant = "up",
}: FadeInProps) {
  const animation =
    variant === "in" ? "animate-fade-in" : variant === "scale" ? "animate-scale-in" : "animate-fade-up";

  return (
    <div className={cn(animation, stagger ? `stagger-${stagger}` : undefined, className)}>
      {children}
    </div>
  );
}
