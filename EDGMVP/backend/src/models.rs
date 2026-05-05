use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateDocumentRequest {
    pub facility: FacilityInfo,
    pub haccp: HaccpDetails,
    pub infrastructure: InfrastructureDetails,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FacilityInfo {
    pub name: String,
    pub sqf_category: String,
    pub address: String,
    pub contact_email: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HaccpDetails {
    pub product_types: Vec<String>,
    pub process_flow: String,
    pub hazards: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InfrastructureDetails {
    pub building_controls: String,
    pub sanitation_program: String,
    pub allergen_controls: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateDocumentResponse {
    pub document_id: Uuid,
    pub status: DocumentStatus,
    pub markdown_preview: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentStatusResponse {
    pub document_id: Uuid,
    pub status: DocumentStatus,
    pub s3_url: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawQuestionnaireRequest {
    pub facility: Value,
    pub haccp: Value,
    pub infrastructure: Value,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum DocumentStatus {
    Pending,
    Completed,
}
