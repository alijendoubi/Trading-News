FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock* ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 5000

CMD ["yarn", "start"]
