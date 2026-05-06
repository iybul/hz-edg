export interface DocumentSection {
  id: string;
  title: string;
  level: number;
  body: string[];
}

export function stripMarkdownFence(markdown: string) {
  return markdown
    .replace(/^```(?:markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function parseDocumentSections(markdown: string): DocumentSection[] {
  const normalized = stripMarkdownFence(markdown);
  const sections: DocumentSection[] = [];
  let current: DocumentSection | null = null;

  for (const line of normalized.split(/\r?\n/)) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);

    if (heading) {
      current = {
        id: slugify(heading[2], sections.length),
        title: heading[2].trim(),
        level: heading[1].length,
        body: []
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        id: "overview",
        title: "Overview",
        level: 1,
        body: []
      };
      sections.push(current);
    }

    current.body.push(line);
  }

  return sections.filter((section) => section.title || section.body.some(Boolean));
}

export function markdownLineToText(line: string) {
  return line
    .replace(/^[-*]\s+/, "• ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^---+$/, "")
    .trimEnd();
}

function slugify(value: string, index: number) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? `${slug}-${index}` : `section-${index}`;
}
