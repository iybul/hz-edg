FROM rust:1-bookworm AS builder

WORKDIR /app
ARG APP_ROOT=EDGMVP
COPY ${APP_ROOT}/backend/Cargo.toml ${APP_ROOT}/backend/Cargo.lock ./
COPY ${APP_ROOT}/backend/src ./src

RUN cargo build --release

FROM debian:bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/sqf-docs-backend /usr/local/bin/sqf-docs-backend

ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8080

EXPOSE 8080
CMD ["sqf-docs-backend"]
