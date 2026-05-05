use actix_web::{get, post, web, HttpResponse};
use uuid::Uuid;

use crate::{
    errors::AppError,
    models::{
        DocumentStatus, DocumentStatusResponse, GenerateDocumentRequest, GenerateDocumentResponse,
    },
    state::AppState,
    utils::docx,
};

#[post("/api/generate")]
pub async fn generate_document(
    state: web::Data<AppState>,
    payload: web::Json<GenerateDocumentRequest>,
) -> Result<HttpResponse, AppError> {
    if payload.facility.name.trim().is_empty() {
        return Err(AppError::BadRequest("facility name is required".into()));
    }

    let markdown = state.openai.generate_sqf_manual(&payload).await?;
    let _docx_bytes = docx::markdown_to_docx(&markdown)?;

    Ok(HttpResponse::Accepted().json(GenerateDocumentResponse {
        document_id: Uuid::new_v4(),
        status: DocumentStatus::Completed,
        markdown_preview: markdown.chars().take(1_000).collect(),
    }))
}

#[get("/api/documents/{document_id}/status")]
pub async fn document_status(path: web::Path<Uuid>) -> Result<HttpResponse, AppError> {
    Ok(HttpResponse::Ok().json(DocumentStatusResponse {
        document_id: path.into_inner(),
        status: DocumentStatus::Completed,
        s3_url: None,
    }))
}
