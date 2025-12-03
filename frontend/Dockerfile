# Etapa 1: Build de Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build -- --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar la build de Angular al directorio de nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]