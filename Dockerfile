FROM node:18.11.0-alpine3.16
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot
COPY package.json /usr/src/bot
RUN apk add --no-cache \
  build-base \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev
RUN npm install
COPY . /usr/src/bot
CMD [ "node", "./src/index.js" ]