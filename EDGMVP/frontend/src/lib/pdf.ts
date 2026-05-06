import { jsPDF } from "jspdf";
import { markdownLineToText, stripMarkdownFence } from "./documentSections";

export function downloadMarkdownAsPdf(markdown: string, filename: string) {
  const document = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (height: number) => {
    if (y + height <= pageHeight - margin) {
      return;
    }

    document.addPage();
    y = margin;
  };

  for (const rawLine of stripMarkdownFence(markdown).split(/\r?\n/)) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(rawLine);
    const text = heading ? heading[2].trim() : markdownLineToText(rawLine).trim();

    if (!text) {
      y += 8;
      continue;
    }

    const fontSize = heading ? headingSize(heading[1].length) : 10;
    const lineHeight = heading ? fontSize + 8 : 15;
    const fontStyle = heading ? "bold" : "normal";
    const lines = document.splitTextToSize(text, contentWidth);

    addPageIfNeeded(lines.length * lineHeight + 8);
    document.setFont("helvetica", fontStyle);
    document.setFontSize(fontSize);
    document.text(lines, margin, y);
    y += lines.length * lineHeight + (heading ? 10 : 2);
  }

  document.save(filename);
}

function headingSize(level: number) {
  if (level === 1) {
    return 18;
  }

  if (level === 2) {
    return 14;
  }

  return 12;
}
