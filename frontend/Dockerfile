# ---------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ---------------------------------------------
FROM node:20-alpine AS build

# Establece el directorio de trabajo DENTRO de la carpeta frontend
WORKDIR /app/frontend

# 1. Copia package.json (y package-lock.json) desde la subcarpeta 'frontend' del host al WORKDIR del contenedor
COPY frontend/package*.json ./

# 2. Instala dependencias
RUN npm install 

# 3. Copia el resto del código fuente de 'frontend'
COPY frontend/. .

# 4. Compila la aplicación Angular para producción
# La compilación se genera en /app/frontend/dist/lebuas/browser (dentro del contenedor)
RUN npm run build -- --configuration=production

# ---------------------------------------------
# ETAPA 2: SERVIR (Base ligera de producción con Nginx)
# ---------------------------------------------
FROM nginx:alpine

# 5. Copia el archivo nginx.conf desde su ubicación en el host (frontend/nginx.conf)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 6. Copia SOLO los archivos de producción compilados a la raíz de Nginx
# La ruta de origen es: /app/frontend/dist/lebuas/browser (dentro del contenedor build)
COPY --from=build /app/frontend/dist/lebuas/browser /usr/share/nginx/html

# Expone el puerto predeterminado de Nginx
EXPOSE 80

# Comando de inicio: ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]