FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json yarn.lock* ./

RUN yarn install --frozen-lockfile

FROM base AS builder

COPY . .

RUN yarn build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["yarn", "start"]
