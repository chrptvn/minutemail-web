# ------------------
# 1) Build Stage
# ------------------
FROM node:18 AS builder

WORKDIR /app

# Copy package files first so Docker can cache installs
COPY package*.json ./

# Install dependencies (honor exact versions from package-lock.json)
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the SSR output
RUN npm run build:production

# ------------------
# 2) Runtime Stage
# ------------------
FROM node:18 AS runner

WORKDIR /usr/src/app

# Copy build artifacts from builder image
COPY --from=builder /app/dist /usr/src/app/dist

# Expose the port on which your SSR server runs (commonly 4000)
EXPOSE 8080

# Launch the SSR server
CMD ["node", "dist/minutemail-desktop/server/server.mjs"]
