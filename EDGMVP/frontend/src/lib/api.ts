import type {
  DocumentStatusResponse,
  GenerateDocumentResponse,
  QuestionnaireForm
} from "../types/questionnaire";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function generateDocument(form: QuestionnaireForm) {
  return request<GenerateDocumentResponse>("/api/generate", {
    method: "POST",
    body: JSON.stringify(form)
  });
}

export function getDocumentStatus(documentId: string) {
  return request<DocumentStatusResponse>(`/api/documents/${documentId}/status`);
}
