import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { generateDocument } from "../../lib/api";
import { downloadMarkdownAsPdf } from "../../lib/pdf";
import { useQuestionnaireStore } from "../../stores/questionnaireStore";
import { GenerateDocumentResponse } from "../../types/questionnaire";
import { Button } from "../ui/button";
import { FacilityInfoStep } from "./FacilityInfoStep";
import { GeneratedDocumentReader } from "./GeneratedDocumentReader";
import { GeneratingState } from "./GeneratingState";
import { HaccpStep } from "./HaccpStep";
import { InfrastructureStep } from "./InfrastructureStep";
import { useDocumentPolling } from "../../hooks/useDocumentPolling";

const steps = ["Facility", "HACCP", "Infrastructure"] as const;

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
    <div className="overflow-hidden rounded-xl border border-cream-50/15 bg-cream-50 text-ink shadow-ink">
      <div className="border-b border-ink/10 bg-white px-6 py-7 md:px-10 md:py-9">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-scarlet">
            / Documentation Wizard
          </span>
          <h2 className="text-[28px] font-extrabold leading-tight tracking-tightest text-ink md:text-[32px]">
            Build your SQF manual
          </h2>
          <p className="max-w-2xl text-[14.5px] leading-7 text-ink-600">
            Move through the required context in a focused workflow. The more
            specific your answers are, the more useful the generated manual will
            be.
          </p>
        </div>

        <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10 md:grid-cols-3">
          {steps.map((step, index) => {
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex;
            return (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (index <= stepIndex) {
                    setStepIndex(index);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3.5 text-left transition ${
                  isActive
                    ? "bg-ink text-cream-50"
                    : isComplete
                      ? "bg-cream-100 text-ink hover:bg-cream-200"
                      : "bg-white text-ink-600"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-md font-mono text-[11px] font-medium ${
                    isActive
                      ? "bg-cream-50 text-ink"
                      : isComplete
                        ? "bg-scarlet text-white"
                        : "border border-ink/15 bg-white text-ink-600"
                  }`}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : `0${index + 1}`}
                </span>
                <div>
                  <div
                    className={`font-mono text-[10.5px] uppercase tracking-[0.18em] ${
                      isActive ? "text-cream-50/60" : "text-ink-600"
                    }`}
                  >
                    Step {index + 1}
                  </div>
                  <div className="text-[14px] font-semibold tracking-tight">
                    {step}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-cream-50 px-6 py-8 md:px-10 md:py-10">
        <div className="space-y-10">
          {currentStep}

          {mutation.isError ? (
            <div className="rounded-md border border-scarlet/30 bg-scarlet-50 p-4 text-[13.5px] text-scarlet-700">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-scarlet-600">
                Error
              </span>
              <p className="mt-1">{mutation.error.message}</p>
            </div>
          ) : null}

          {generation ? <GeneratingState status={statusQuery.data} /> : null}

          {generation?.markdownContent ? (
            <GeneratedDocumentReader
              markdown={generation.markdownContent}
              facilityName={form.facility.name}
              onDownloadPdf={() =>
                downloadMarkdownAsPdf(
                  generation.markdownContent,
                  `${form.facility.name || "sqf-manual"}-food-safety-manual.pdf`
                )
              }
            />
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              disabled={stepIndex === 0 || mutation.isPending}
              onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
            >
              ← Back
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() =>
                  setStepIndex((index) => Math.min(index + 1, steps.length - 1))
                }
              >
                Continue →
              </Button>
            ) : (
              <Button
                type="button"
                variant="scarlet"
                disabled={!canSubmit || mutation.isPending}
                onClick={() => mutation.mutate(form)}
              >
                {mutation.isPending ? "Generating…" : "Generate SQF manual"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
