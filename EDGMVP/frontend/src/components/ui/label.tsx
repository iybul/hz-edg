import type { LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-600",
        className
      )}
      {...props}
    />
  );
}
