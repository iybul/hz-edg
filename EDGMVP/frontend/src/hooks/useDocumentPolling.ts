import { useQuery } from "@tanstack/react-query";
import { getDocumentStatus } from "../lib/api";

export function useDocumentPolling(documentId: string | null) {
  return useQuery({
    queryKey: ["document-status", documentId],
    queryFn: () => getDocumentStatus(documentId!),
    enabled: Boolean(documentId),
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ? false : 2_500
  });
}
