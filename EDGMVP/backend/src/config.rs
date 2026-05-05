use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub openai_model: String,
    pub server_host: String,
    pub server_port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/sqf_docs".into()),
            openai_model: env::var("OPENAI_MODEL").unwrap_or_else(|_| "gpt-4o".into()),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            server_port: env::var("SERVER_PORT")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(8080),
        }
    }
}
