# ---------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ---------------------------------------------
FROM node:20-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json (y package-lock.json si existe)
COPY package*.json ./

# **SOLUCIÓN AL ERROR EUSAGE:** Usamos 'npm install' para evitar el error EUSAGE si package-lock.json no está disponible.
RUN npm install 

# Copia el código fuente completo (incluyendo el nginx.conf que está en la carpeta frontend/)
COPY . .

# Compila la aplicación Angular para producción
# La compilación se genera en /app/dist/lebuas/browser
RUN npm run build -- --configuration=production

# ---------------------------------------------
# ETAPA 2: SERVIR (Base ligera de producción con Nginx)
# ---------------------------------------------
FROM nginx:alpine

# **CORRECCIÓN DEL ERROR:** Copiamos el archivo nginx.conf desde su ubicación real
# en el contexto de compilación (frontend/nginx.conf) a la configuración de Nginx.
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copia SOLO los archivos de producción compilados a la raíz de Nginx
COPY --from=build /app/dist/lebuas/browser /usr/share/nginx/html

# Expone el puerto predeterminado de Nginx
EXPOSE 80

# Comando de inicio: ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]