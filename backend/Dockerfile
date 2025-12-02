FROM node:18-alpine

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --production=false

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar permisos
RUN chown -R nodejs:nodejs /app

# Usar usuario no-root
USER nodejs

# Exponer puerto (Railway usa variable PORT)
EXPOSE 3000

# Comando de inicio
CMD ["node", "src/server.js"]
