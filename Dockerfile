FROM oven/bun:alpine
WORKDIR /usr/src/app

RUN apk add --no-cache openssl nodejs npm

COPY package*.json ./
COPY bun.lockb ./

RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bun run prisma generate

COPY . .

RUN npm run build

EXPOSE ${API_PORT} ${FRONTEND_PORT}

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]