FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Jalankan Vite server dengan host flag agar bisa diakses dari luar container
CMD ["npm", "run", "dev", "--", "--host"]
