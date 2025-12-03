# ---------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ---------------------------------------------
FROM node:20-alpine AS build

# Establece el directorio de trabajo DENTRO de la carpeta frontend
WORKDIR /app/frontend

# Copia los archivos de dependencias para caching eficiente
COPY package*.json ./

# Instala dependencias (ci es mejor que install para builds automatizados)
RUN npm ci

# Copia el resto del código fuente (incluyendo angular.json, src, etc.)
COPY . .

# Compila la aplicación Angular para producción
# La salida se genera en: /app/frontend/dist/frontend/browser
RUN npm run build -- --configuration=production

# ---------------------------------------------
# ETAPA 2: SERVIR (Base ligera de producción con Nginx)
# ---------------------------------------------
FROM nginx:alpine

# Copia el archivo de configuración de Nginx (debe estar en el mismo contexto que el Dockerfile)
# En la etapa 1 se asumió que estaba en /app/frontend/nginx.conf, ajustamos la ruta de origen
COPY --from=build /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copia SOLO los archivos de producción compilados (HTML/CSS/JS)
# La ruta de origen es la de compilación de Angular: /app/frontend/dist/frontend/browser
# La ruta de destino es la raíz de Nginx: /usr/share/nginx/html
COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html

# Expone el puerto predeterminado de Nginx
EXPOSE 80

# Comando de inicio: ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]