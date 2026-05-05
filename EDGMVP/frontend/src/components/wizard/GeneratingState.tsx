import { Loader2 } from "lucide-react";
import type { DocumentStatusResponse } from "../../types/questionnaire";

interface GeneratingStateProps {
  status?: DocumentStatusResponse;
  markdownPreview?: string;
}

export function GeneratingState({ status, markdownPreview }: GeneratingStateProps) {
  const isCompleted = status?.status === "completed";

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <div>
          <h3 className="font-semibold">
            {isCompleted ? "Document generation complete" : "Generating..."}
          </h3>
          <p className="text-sm text-slate-600">
            {isCompleted
              ? "The backend returned a completed status for this scaffold."
              : "Polling the backend for document status."}
          </p>
        </div>
      </div>
      {markdownPreview ? (
        <pre className="mt-4 max-h-52 overflow-auto rounded-md bg-white p-3 text-xs text-slate-700">
          {markdownPreview}
        </pre>
      ) : null}
    </div>
  );
}
