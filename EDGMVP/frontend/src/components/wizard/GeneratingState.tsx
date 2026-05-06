import { Check, Loader2 } from "lucide-react";
import type { DocumentStatusResponse } from "../../types/questionnaire";

interface GeneratingStateProps {
  status?: DocumentStatusResponse;
}

export function GeneratingState({ status }: GeneratingStateProps) {
  const isCompleted = status?.status === "completed";

  return (
    <div className="flex items-start gap-4 rounded-md border border-ink/10 bg-white p-5">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
          isCompleted ? "bg-scarlet text-white" : "bg-ink text-cream-50"
        }`}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>
      <div className="flex-1">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
          {isCompleted ? "Complete" : "Generating"}
        </span>
        <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-ink">
          {isCompleted
            ? "Document generation complete"
            : "Generating your SQF manual…"}
        </h3>
        <p className="mt-1 text-[13.5px] leading-6 text-ink-600">
          {isCompleted
            ? "Your generated SQF manual is ready to review below."
            : "Polling the backend for document status."}
        </p>
      </div>
    </div>
  );
}
