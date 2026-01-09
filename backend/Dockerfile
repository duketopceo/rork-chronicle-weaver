# Chronicle Weaver Backend - Dockerfile
# Optimized for ARM64 (Mac mini) architecture
# Multi-stage build for production optimization

# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY functions/package*.json ./functions/

# Install dependencies
WORKDIR /app/functions
RUN npm ci --only=production=false

# Copy source code (from backend/ context, Docker build context is backend/)
# We're in /app, so copy to maintain structure: /app/functions/ and /app/trpc/
COPY functions/ ./functions/
COPY trpc/ ./trpc/

# Build TypeScript
# With rootDir: "../", this compiles:
# - functions/*.ts -> lib/functions/
# - trpc/**/*.ts -> lib/trpc/
WORKDIR /app/functions
RUN npm run build

# Reorganize output: move functions files up one level, keep trpc structure
RUN cd lib && \
    if [ -d "functions" ]; then mv functions/* . && rmdir functions; fi && \
    if [ -d "trpc" ]; then mv trpc ../trpc-compiled; fi

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:18-alpine AS runtime

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY functions/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /app/functions/lib ./lib
# Copy compiled trpc files to correct location
# At runtime from /app/lib/server.js, ../trpc/ resolves to /app/trpc/
COPY --from=builder /app/trpc-compiled ./trpc

# Copy any additional required files
COPY functions/package.json ./

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "lib/server.js"]
