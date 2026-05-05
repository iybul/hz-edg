mod generate;
mod health;

use actix_web::web;

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(health::health_check)
        .service(generate::generate_document)
        .service(generate::document_status);
}
