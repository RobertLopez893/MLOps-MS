# ETAPA 1: Compilación (El obrero de Node.js)
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos solo los archivos de dependencias primero (para aprovechar el caché de Docker)
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente (src, public, index.html, etc.)
COPY . .

# Compilamos la aplicación. Esto generará la carpeta "dist" con el código optimizado
RUN npm run build


# ETAPA 2: Producción (El servidor Nginx)
FROM nginx:alpine

# Copiamos el código ya compilado de la Etapa 1 a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 nativo de Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
