use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("OpenAI generation failed: {0}")]
    OpenAi(String),
    #[error("DOCX conversion failed: {0}")]
    Docx(String),
    #[error("invalid request: {0}")]
    BadRequest(String),
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    message: String,
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Database(_) | AppError::OpenAi(_) | AppError::Docx(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(ErrorResponse {
            message: self.to_string(),
        })
    }
}
