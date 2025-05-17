FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Budowanie backendu
RUN npm run build
# Budowanie frontu
WORKDIR /app/bakemania-spa
RUN npm install
RUN npm run build
# Powrót do katalogu głównego backendu
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]