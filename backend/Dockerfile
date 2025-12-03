FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    openssl \
    libc6-compat

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar schema de Prisma
COPY prisma ./prisma/

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "src/server.js"]