FROM node:22-bookworm-slim AS builder

WORKDIR /app
COPY EDGMVP/frontend/package*.json ./
RUN npm install
COPY EDGMVP/frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY EDGMVP/docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

ENV API_UPSTREAM=http://backend:8080
ENV NGINX_RESOLVER=127.0.0.11

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
