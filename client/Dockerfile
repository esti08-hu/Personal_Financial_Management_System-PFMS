FROM node:18-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm run build

EXPOSE 3000

USER node

CMD ["pnpm", "start"]
