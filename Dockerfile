# Base image with pnpm installed
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies (development dependencies for build)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Run build (which runs react-router build)
RUN pnpm build

# Production dependencies only
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Final production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy package.json to have package info if needed
COPY package.json ./
# Copy only necessary files: production node_modules and built application
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

EXPOSE 3000

# Start server using react-router-serve directly to bypass local .env loading in package.json start script
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]