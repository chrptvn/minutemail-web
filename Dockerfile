# 1. Build Stage
FROM node:22 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the app and build
COPY . .
RUN npm run build

# 2. Runtime Stage
FROM node:22 AS runner

WORKDIR /app

# Install static file server globally
RUN npm install -g http-server

# Copy the built Angular browser files
COPY --from=builder /app/dist/minutemail-web/browser ./dist

# Expose Angular port
EXPOSE 4200

# Start the server
CMD ["http-server", "dist", "-p", "4200"]
