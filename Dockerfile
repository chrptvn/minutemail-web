# 1) Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# 2) Serve
FROM nginx:stable-alpine
# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your built files
COPY --from=builder /app/dist/minutemail-web/browser/ /usr/share/nginx/html/

# (Optional) custom nginx.conf for SPA routing / caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
