import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { generateDocument } from "../../lib/api";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { GenerateDocumentResponse } from "../../types/questionnaire";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { FacilityInfoStep } from "./FacilityInfoStep";
import { GeneratingState } from "./GeneratingState";
import { HaccpStep } from "./HaccpStep";
import { InfrastructureStep } from "./InfrastructureStep";
import { useDocumentPolling } from "../../hooks/useDocumentPolling";

const steps = ["Facility Info", "HACCP Details", "Infrastructure"] as const;

export function Wizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [generation, setGeneration] = useState<GenerateDocumentResponse | null>(null);
  const form = useQuestionnaireStore((state) => state.form);
  const statusQuery = useDocumentPolling(generation?.documentId ?? null);

  const mutation = useMutation({
    mutationFn: generateDocument,
    onSuccess: (response) => {
      setGeneration(response);
    }
  });

  const currentStep = useMemo(() => {
    if (stepIndex === 0) {
      return <FacilityInfoStep />;
    }

    if (stepIndex === 1) {
      return <HaccpStep />;
    }

    return <InfrastructureStep />;
  }, [stepIndex]);

  const canSubmit = form.facility.name.trim() && form.facility.address.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-3">
          {steps.map((step, index) => {
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                  isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <span>{index + 1}</span>}
                {step}
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {currentStep}

          {mutation.isError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {mutation.error.message}
            </div>
          ) : null}

          {generation ? (
            <GeneratingState
              status={statusQuery.data}
              markdownPreview={generation.markdownPreview}
            />
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={stepIndex === 0 || mutation.isPending}
              onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
            >
              Back
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStepIndex((index) => Math.min(index + 1, steps.length - 1))}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canSubmit || mutation.isPending}
                onClick={() => mutation.mutate(form)}
              >
                {mutation.isPending ? "Generating..." : "Generate SQF Manual"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
