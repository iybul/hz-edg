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
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
      <div className="flex flex-col gap-4 border-b border-ink/10 bg-cream-100 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink/15 bg-white text-ink">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-scarlet">
              Generated manual
            </span>
            <h3 className="mt-1 text-[22px] font-extrabold leading-tight tracking-tightest text-ink">
              {facilityName ? `${facilityName} SQF Manual` : "SQF Manual"}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-600">
              Review the generated manual section by section, then download the
              full document.
            </p>
          </div>
        </div>
        <Button type="button" variant="scarlet" onClick={onDownloadPdf}>
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-0 md:grid-cols-[260px_1fr]">
        <nav className="max-h-[560px] overflow-y-auto border-b border-ink/10 bg-cream-50 p-3 md:border-b-0 md:border-r">
          <p className="px-2 pb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
            Sections
          </p>
          <div className="space-y-0.5">
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition ${
                  index === activeIndex
                    ? "bg-ink text-cream-50"
                    : "text-ink-600 hover:bg-cream-100 hover:text-ink"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.16em] ${
                    index === activeIndex ? "text-cream-50/60" : "text-ink-600/60"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={section.level > 1 ? "pl-1.5" : undefined}>
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <article className="min-h-[420px] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-scarlet">
                Section {activeIndex + 1} / {sections.length}
              </span>
              <h4 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tightest text-ink md:text-[30px]">
                {activeSection.title}
              </h4>
            </div>
          </div>

          <div className="space-y-3 text-[15px] leading-7 text-ink">
            {activeSection.body.map((line, index) => (
              <MarkdownLine key={`${activeSection.id}-${index}`} line={line} />
            ))}
          </div>

          <div className="mt-10 flex justify-between gap-3 border-t border-ink/10 pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={activeIndex === sections.length - 1}
              onClick={() =>
                setActiveIndex((index) => Math.min(index + 1, sections.length - 1))
              }
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </article>
      </div>

      <details className="border-t border-ink/10 bg-cream-50 p-5">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-scarlet">
          View raw generated Markdown
        </summary>
        <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-ink/15 bg-ink p-5 font-mono text-[12px] leading-6 text-cream-50">
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
