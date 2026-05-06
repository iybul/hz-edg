import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import {
  markdownLineToText,
  parseDocumentSections,
  stripMarkdownFence
} from "../../lib/documentSections";
import { Button } from "../ui/button";

interface GeneratedDocumentReaderProps {
  markdown: string;
  facilityName?: string;
  onDownloadPdf: () => void;
}

export function GeneratedDocumentReader({
  markdown,
  facilityName,
  onDownloadPdf
}: GeneratedDocumentReaderProps) {
  const sections = useMemo(() => parseDocumentSections(markdown), [markdown]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = sections[activeIndex];
  const plainDocument = stripMarkdownFence(markdown);

  if (!activeSection) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Generated Manual
            </p>
            <h3 className="text-xl font-semibold">
              {facilityName ? `${facilityName} SQF Manual` : "SQF Manual"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Review the generated manual section by section, then download the full document.
            </p>
          </div>
        </div>
        <Button type="button" onClick={onDownloadPdf} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-0 md:grid-cols-[260px_1fr]">
        <nav className="max-h-[560px] overflow-y-auto border-b border-slate-200 p-3 md:border-b-0 md:border-r">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sections
          </p>
          <div className="space-y-1">
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-blue-100 font-medium text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <span className={section.level > 1 ? "pl-3" : undefined}>{section.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <article className="min-h-[420px] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Section {activeIndex + 1} of {sections.length}
              </p>
              <h4 className="mt-1 text-2xl font-semibold">{activeSection.title}</h4>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-7 text-slate-700">
            {activeSection.body.map((line, index) => (
              <MarkdownLine key={`${activeSection.id}-${index}`} line={line} />
            ))}
          </div>

          <div className="mt-8 flex justify-between gap-3 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={activeIndex === sections.length - 1}
              onClick={() => setActiveIndex((index) => Math.min(index + 1, sections.length - 1))}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </article>
      </div>

      <details className="border-t border-slate-200 p-5">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          View raw generated Markdown
        </summary>
        <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
          {plainDocument}
        </pre>
      </details>
    </div>
  );
}

function MarkdownLine({ line }: { line: string }) {
  const text = markdownLineToText(line);

  if (!text) {
    return <div className="h-2" />;
  }

  if (text.startsWith("• ")) {
    return <p className="pl-4">{text}</p>;
  }

  return <p>{text}</p>;
}
