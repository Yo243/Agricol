# ---------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ---------------------------------------------
FROM node:20-alpine AS build

# Establece el directorio de trabajo (asumimos que este es el directorio frontend)
WORKDIR /app

# Copia package.json (y package-lock.json si existe)
COPY package*.json ./

# **SOLUCIÓN AL ERROR EUSAGE:** Usamos 'npm install' en lugar de 'npm ci'
# 'npm ci' requiere el archivo package-lock.json. 
RUN npm install 

# Copia el código fuente completo
COPY . .

# Compila la aplicación Angular para producción
# La compilación se genera en /app/dist/{nombre-proyecto}/browser
RUN npm run build -- --configuration=production

# ---------------------------------------------
# ETAPA 2: SERVIR (Base ligera de producción con Nginx)
# ---------------------------------------------
FROM nginx:alpine

# Copia el archivo de configuración de Nginx.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia SOLO los archivos de producción compilados a la raíz de Nginx
# NOTA: Ajusté la ruta de /app/dist/lebuas/browser a /app/dist/frontend/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Expone el puerto predeterminado de Nginx
EXPOSE 80

# Comando de inicio: ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]