# 1) Build Stage
FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the Angular app (only browser target)
RUN npm run build

# 2) Runtime Stage (using NGINX to serve static files)
FROM nginx:stable-alpine AS runner

# Copy build output to NGINX's html directory
COPY --from=builder /app/dist/minutemail-web/browser /usr/share/nginx/html

# Optional: Replace default nginx config with custom one
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
