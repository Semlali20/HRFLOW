# ─── Stage 1: Build Angular ──────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching.
# Both package-lock.json and yarn.lock exist; use npm ci for reproducible installs.
COPY package.json package-lock.json ./

# --legacy-peer-deps is required because Angular 16 has peer dependency
# conflicts with some transitive packages (ng-zorro-antd targets Angular 17+).
RUN npm ci --legacy-peer-deps --prefer-offline

# Copy rest of the source code
COPY . .

# Build for production.
# NODE_OPTIONS: increase heap for large Angular builds (many chart libraries).
RUN NODE_OPTIONS="--max_old_space_size=4096" \
    npx ng build --configuration=production

# ─── Stage 2: Nginx serving ──────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy Angular production build
COPY --from=builder /app/dist/skote/ /usr/share/nginx/html/

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs as non-root user (nginx:nginx) by default in the official image.
# Ensure the html directory is readable.
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
