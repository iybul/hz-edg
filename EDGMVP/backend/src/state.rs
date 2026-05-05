use crate::services::openai::OpenAiService;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub database_pool: PgPool,
    pub openai: OpenAiService,
}
