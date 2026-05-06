import type { ReactNode } from "react";

interface StepHeaderProps {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export function StepHeader({ step, title, description, icon }: StepHeaderProps) {
  return (
    <header className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink/15 bg-white text-ink">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-scarlet">
            Step {step}
          </span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>
        <h3 className="mt-2 text-[24px] font-extrabold leading-tight tracking-tightest text-ink md:text-[28px]">
          {title}
        </h3>
        <p className="mt-1.5 text-[14px] leading-6 text-ink-600">{description}</p>
      </div>
    </header>
  );
}
