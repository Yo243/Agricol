FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    openssl \
    libc6-compat

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de package (ahora relativos a backend/)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar schema de Prisma (ahora relativo a backend/)
COPY prisma ./prisma/

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código (ahora relativo a backend/)
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar permisos
RUN chown -R nodejs:nodejs /app

# Usar usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "src/server.js"]