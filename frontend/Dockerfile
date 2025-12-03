# ---------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ---------------------------------------------
FROM node:20-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias para caching eficiente
COPY package*.json ./
RUN npm ci

# Copia el código fuente completo, incluyendo server.js
COPY . . 

# Compila la aplicación Angular para producción
RUN npm run build 

# ---------------------------------------------
# ETAPA 2: SERVIR (Base ligera de producción con Express)
# ---------------------------------------------
FROM node:20-alpine

# Establece el directorio de trabajo para servir
WORKDIR /usr/app

# Copia el archivo clave de inicio (server.js) desde la Etapa 1
# La corrección clave es que el archivo ahora está garantizado en /app/server.js
COPY --from=build /app/server.js . 

# Copia SOLO los archivos de producción compilados (HTML/CSS/JS)
COPY --from=build /app/dist/frontend/browser ./dist/frontend/browser

# Copia los archivos de dependencias
COPY package*.json ./

# Instala SOLO las dependencias de producción (Express, tslib, etc.)
RUN npm ci --omit=dev

# Expone el puerto que usa server.js
EXPOSE 8080

# Comando de inicio: ejecuta el script "start:prod"
CMD ["npm", "run", "start:prod"]