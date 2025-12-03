# ... Etapa 1 (Build) ...

# Copia los archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copia el código fuente completo, incluyendo server.js
COPY . . 
# <-- server.js se copia aquí.

# Compila la aplicación Angular...
RUN npm run build 

# Etapa 2: Servir con Express (Base ligera de producción)
FROM node:20-alpine

# Establece el directorio de trabajo para servir
WORKDIR /usr/app

# === CORRECCIÓN CLAVE AQUÍ ===
# Copia el archivo clave de inicio del servidor desde la Etapa 1
COPY --from=build /app/server.js . 
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

# Copia SOLO los archivos de producción compilados
COPY --from=build /app/dist/frontend/browser ./dist/frontend/browser

# Copia los archivos de dependencias y reinstala solo las de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Expone el puerto 8080
EXPOSE 8080

# Comando de inicio: ejecuta el script que inicia el servidor Express
CMD ["npm", "run", "start:prod"]