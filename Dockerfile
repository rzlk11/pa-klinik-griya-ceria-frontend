# Stage 1: Build aplikasi React dengan Vite
FROM node:20-alpine AS build

WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin semua source code
COPY . .

# Terima build argument untuk API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Jalankan proses build untuk memproduksi folder dist/
RUN npm run build

# Stage 2: Serve aplikasi menggunakan Nginx
FROM nginx:alpine

# Hapus default konfigurasi nginx
RUN rm -rf /usr/share/nginx/html/*

# Salin file konfigurasi nginx khusus untuk SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin folder dist/ dari stage build ke nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 untuk web server nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
