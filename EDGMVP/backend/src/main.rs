mod config;
mod errors;
mod models;
mod routes;
mod services;
mod state;
mod utils;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use config::Config;
use services::openai::OpenAiService;
use sqlx::postgres::PgPoolOptions;
use state::AppState;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env();
    let database_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("database connection failed");

    let state = web::Data::new(AppState {
        database_pool,
        openai: OpenAiService::new(config.openai_model.clone()),
    });

    let bind_address = format!("{}:{}", config.server_host, config.server_port);
    log::info!("starting SQF docs backend on {bind_address}");

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(Logger::default())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header(),
            )
            .configure(routes::configure)
    })
    .bind(bind_address)?
    .run()
    .await
}
