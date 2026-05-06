export type DocumentStatus = "pending" | "completed";

export interface FacilityInfo {
  name: string;
  sqfCategory: string;
  address: string;
  contactEmail: string;
}

export interface HaccpDetails {
  productTypes: string[];
  processFlow: string;
  hazards: string[];
}

export interface InfrastructureDetails {
  buildingControls: string;
  sanitationProgram: string;
  allergenControls: string;
}

export interface QuestionnaireForm {
  facility: FacilityInfo;
  haccp: HaccpDetails;
  infrastructure: InfrastructureDetails;
}

export interface GenerateDocumentResponse {
  documentId: string;
  status: DocumentStatus;
  markdownContent: string;
  markdownPreview: string;
}

export interface DocumentStatusResponse {
  documentId: string;
  status: DocumentStatus;
  s3Url: string | null;
}
