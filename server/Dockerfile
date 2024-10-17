FROM node:20.9 as base

WORKDIR /app
COPY --chown=node:node package*.json ./
COPY --chown=node:node pnpm-lock.yaml ./
COPY --chown=node:node docker-entrypoint.sh /app/

# Ensure the script is executable
RUN chmod +x /app/docker-entrypoint.sh

# Install pnpm globally is not recommanded. instead install it locally  `npm install -D pnpm`
RUN npm install -g pnpm 

RUN pnpm install

COPY --chown=node:node . .

EXPOSE ${PORT}

FROM base AS dev
CMD ["sh" , "docker-entrypoint.sh", "dev"]
