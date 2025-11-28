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

# Comando de inicio
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
