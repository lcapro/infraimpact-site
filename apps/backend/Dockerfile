FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json prisma ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
CMD ["node", "dist/server.js"]
