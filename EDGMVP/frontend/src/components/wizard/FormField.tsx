import type { ReactNode } from "react";
import { Label } from "../ui/label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, htmlFor, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-[12.5px] leading-5 text-ink-600">{hint}</p>
      ) : null}
    </div>
  );
}
