# Etapa 1: Build de Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copia solo los archivos de configuración de dependencias para caching eficiente
COPY package*.json ./
RUN npm ci

# Copia el código fuente y el servidor de archivos estáticos
COPY . .
# El script "build" que definiste en package.json (ng build --configuration production)
RUN npm run build 

# Etapa 2: Servir con Express (Base ligera)
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /usr/app

# Copia solo los archivos esenciales para servir:
# 1. El script del servidor (server.js)
COPY server.js .

# 2. Los archivos compilados (la carpeta 'browser' y 'server')
# NOTA: Asegúrate que esta ruta coincida con el output real de tu build.
COPY --from=build /app/dist/frontend/browser ./dist/frontend/browser

# Copia el package.json y package-lock.json de la etapa de build
# Esto asegura que Express y otras dependencias de producción se instalen
COPY package*.json ./
RUN npm ci --omit=dev

# Railway usa el puerto 8080 por defecto, lo exponemos y lo usamos en server.js
EXPOSE 8080

# Comando para iniciar el servidor de Express
# El puerto 8080 lo configura el server.js o Railway (process.env.PORT)
CMD ["npm", "run", "start:prod"]