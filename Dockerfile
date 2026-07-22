FROM node:20-alpine
WORKDIR /app

# instala dependências
COPY package*.json ./
RUN npm install

# copia o restante e gera o Prisma Client
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3333

# aplica migrations e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
