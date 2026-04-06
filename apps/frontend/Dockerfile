FROM node:22 AS builder

# tsconfig.json extends "../../tsconfig.base.json"
# With WORKDIR /app/apps/frontend, that resolves to /app/tsconfig.base.json
WORKDIR /app/apps/frontend

COPY apps/frontend/package.json ./
RUN npm install

COPY tsconfig.base.json /app/tsconfig.base.json
COPY apps/frontend/ ./

RUN npx vite build

# ── Serve with nginx ──────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
