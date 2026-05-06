import { CheckCircle2, Loader2 } from "lucide-react";
import type { DocumentStatusResponse } from "../../types/questionnaire";

interface GeneratingStateProps {
  status?: DocumentStatusResponse;
}

export function GeneratingState({ status }: GeneratingStateProps) {
  const isCompleted = status?.status === "completed";

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        )}
        <div>
          <h3 className="font-semibold">
            {isCompleted ? "Document generation complete" : "Generating..."}
          </h3>
          <p className="text-sm text-slate-600">
            {isCompleted
              ? "Your generated SQF manual is ready to review below."
              : "Polling the backend for document status."}
          </p>
        </div>
      </div>
    </div>
  );
}
