# Builder stage
FROM node:20-alpine AS builder
# Add build dependencies as a virtual package that we can easily remove later
RUN apk add --no-cache --virtual .build-deps python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build the app, then remove development dependencies, clean cache,
# and remove the build tools, all in a single layer to optimize size.
RUN npm run build \
 && npm prune --omit=dev \
 && npm cache clean --force \
 && apk del .build-deps

# Runtime stage
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy artifacts from the builder stage, setting ownership at the same time
COPY --from=builder /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/build ./

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3333

# The command to run the application
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
