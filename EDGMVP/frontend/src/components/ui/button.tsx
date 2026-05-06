import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "scarlet" | "inverse";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-cream-50 border border-ink hover:bg-ink-800 hover:border-ink-800",
  scarlet:
    "bg-scarlet text-white border border-scarlet hover:bg-scarlet-600 hover:border-scarlet-600",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-ink hover:bg-ink/5",
  inverse:
    "bg-cream-50 text-ink border border-cream-50 hover:bg-white hover:border-white",
  ghost:
    "bg-transparent text-ink-600 border border-transparent hover:bg-ink/5 hover:text-ink"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
