# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para compilar paquetes nativos (argon2, pg, etc)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluidas devDependencies para el build)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Ejecutar build (compila TypeScript, genera Vite bundles, etc)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Instalar dependencias del sistema para runtime (argon2, pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el build generado desde el stage anterior
COPY --from=builder /app/build ./

# Crear script de inicio que ejecuta migraciones y luego inicia la app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'node ace migration:run --force' >> /app/start.sh && \
    echo 'echo "Migrations completed. Starting server..."' >> /app/start.sh && \
    echo 'node bin/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Exponer puerto (Railway asigna dinámicamente el PORT)
EXPOSE 3333

# Comando de inicio
CMD ["/app/start.sh"]
