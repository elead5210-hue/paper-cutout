# Build stage: install dependencies and compile the Vite app into static files.
FROM node:20.19.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: serve dist/ with nginx as a non-root user on port 8000.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Deploy-Manager publishes container port 8000 (CONTAINER_APP_PORT).
EXPOSE 8000

# The base image already runs as the unprivileged "nginx" user (uid 101).
USER 101

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["wget", "--quiet", "--spider", "http://127.0.0.1:8000/"]